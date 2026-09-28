from pathlib import Path
import joblib
import pandas as pd


# --------------------------------------------------
# MODEL PATH
# --------------------------------------------------

CURRENT_DIR = Path(__file__).resolve().parent
MODEL_PATH = CURRENT_DIR.parent / "models" / "occupancy_model.pkl"

# Load trained model
model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# PREDICTION FUNCTION
# --------------------------------------------------

def predict_occupancy(
    date,
    time,
    parking_area_id,
    total_slots,
    previous_occupancy
):
    """
    Predict parking occupancy.

    Parameters
    ----------
    date : str
        Date in YYYY-MM-DD format.

    time : str
        Time in HH:MM format.

    parking_area_id : str
        Parking area identifier such as A01, A02, etc.

    total_slots : int
        Total parking slots.

    previous_occupancy : float
        Previous occupancy percentage.

    Returns
    -------
    dict
        Predicted occupancy percentage
        and available slots.
    """

    # Convert date
    date = pd.to_datetime(date)

    # Extract time features
    hour = pd.to_datetime(time).hour

    # Extract month
    month = date.month

    # Monday = 1 ... Sunday = 7
    day_of_week_num = date.dayofweek + 1

    # Weekend flag
    is_weekend = 1 if day_of_week_num >= 6 else 0

    # Create input dataframe
    input_data = pd.DataFrame([{
        "hour": hour,
        "day_of_week_num": day_of_week_num,
        "is_weekend": is_weekend,
        "month": month,
        "previous_occupancy": previous_occupancy,
        "total_slots": total_slots
    }])

    # Find parking-area columns used during training
    parking_columns = [
        column
        for column in model.feature_names_in_
        if column.startswith("parking_area_id_")
    ]

    # Initialize all parking-area columns to 0
    for column in parking_columns:
        input_data[column] = 0

    # Activate selected parking area
    parking_column = f"parking_area_id_{parking_area_id}"

    if parking_column in input_data.columns:
        input_data[parking_column] = 1
    else:
        raise ValueError(
            f"Unknown parking area: {parking_area_id}"
        )

    # Ensure exact same feature order as training
    input_data = input_data[
        model.feature_names_in_
    ]

    # Make prediction
    predicted_occupancy = model.predict(
        input_data
    )[0]

    # Keep prediction within valid range
    predicted_occupancy = max(
        0,
        min(100, predicted_occupancy)
    )

    # Calculate occupied slots
    predicted_occupied_slots = round(
        total_slots * predicted_occupancy / 100
    )

    # Calculate available slots
    available_slots = (
        total_slots - predicted_occupied_slots
    )

    return {
        "predicted_occupancy": float(
            round(predicted_occupancy, 2)
        ),
        "available_slots": int(
            available_slots
        )
    }