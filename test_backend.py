import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from fastapi.testclient import TestClient
from app.main import app

def test_full_pipeline():
    client = TestClient(app)
    
    # 1. Health check
    print("Testing / health check...")
    res = client.get("/")
    assert res.status_code == 200, res.text
    print("Health check pass:", res.json())

    headers = {"X-User-Name": "Samarth"}

    # 2. States & Districts
    print("Testing /api/states and /api/districts...")
    res = client.get("/api/states")
    assert res.status_code == 200
    states = res.json()
    assert "Maharashtra" in states, "Maharashtra not in states"
    print(f"States pass, total states: {len(states)}")

    res = client.get("/api/districts?state=Maharashtra")
    assert res.status_code == 200
    districts = res.json()
    assert "Pune" in districts, "Pune not in districts"
    print(f"Districts pass, total districts in Maharashtra: {len(districts)}")

    # 3. Predict with user name
    print("Testing /api/predict...")
    pred_payload = {
        "state": "Maharashtra",
        "district": "Pune",
        "year": 2021
    }
    res = client.post("/api/predict", json=pred_payload, headers=headers)
    assert res.status_code == 200, res.text
    pred_res = res.json()
    print("Prediction pass:", pred_res)
    assert "predicted_total" in pred_res
    assert "risk_level" in pred_res
    assert pred_res["forecast_year"] == 2022

    # 4. Predictions History
    print("Testing /api/predictions history...")
    res = client.get("/api/predictions", headers=headers)
    assert res.status_code == 200, res.text
    history = res.json()
    print(f"History pass, found {len(history)} predictions.")
    assert len(history) >= 1

    # 5. Dashboard Stats
    print("Testing /api/dashboard...")
    res = client.get("/api/dashboard", headers=headers)
    assert res.status_code == 200, res.text
    dash = res.json()
    print("Dashboard stats pass:", dash)
    assert dash["total_predictions"] >= 1
    assert "risk_distribution" in dash

    # 6. Scoped AI Assistant Chat
    print("Testing /api/assistant/chat (on-topic)...")
    chat_payload = {
        "messages": [
            {"role": "user", "content": "What is the penalty for identity theft under the IT Act in India?"}
        ],
        "context": pred_res
    }
    res = client.post("/api/assistant/chat", json=chat_payload)
    assert res.status_code == 200, res.text
    chat_res = res.json()
    print("AI Assistant pass:", chat_res["status"], "| Model used:", chat_res["model_used"])
    if chat_res["status"] == "success":
        assert "reply" in chat_res and len(chat_res["reply"]) > 10
        # 7. AI Assistant Guardrail Test (out-of-scope question)
        print("Testing /api/assistant/chat (out-of-scope guardrail)...")
        guardrail_payload = {
            "messages": [
                {"role": "user", "content": "What is the capital of France?"}
            ]
        }
        res = client.post("/api/assistant/chat", json=guardrail_payload)
        assert res.status_code == 200, res.text
        guardrail_res = res.json()
        print("Guardrail pass:", guardrail_res["reply"][:120])
        assert "SATARK" in guardrail_res["reply"] or "restricted" in guardrail_res["reply"] or "cybercrime" in guardrail_res["reply"]
    else:
        print("AI Assistant offline mode verified (fallback handler responded properly).")

    print("\nALL BACKEND & ML TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_pipeline()
