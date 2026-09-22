import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix


DATA_PATH = "dataset/parking_recommendation.csv"
MODEL_PATH = "model/parking_model.pkl"


df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully")
print("Number of rows:", len(df))
print("Number of columns:", len(df.columns))

df = df.dropna()


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

target = "recommended"


X = df[features]
y = df[target]


categorical_features = [
    "zone",
    "slot_type",
    "traffic_level",
    "weather"
]

numerical_features = [
    "distance_m",
    "walking_time_min",
    "parking_fee",
    "occupancy",
    "availability",
    "distance_destination_m",
    "ev_charging",
    "reserved"
]


preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features
        ),
        (
            "numerical",
            "passthrough",
            numerical_features
        )
    ]
)


model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)


pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model)
    ]
)


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\nTraining model...")

pipeline.fit(X_train, y_train)

print("Training completed")


y_pred = pipeline.predict(X_test)


accuracy = accuracy_score(y_test, y_pred)

print("\nModel Accuracy:")
print(round(accuracy, 4))


print("\nClassification Report:")
print(classification_report(y_test, y_pred))


print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


os.makedirs("model", exist_ok=True)

joblib.dump(pipeline, MODEL_PATH)

print("\nModel saved to:")
print(MODEL_PATH)