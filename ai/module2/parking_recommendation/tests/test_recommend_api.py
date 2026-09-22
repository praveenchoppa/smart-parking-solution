import json
import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, model


def valid_slot(slot_id="S001", availability=1):
    return {
        "slot_id": slot_id,
        "zone": "A",
        "slot_type": "Standard",
        "distance_m": 103,
        "walking_time_min": 2.09,
        "parking_fee": 50,
        "occupancy": 18,
        "availability": availability,
        "distance_destination_m": 197,
        "traffic_level": "Medium",
        "weather": "Clear",
        "ev_charging": 0,
        "reserved": 0,
    }


@unittest.skipIf(model is None, "Recommendation model is not loaded")
class TestRecommendAPI(unittest.TestCase):
    def setUp(self):
        app.testing = True
        self.client = app.test_client()

    def test_home_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn("message", data)
        self.assertTrue(data["modelLoaded"])

    def test_recommend_single_valid_slot(self):
        response = self.client.post(
            "/recommend",
            data=json.dumps(valid_slot()),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["slot_id"], "S001")
        self.assertIn("score", data[0])

    def test_recommend_single_object_is_accepted(self):
        response = self.client.post(
            "/recommend",
            data=json.dumps(valid_slot("S002")),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data[0]["slot_id"], "S002")

    def test_recommend_multiple_valid_slots(self):
        payload = [valid_slot("S001"), valid_slot("S002"), valid_slot("S003")]
        response = self.client.post(
            "/recommend",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertGreaterEqual(len(data), 1)
        self.assertLessEqual(len(data), 3)

    def test_recommend_unavailable_slots(self):
        payload = [valid_slot("S010", availability=0), valid_slot("S011", availability=0)]
        response = self.client.post(
            "/recommend",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["message"], "No parking slots available")

    def test_recommend_empty_array(self):
        response = self.client.post(
            "/recommend",
            data=json.dumps([]),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["message"], "No parking slots available")

    def test_recommend_missing_required_fields(self):
        invalid_payload = {"slot_id": "S001", "zone": "A"}
        response = self.client.post(
            "/recommend",
            data=json.dumps(invalid_payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertEqual(data["code"], "VALIDATION_ERROR")

    def test_recommend_invalid_json(self):
        response = self.client.post(
            "/recommend",
            data="{invalid",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data)
        self.assertEqual(data["code"], "INVALID_JSON")


if __name__ == "__main__":
    unittest.main()
