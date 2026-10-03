import os
import sys
import logging
from flask import Flask, request, jsonify

# Add src to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "src")))

try:
    from prediction import predict_occupancy
except ImportError:
    from src.prediction import predict_occupancy

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI3_OccupancyPrediction")

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "service": "AI-3 Parking Occupancy Prediction API",
        "status": "UP",
        "endpoints": {
            "predict": "POST /predict"
        }
    }), 200

@app.route("/predict", methods=["POST"])
def predict():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json.", "code": "INVALID_CONTENT_TYPE"}), 400

    data = request.get_json(silent=True) or {}
    
    required_fields = ["date", "time", "parkingAreaId", "totalSlots", "previousOccupancy", "currentOccupancy"]
    missing = [f for f in required_fields if f not in data or data[f] is None]
    if missing:
        return jsonify({
            "error": f"Missing required payload fields: {', '.join(missing)}",
            "code": "MISSING_FIELDS"
        }), 400

    try:
        result = predict_occupancy(
            date=str(data["date"]),
            time=str(data["time"]),
            parking_area_id=str(data["parkingAreaId"]),
            total_slots=int(data["totalSlots"]),
            previous_occupancy=float(data["previousOccupancy"]),
            current_occupancy=float(data["currentOccupancy"])
        )
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({"error": str(ve), "code": "VALIDATION_ERROR"}), 400
    except Exception as e:
        logger.exception("AI-3 Prediction failed: %s", e)
        return jsonify({"error": "Prediction processing failed.", "code": "PREDICTION_FAILED"}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
