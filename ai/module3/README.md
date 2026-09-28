# Smart Parking — Occupancy Prediction

## Module 3 — AI-3

This module predicts parking occupancy using historical parking data.

## Pipeline

Historical Parking Data
        ↓
Data Preprocessing
        ↓
Feature Engineering
        ↓
Exploratory Data Analysis
        ↓
Model Training
        ↓
Model Evaluation
        ↓
Best Model
        ↓
Occupancy Prediction

## Dataset

The master parking dataset contains:

- date
- time
- day_of_week
- day_of_week_num
- is_weekend
- parking_area_id
- total_slots
- occupied_slots
- available
- occupancy
- distance
- price
- user_selected

For Module 3, the occupancy prediction model uses the relevant parking/time/history features rather than the recommendation-specific fields.

## Features Used

The model uses:

- hour
- day_of_week_num
- is_weekend
- month
- previous_occupancy
- total_slots
- parking_area_id

## Target

The target variable is:

`target_occupancy`

The target represents the occupancy at the next recorded time period for the same parking area.

## Models Tested

Three regression models were evaluated:

1. Linear Regression
2. Random Forest Regressor
3. Gradient Boosting Regressor

## Evaluation Metrics

The models were evaluated using:

- MAE
- RMSE
- R² Score

## Selected Model

Gradient Boosting Regressor

Test performance:

- MAE: 3.434
- RMSE: 4.322
- R²: 0.898

## Saved Model

The trained model is saved as:

`models/occupancy_model.pkl`

## Prediction Function

The prediction module provides:

`predict_occupancy()`

Inputs:

- date
- time
- parking_area_id
- total_slots
- previous_occupancy

Example:

```python
result = predict_occupancy(
    date="2026-10-01",
    time="18:00",
    parking_area_id="A01",
    total_slots=100,
    previous_occupancy=65
)