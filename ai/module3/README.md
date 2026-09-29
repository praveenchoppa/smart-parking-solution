# AI Module 3 — Parking Occupancy Prediction

## 1. Overview

AI Module 3 predicts the occupancy of a parking area for the next time period.

Unlike the parking slot detection module, which determines the current parking situation, this module focuses on predicting future occupancy.

The prediction is primarily intended for the Admin Dashboard and analytics.

---

## 2. Objective

The objective of this module is to predict:

> **Next-hour parking occupancy percentage for a selected parking area.**

The model uses historical occupancy, current occupancy, time-related features, parking area information, and parking capacity.

The output includes:

- Predicted occupancy percentage
- Predicted occupied slots
- Predicted available slots

---

## 3. Dataset

The module uses a prepared/simulated parking dataset for prototype development.

Dataset characteristics:

- 31,025 records
- 5 parking areas
- Hourly parking observations
- Date and time information
- Occupancy information
- Parking capacity information

### Dataset fields

| Field | Description |
|---|---|
| `date` | Date of parking observation |
| `time` | Time of observation |
| `day_of_week` | Day name |
| `day_of_week_num` | Numerical day-of-week feature |
| `is_weekend` | Weekend indicator |
| `parking_area_id` | Parking area identifier |
| `total_slots` | Total parking capacity |
| `occupied_slots` | Currently occupied slots |
| `available` | Available parking slots |
| `occupancy` | Occupancy percentage |
| `distance` | Distance-related parking information |
| `price` | Parking price |
| `user_selected` | User selection information |

> The dataset is prepared/simulated for prototype evaluation. Model performance should not be interpreted as real-world parking accuracy.

---

## 4. Data Preprocessing

The following preprocessing steps were performed:

1. Loaded the parking dataset.
2. Checked dataset shape and data types.
3. Checked for missing values.
4. Checked for duplicate records.
5. Validated parking slot consistency.
6. Validated occupancy values.
7. Converted date and time into usable features.
8. Sorted records chronologically for each parking area.
9. Created previous occupancy features.
10. Created the next-hour occupancy target.
11. Removed records without the required historical/future values.
12. Applied one-hot encoding to the parking area.

---

## 5. Target Variable

The target variable is:

```text
target_occupancy