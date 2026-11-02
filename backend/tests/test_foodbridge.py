import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from main import app
from app.core.database import SessionLocal, Base, engine
from app.models.models import User, UserRole, DonationStatus, RequestStatus, DeliveryStatus
from app.utils.seed_data import seed_database

# Initialize DB and Seed data for tests
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)
db.close()

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

def test_login_donor():
    res = client.post("/api/auth/login", json={
        "email": "hotel@grandplaza.com",
        "password": "Password123!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "donor"

def test_login_ngo():
    res = client.post("/api/auth/login", json={
        "email": "contact@hopehaven.org",
        "password": "Password123!"
    })
    assert res.status_code == 200
    assert res.json()["user"]["role"] == "ngo"

def test_list_donations():
    res = client.get("/api/donations")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    assert "title" in items[0]

def test_ai_portion_estimator():
    res = client.post("/api/ai/estimate-portions", json={
        "category": "Cooked Meals",
        "quantity": 25.0,
        "quantity_unit": "kg"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["estimated_portions"] > 50
    assert data["co2_emissions_saved_kg"] > 50

def test_food_safety_rejection_for_expired_donation():
    # Login donor
    login_res = client.post("/api/auth/login", json={
        "email": "hotel@grandplaza.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to post food with past expiry time
    past_time = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    res = client.post("/api/donations", headers=headers, json={
        "title": "Expired Buffets",
        "category": "Cooked Meals",
        "description": "Unsafe test listing",
        "quantity": 10.0,
        "quantity_unit": "kg",
        "prep_time": past_time,
        "expiry_time": past_time, # EXPIRED!
        "diet_type": "Vegetarian",
        "storage_req": "Ambient / Room Temp",
        "pickup_address": "Test Street",
        "safety_declared": True
    })
    assert res.status_code == 400
    assert "Food safety violation" in res.json()["detail"]

def test_request_and_delivery_lifecycle():
    # 1. Login donor to find their own donation
    donor_res = client.post("/api/auth/login", json={
        "email": "hotel@grandplaza.com",
        "password": "Password123!"
    })
    donor_token = donor_res.json()["access_token"]
    donor_user_id = donor_res.json()["user"]["id"]

    # 2. Get a donation owned by this donor with remaining quantity
    don_res = client.get(f"/api/donations?my_donations=true", headers={"Authorization": f"Bearer {donor_token}"})
    available = [d for d in don_res.json() if d["remaining_quantity"] >= 5.0 and d["status"] in ["AVAILABLE", "PARTIALLY_RESERVED"]]
    assert len(available) > 0, "Expected at least one available donation for Grand Plaza"
    target_don = available[0]

    # 3. Login NGO
    ngo_res = client.post("/api/auth/login", json={
        "email": "contact@hopehaven.org",
        "password": "Password123!"
    })
    ngo_token = ngo_res.json()["access_token"]

    # 4. NGO submits request
    req_res = client.post("/api/requests", headers={"Authorization": f"Bearer {ngo_token}"}, json={
        "donation_id": target_don["id"],
        "requested_quantity": 5.0,
        "quantity_unit": target_don["quantity_unit"],
        "beneficiary_count": 25,
        "notes": "Testing integration request"
    })
    assert req_res.status_code == 201
    req_id = req_res.json()["id"]

    # 5. Donor approves request
    appr_res = client.put(f"/api/requests/{req_id}/approve", headers={"Authorization": f"Bearer {donor_token}"})
    assert appr_res.status_code == 200, f"Approve failed: {appr_res.text}"
    assert appr_res.json()["status"] == "APPROVED"

    # 6. Volunteer claims delivery
    vol_res = client.post("/api/auth/login", json={
        "email": "alex@volunteer.org",
        "password": "Password123!"
    })
    vol_token = vol_res.json()["access_token"]

    delivs = client.get("/api/deliveries?available_only=true", headers={"Authorization": f"Bearer {vol_token}"}).json()
    claimed_del = [d for d in delivs if d["request_id"] == req_id][0]

    claim_res = client.put(f"/api/deliveries/{claimed_del['id']}/accept", headers={"Authorization": f"Bearer {vol_token}"})
    assert claim_res.status_code == 200
    assert claim_res.json()["status"] == "ACCEPTED"

    # 7. Progress delivery to DELIVERED
    prog_res = client.put(f"/api/deliveries/{claimed_del['id']}/status", headers={"Authorization": f"Bearer {vol_token}"}, json={
        "status": "DELIVERED",
        "notes": "Delivered to shelter reception",
        "recipient_signature_name": "Sister Mary"
    })
    assert prog_res.status_code == 200
    assert prog_res.json()["status"] == "DELIVERED"

    # 8. NGO confirms receipt
    conf_res = client.put(f"/api/deliveries/{claimed_del['id']}/status", headers={"Authorization": f"Bearer {ngo_token}"}, json={
        "status": "CONFIRMED",
        "notes": "Food verified and served!"
    })
    assert conf_res.status_code == 200
    assert conf_res.json()["status"] == "CONFIRMED"

def test_admin_csv_export():
    admin_res = client.post("/api/auth/login", json={
        "email": "admin@foodbridge.org",
        "password": "Password123!"
    })
    admin_token = admin_res.json()["access_token"]

    export_res = client.get("/api/admin/export-report?report_type=donations", headers={"Authorization": f"Bearer {admin_token}"})
    assert export_res.status_code == 200
    assert "Donation ID,Title,Category" in export_res.text

if __name__ == "__main__":
    print("Running FoodBridge Integration Tests...")
    test_health()
    test_login_donor()
    test_login_ngo()
    test_list_donations()
    test_ai_portion_estimator()
    test_food_safety_rejection_for_expired_donation()
    test_request_and_delivery_lifecycle()
    test_admin_csv_export()
    print("ALL TESTS PASSED SUCCESSFULLY! (8/8)")
