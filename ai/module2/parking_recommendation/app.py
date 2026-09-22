import os
import logging

from flask import Flask, request, jsonify
import pandas as pd
import joblib


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI2_Recommendation")

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "parking_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    logger.info("Loaded recommendation model from %s", MODEL_PATH)
except Exception as exc:
    logger.error("Failed to load recommendation model: %s", exc)
    model = None


FEATURE_COLUMNS = [
    "zone",
    "slot_type",
    "distance_m",
    "walking_time_min",
    "parking_fee",
    "occupancy",
    "availability",
    "distance_destination_m",
    "traffic_level",
    "weather",
    "ev_charging",
    "reserved",
]

NUMERIC_COLUMNS = [
    "distance_m",
    "walking_time_min",
    "parking_fee",
    "occupancy",
    "availability",
    "distance_destination_m",
    "ev_charging",
    "reserved",
]

CATEGORICAL_COLUMNS = [
    "zone",
    "slot_type",
    "traffic_level",
    "weather",
]

REQUIRED_COLUMNS = ["slot_id"] + FEATURE_COLUMNS

RESPONSE_COLUMNS = [
    "slot_id",
    "distance_m",
    "walking_time_min",
    "parking_fee",
    "occupancy",
    "score",
]


def error_response(message, code, status_code):
    return jsonify({"error": message, "code": code}), status_code


def normalize_request_payload(data):
    if data is None:
        return None, "Request body must be valid JSON.", "INVALID_JSON"

    if isinstance(data, dict):
        if "slots" in data and isinstance(data["slots"], list):
            data = data["slots"]
        else:
            data = [data]

    if not isinstance(data, list):
        return None, "Request body must be a JSON array of parking slot objects.", "INVALID_REQUEST_FORMAT"

    return data, None, None


def validate_records(records):
    if len(records) == 0:
        return None, "empty"

    if not all(isinstance(record, dict) for record in records):
        return None, "Each parking slot entry must be a JSON object."

    normalized_records = []
    for index, record in enumerate(records):
        normalized = {}
        missing_fields = []

        for field in REQUIRED_COLUMNS:
            if field not in record or record[field] is None:
                missing_fields.append(field)
            else:
                normalized[field] = record[field]

        if missing_fields:
            return None, (
                f"Slot entry at index {index} is missing required fields: "
                + ", ".join(missing_fields)
            )

        normalized_records.append(normalized)

    return normalized_records, None


def build_dataframe(records):
    dataframe = pd.DataFrame(records)

    for column in NUMERIC_COLUMNS:
        dataframe[column] = pd.to_numeric(dataframe[column], errors="coerce")

    if dataframe[NUMERIC_COLUMNS].isnull().any().any():
        invalid_columns = (
            dataframe[NUMERIC_COLUMNS]
            .isnull()
            .any()
            .loc[lambda series: series]
            .index.tolist()
        )
        return None, f"Invalid numeric values for fields: {', '.join(invalid_columns)}"

    for column in CATEGORICAL_COLUMNS:
        dataframe[column] = dataframe[column].astype(str).str.strip()

    dataframe["slot_id"] = dataframe["slot_id"].astype(str).str.strip()
    return dataframe, None


def serialize_recommendations(dataframe):
    recommendations = []
    for _, row in dataframe.iterrows():
        recommendations.append(
            {
                "slot_id": row["slot_id"],
                "distance_m": float(row["distance_m"]),
                "walking_time_min": float(row["walking_time_min"]),
                "parking_fee": float(row["parking_fee"]),
                "occupancy": float(row["occupancy"]),
                "score": round(float(row["score"]), 6),
            }
        )
    return recommendations


@app.route("/")
def home():
    return jsonify(
        {
            "message": "Smart Urban Parking Recommendation API",
            "modelLoaded": model is not None,
            "endpoints": {
                "recommend": "POST /recommend",
            },
        }
    ), 200


@app.route("/recommend", methods=["POST"])
def recommend():
    if model is None:
        return error_response(
            "Recommendation model is not loaded on the server.",
            "MODEL_NOT_LOADED",
            503,
        )

    if not request.is_json:
        return error_response(
            "Content-Type must be application/json.",
            "INVALID_CONTENT_TYPE",
            400,
        )

    payload, error_message, error_code = normalize_request_payload(request.get_json(silent=True))
    if payload is None:
        return error_response(error_message, error_code, 400)

    records, validation_error = validate_records(payload)
    if validation_error == "empty":
        return jsonify({"message": "No parking slots available"}), 200

    if validation_error is not None:
        return error_response(validation_error, "VALIDATION_ERROR", 400)

    parking_slots, dataframe_error = build_dataframe(records)
    if dataframe_error is not None:
        return error_response(dataframe_error, "VALIDATION_ERROR", 400)

    available_slots = parking_slots[parking_slots["availability"] == 1].copy()
    if available_slots.empty:
        return jsonify({"message": "No parking slots available"}), 200

    try:
        available_slots["score"] = model.predict_proba(available_slots[FEATURE_COLUMNS])[:, 1]
    except Exception as exc:
        logger.exception("Model prediction failed")
        return error_response(
            "Recommendation model could not score the supplied parking slots.",
            "MODEL_PREDICTION_FAILED",
            500,
        )

    available_slots = available_slots.sort_values("score", ascending=False)
    top_recommendations = available_slots[RESPONSE_COLUMNS].head(5)
    return jsonify(serialize_recommendations(top_recommendations)), 200


@app.errorhandler(404)
def handle_not_found(_error):
    return error_response("Endpoint not found.", "NOT_FOUND", 404)


@app.errorhandler(405)
def handle_method_not_allowed(_error):
    return error_response("Method not allowed.", "METHOD_NOT_ALLOWED", 405)


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    logger.exception("Unexpected AI-2 error: %s", error)
    return error_response(
        "An unexpected error occurred while processing the recommendation request.",
        "INTERNAL_ERROR",
        500,
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", debug=debug, port=port)
