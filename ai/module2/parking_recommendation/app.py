from flask import Flask, request, jsonify
import pandas as pd
import joblib


app = Flask(__name__)


model = joblib.load(
    "model/parking_model.pkl"
)


features = [
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
    "reserved"
]


@app.route("/")
def home():

    return jsonify({
        "message": "Smart Urban Parking Recommendation API"
    })


@app.route("/recommend", methods=["POST"])
def recommend():

    data = request.get_json()

    parking_slots = pd.DataFrame(data)

    available_slots = parking_slots[
        parking_slots["availability"] == 1
    ].copy()

    if available_slots.empty:

        return jsonify({
            "message": "No parking slots available"
        })


    available_slots["score"] = model.predict_proba(
        available_slots[features]
    )[:, 1]


    available_slots = available_slots.sort_values(
        "score",
        ascending=False
    )


    recommendations = available_slots[
        [
            "slot_id",
            "distance_m",
            "walking_time_min",
            "parking_fee",
            "occupancy",
            "score"
        ]
    ].head(5)


    return jsonify(
        recommendations.to_dict(orient="records")
    )


if __name__ == "__main__":

    app.run(debug=True)