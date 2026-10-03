from pathlib import Path
import joblib
import pandas as pd


# --------------------------------------------------
# MODEL PATH
# --------------------------------------------------

CURRENT_DIR = Path(__file__).resolve().parent

MODEL_PATH = (
    CURRENT_DIR.parent /
    "models" /
    "occupancy_model.pkl"
)

# Load trained V2 model
model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# PREDICTION FUNCTION
# --------------------------------------------------

def predict_occupancy(
    date,
    time,
    parking_area_id,
    total_slots,
    previous_occupancy,
    current_occupancy
):
    """
    Predict next-hour parking occupancy.

    Parameters
    ----------
    date : str
        Date in YYYY-MM-DD format.

    time : str
        Current time in HH:MM format.

    parking_area_id : str
        Parking area identifier such as A01, A02, etc.

    total_slots : int
        Total parking slots.

    previous_occupancy : float
        Occupancy percentage at the previous time period.

    current_occupancy : float
        Current occupancy percentage.

    Returns
    -------
    dict
        Predicted occupancy percentage
        and available slots.
    """

    # Normalize parking_area_id (e.g., 2, "2", "area-2", "A02" -> "A02")
    if isinstance(parking_area_id, (int, float)) or (isinstance(parking_area_id, str) and parking_area_id.isdigit()):
        parking_area_id = f"A{int(parking_area_id):02d}"
    elif isinstance(parking_area_id, str) and parking_area_id.lower().startswith("area-"):
        num_part = parking_area_id.lower().replace("area-", "")
        if num_part.isdigit():
            parking_area_id = f"A{int(num_part):02d}"
    elif isinstance(parking_area_id, str):
        parking_area_id = parking_area_id.upper()

    if not 0 <= previous_occupancy <= 100:
        raise ValueError(
            "previous_occupancy must be between 0 and 100"
        )

    if not 0 <= current_occupancy <= 100:
        raise ValueError(
            "current_occupancy must be between 0 and 100"
        )

    if total_slots <= 0:
        raise ValueError(
            "total_slots must be greater than 0"
        )

    # --------------------------------------------------
    # DATE AND TIME FEATURES
    # --------------------------------------------------

    date = pd.to_datetime(
        date,
        format="%Y-%m-%d"
    )

    time_value = pd.to_datetime(
        time,
        format="%H:%M"
    )

    hour = time_value.hour

    month = date.month

    # Training data uses:
    # Monday = 0 ... Sunday = 6
    day_of_week_num = date.dayofweek

    # Training data uses:
    # Monday-Friday = 0
    # Saturday-Sunday = 1
    is_weekend = (
        1 if day_of_week_num >= 5 else 0
    )

    # --------------------------------------------------
    # V2 FEATURE
    # --------------------------------------------------

    occupancy_change = (
        current_occupancy -
        previous_occupancy
    )

    # --------------------------------------------------
    # CREATE INPUT DATAFRAME
    # --------------------------------------------------

    input_data = pd.DataFrame([{
        "hour": hour,
        "day_of_week_num": day_of_week_num,
        "is_weekend": is_weekend,
        "month": month,
        "previous_occupancy": previous_occupancy,
        "current_occupancy": current_occupancy,
        "occupancy_change": occupancy_change,
        "total_slots": total_slots
    }])

    # --------------------------------------------------
    # PARKING AREA ENCODING
    # --------------------------------------------------

    parking_columns = [
        column
        for column in model.feature_names_in_
        if column.startswith("parking_area_id_")
    ]

    # A01 is the baseline category because
    # drop_first=True was used during training.
    known_areas = {"A01"}

    for column in parking_columns:
        known_areas.add(
            column.replace(
                "parking_area_id_",
                ""
            )
        )

    if parking_area_id not in known_areas:
        raise ValueError(
            f"Unknown parking area: {parking_area_id}"
        )

    # Initialize parking-area dummy columns
    for column in parking_columns:
        input_data[column] = 0

    # Activate selected area
    # A01 is represented by all zeros.
    if parking_area_id != "A01":
        parking_column = (
            f"parking_area_id_{parking_area_id}"
        )

        input_data[parking_column] = 1

    # --------------------------------------------------
    # MATCH TRAINING FEATURE ORDER
    # --------------------------------------------------

    input_data = input_data[
        model.feature_names_in_
    ]

    # --------------------------------------------------
    # PREDICTION
    # --------------------------------------------------

    predicted_occupancy = model.predict(
        input_data
    )[0]

    # Keep prediction within valid range
    predicted_occupancy = max(
        0,
        min(100, predicted_occupancy)
    )

    # --------------------------------------------------
    # CALCULATE SLOTS
    # --------------------------------------------------

    predicted_occupied_slots = round(
        total_slots *
        predicted_occupancy /
        100
    )

    available_slots = (
        total_slots -
        predicted_occupied_slots
    )

    # --------------------------------------------------
    # RETURN RESULT
    # --------------------------------------------------

    return {
        "predicted_occupancy": float(
            round(
                predicted_occupancy,
                2
            )
        ),
        "predicted_occupied_slots": int(
            predicted_occupied_slots
        ),
        "available_slots": int(
            available_slots
        )
    }


