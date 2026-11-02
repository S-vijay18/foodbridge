import io
import csv
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    User, UserRole, VerificationStatus, Donation, DonationStatus,
    DeliveryAssignment, DeliveryStatus, AdminLog, Complaint
)
from app.schemas.schemas import UserOut, DonationOut
from app.api.deps import require_roles
from app.services.notification_service import create_notification, NotificationType

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    role: Optional[UserRole] = None,
    verification_status: Optional[VerificationStatus] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if verification_status:
        query = query.filter(User.verification_status == verification_status)
    return query.order_by(User.created_at.desc()).all()

@router.put("/users/{id}/verification")
def update_user_verification(
    id: int,
    status_val: VerificationStatus,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.verification_status = status_val
    user.is_verified = (status_val == VerificationStatus.VERIFIED)

    # Log action
    log = AdminLog(
        admin_id=admin.id,
        action="VERIFY_USER",
        target_type="User",
        target_id=user.id,
        details=f"Verification set to {status_val.value}. Notes: {notes or 'None'}"
    )
    db.add(log)
    db.commit()

    # Notify user
    create_notification(
        db=db,
        user_id=user.id,
        title="Organization Verification Update",
        message=f"Your FoodBridge verification status is now: {status_val.value}. {'You can now claim unlimited food donations!' if user.is_verified else ''}",
        notification_type=NotificationType.SYSTEM_ANNOUNCEMENT
    )

    return {"message": f"User {user.email} status updated to {status_val.value}", "is_verified": user.is_verified}

@router.put("/users/{id}/status")
def toggle_user_active(
    id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    user.is_active = is_active

    log = AdminLog(
        admin_id=admin.id,
        action="TOGGLE_USER_ACTIVE",
        target_type="User",
        target_id=user.id,
        details=f"User active state set to {is_active}"
    )
    db.add(log)
    db.commit()

    return {"message": f"User {user.email} active state updated to {is_active}"}

@router.get("/donations", response_model=List[DonationOut])
def get_all_donations(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    return db.query(Donation).order_by(Donation.created_at.desc()).all()

@router.get("/logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    logs = db.query(AdminLog).order_by(AdminLog.created_at.desc()).limit(100).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "target": f"{l.target_type} #{l.target_id}",
            "details": l.details,
            "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for l in logs
    ]

@router.get("/database-status")
def get_database_status(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    from app.core.config import settings
    from app.core.database import engine
    from app.models.models import DonationRequest, Review, Notification

    dialect_name = engine.dialect.name
    tables = [
        {"name": "users", "rows": db.query(User).count(), "desc": "Registered Donors, NGOs, Volunteers, Admins"},
        {"name": "donations", "rows": db.query(Donation).count(), "desc": "Surplus food donation records & safety specs"},
        {"name": "donation_requests", "rows": db.query(DonationRequest).count(), "desc": "NGO requests, approved quotas & beneficiaries"},
        {"name": "delivery_assignments", "rows": db.query(DeliveryAssignment).count(), "desc": "Volunteer dispatch missions & proof of delivery"},
        {"name": "reviews", "rows": db.query(Review).count(), "desc": "Verified post-handover ratings and feedback"},
        {"name": "notifications", "rows": db.query(Notification).count(), "desc": "Real-time user alerts and broadcast events"},
        {"name": "complaints", "rows": db.query(Complaint).count(), "desc": "Safety incident and quality investigation logs"},
        {"name": "admin_logs", "rows": db.query(AdminLog).count(), "desc": "Audit trail of all administrative actions"},
    ]

    return {
        "engine": dialect_name.upper(),
        "database_url": "sqlite:///./foodbridge.db" if settings.DATABASE_URL.startswith("sqlite") else settings.DATABASE_URL.split("@")[-1],
        "tables": tables,
        "total_records": sum(t["rows"] for t in tables),
        "migration_framework": "Alembic v1.20",
        "current_migration": "c9126fd7a185 (initial_schema)",
        "status": "HEALTHY_AND_CONNECTED"
    }

@router.get("/export-report")
def export_csv_report(
    report_type: str = Query("donations", pattern="^(donations|users|deliveries)$"),
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles([UserRole.ADMIN]))
):
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "donations":
        writer.writerow(["Donation ID", "Title", "Category", "Quantity", "Unit", "Estimated Meals", "Status", "Pickup Address", "Created At", "Expiry Time"])
        for d in db.query(Donation).all():
            writer.writerow([
                d.id, d.title, d.category.value, d.quantity, d.quantity_unit,
                d.estimated_meals, d.status.value, d.pickup_address,
                d.created_at.strftime("%Y-%m-%d %H:%M"), d.expiry_time.strftime("%Y-%m-%d %H:%M")
            ])
    elif report_type == "users":
        writer.writerow(["User ID", "Full Name", "Email", "Role", "Organization", "Phone", "Verified", "Active", "Registered Date"])
        for u in db.query(User).all():
            org_name = u.profile.organization_name if u.profile else ""
            writer.writerow([
                u.id, u.full_name, u.email, u.role.value, org_name,
                u.phone or "", u.is_verified, u.is_active, u.created_at.strftime("%Y-%m-%d")
            ])
    elif report_type == "deliveries":
        writer.writerow(["Delivery ID", "Request ID", "Donation Title", "Volunteer", "Status", "Pickup Time", "Delivered Time"])
        for d in db.query(DeliveryAssignment).all():
            vol_name = d.volunteer.full_name if d.volunteer else "Unassigned"
            don_title = d.donation.title if d.donation else ""
            writer.writerow([
                d.id, d.request_id, don_title, vol_name, d.status.value,
                d.pickup_time.strftime("%Y-%m-%d %H:%M") if d.pickup_time else "",
                d.delivered_time.strftime("%Y-%m-%d %H:%M") if d.delivered_time else ""
            ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=foodbridge_{report_type}_report.csv"}
    )
