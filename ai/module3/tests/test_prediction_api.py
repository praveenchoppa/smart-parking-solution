import unittest
import os
import sys
import json

# Ensure module3 root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

class TestAI3PredictionAPI(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_home_endpoint(self):
        """Test GET / returns 200 OK and service metadata."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data.get("status"), "UP")

    def test_predict_valid_payload(self):
        """Test POST /predict with valid payload returns 200 OK and prediction metrics."""
        payload = {
            "date": "2026-10-03",
            "time": "14:00",
            "parkingAreaId": "A01",
            "totalSlots": 69,
            "previousOccupancy": 35.0,
            "currentOccupancy": 40.0
        }
        response = self.client.post('/predict', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 200)

        data = json.loads(response.data)
        self.assertIn("predicted_occupancy", data)
        self.assertIn("predicted_occupied_slots", data)
        self.assertIn("available_slots", data)

        self.assertIsInstance(data["predicted_occupancy"], float)
        self.assertIsInstance(data["predicted_occupied_slots"], int)
        self.assertIsInstance(data["available_slots"], int)
        self.assertEqual(data["predicted_occupied_slots"] + data["available_slots"], 69)

    def test_predict_missing_fields_returns_400(self):
        """Test POST /predict missing required fields returns 400 Bad Request."""
        payload = {
            "date": "2026-10-03",
            "time": "14:00"
        }
        response = self.client.post('/predict', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data.get("code"), "MISSING_FIELDS")

    def test_predict_invalid_occupancy_range_returns_400(self):
        """Test POST /predict with invalid occupancy percentage (> 100) returns 400 Bad Request."""
        payload = {
            "date": "2026-10-03",
            "time": "14:00",
            "parkingAreaId": "A01",
            "totalSlots": 69,
            "previousOccupancy": 150.0,  # Invalid > 100
            "currentOccupancy": 40.0
        }
        response = self.client.post('/predict', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data.get("code"), "VALIDATION_ERROR")

    def test_predict_non_json_returns_400(self):
        """Test POST /predict with non-JSON content type returns 400."""
        response = self.client.post('/predict', data="not json", content_type='text/plain')
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data.get("code"), "INVALID_CONTENT_TYPE")

    def test_service_does_not_crash_on_bad_input(self):
        """Verify bad inputs return 400/500 JSON errors without crashing the AI-3 Flask server."""
        bad_payloads = [
            {},
            {"date": "invalid-date", "time": "14:00", "parkingAreaId": "A01", "totalSlots": 69, "previousOccupancy": 10.0, "currentOccupancy": 20.0},
            {"date": "2026-10-03", "time": "14:00", "parkingAreaId": "UNKNOWN", "totalSlots": 69, "previousOccupancy": 10.0, "currentOccupancy": 20.0}
        ]
        for payload in bad_payloads:
            res = self.client.post('/predict', data=json.dumps(payload), content_type='application/json')
            self.assertIn(res.status_code, [400, 500])

if __name__ == '__main__':
    unittest.main()
