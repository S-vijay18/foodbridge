from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    DeliveryAssignment, DeliveryStatus, DeliveryTrackingLog,
    DonationRequest, Donation, DonationStatus, RequestStatus,
    User, UserRole, NotificationType
)
from app.schemas.schemas import DeliveryAssignmentOut, DeliveryStatusUpdate, DeliveryTrackingLogOut
from app.api.deps import get_current_user, require_roles
from app.services.notification_service import create_notification

router = APIRouter(prefix="/deliveries", tags=["Delivery Management"])

@router.get("", response_model=List[DeliveryAssignmentOut])
def list_deliveries(
    status_filter: Optional[DeliveryStatus] = None,
    available_only: Optional[bool] = False,
    my_deliveries: Optional[bool] = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DeliveryAssignment)

    if available_only:
        # Available for any volunteer to claim
        query = query.filter(DeliveryAssignment.status == DeliveryStatus.PENDING, DeliveryAssignment.volunteer_id == None)
    elif my_deliveries:
        if current_user.role == UserRole.VOLUNTEER:
            query = query.filter(DeliveryAssignment.volunteer_id == current_user.id)
        elif current_user.role == UserRole.NGO:
            # Deliveries for requests made by this NGO
            ngo_req_ids = [r.id for r in db.query(DonationRequest.id).filter(DonationRequest.ngo_id == current_user.id).all()]
            query = query.filter(DeliveryAssignment.request_id.in_(ngo_req_ids))
        elif current_user.role == UserRole.DONOR:
            # Deliveries for donations published by this donor
            donor_don_ids = [d.id for d in db.query(Donation.id).filter(Donation.donor_id == current_user.id).all()]
            query = query.filter(DeliveryAssignment.donation_id.in_(donor_don_ids))

    if status_filter:
        query = query.filter(DeliveryAssignment.status == status_filter)

    return query.order_by(DeliveryAssignment.created_at.desc()).all()

@router.get("/{id}", response_model=DeliveryAssignmentOut)
def get_delivery(id: int, db: Session = Depends(get_db)):
    delivery = db.query(DeliveryAssignment).filter(DeliveryAssignment.id == id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")
    return delivery

@router.put("/{id}/accept", response_model=DeliveryAssignmentOut)
def accept_delivery(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.VOLUNTEER, UserRole.ADMIN]))
):
    delivery = db.query(DeliveryAssignment).filter(DeliveryAssignment.id == id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")

    if delivery.status != DeliveryStatus.PENDING or delivery.volunteer_id is not None:
        raise HTTPException(status_code=400, detail="This delivery assignment has already been claimed.")

    delivery.volunteer_id = current_user.id
    delivery.status = DeliveryStatus.ACCEPTED
    
    # Add tracking log
    log = DeliveryTrackingLog(
        delivery_id=delivery.id,
        status=DeliveryStatus.ACCEPTED,
        notes=f"Volunteer {current_user.full_name} accepted the pickup assignment."
    )
    db.add(log)
    db.commit()
    db.refresh(delivery)

    # Notify Donor and NGO
    if delivery.donation:
        create_notification(
            db=db,
            user_id=delivery.donation.donor_id,
            title="Volunteer Assigned! 🚚",
            message=f"{current_user.full_name} has accepted the pickup for '{delivery.donation.title}'.",
            notification_type=NotificationType.DELIVERY_ASSIGNED,
            related_id=delivery.id
        )
    if delivery.request:
        create_notification(
            db=db,
            user_id=delivery.request.ngo_id,
            title="Volunteer On The Way! 🚚",
            message=f"Volunteer {current_user.full_name} is preparing to collect your requested food.",
            notification_type=NotificationType.DELIVERY_ASSIGNED,
            related_id=delivery.id
        )

    return delivery

@router.put("/{id}/status", response_model=DeliveryAssignmentOut)
def update_delivery_status(
    id: int,
    update_in: DeliveryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    delivery = db.query(DeliveryAssignment).filter(DeliveryAssignment.id == id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery assignment not found")

    # Access control: volunteer assigned, recipient NGO, or admin
    is_assigned_volunteer = (delivery.volunteer_id == current_user.id)
    is_recipient_ngo = (delivery.request and delivery.request.ngo_id == current_user.id)
    is_admin = (current_user.role == UserRole.ADMIN)

    if not (is_assigned_volunteer or is_recipient_ngo or is_admin):
        raise HTTPException(status_code=403, detail="You do not have permission to update this delivery.")

    # Status transitions
    now = datetime.now(timezone.utc)
    old_status = delivery.status
    new_status = update_in.status
    delivery.status = new_status

    if update_in.pickup_notes:
        delivery.pickup_notes = update_in.pickup_notes
    if update_in.delivery_notes:
        delivery.delivery_notes = update_in.delivery_notes
    if update_in.proof_photo_url:
        delivery.proof_photo_url = update_in.proof_photo_url
    if update_in.recipient_signature_name:
        delivery.recipient_signature_name = update_in.recipient_signature_name
    if update_in.current_lat is not None and update_in.current_lng is not None:
        delivery.current_lat = update_in.current_lat
        delivery.current_lng = update_in.current_lng

    if new_status == DeliveryStatus.PICKED_UP:
        delivery.pickup_time = now
    elif new_status in [DeliveryStatus.DELIVERED, DeliveryStatus.CONFIRMED]:
        delivery.delivered_time = now
        if delivery.request:
            delivery.request.status = RequestStatus.COMPLETED
        if delivery.donation and delivery.donation.remaining_quantity <= 0:
            delivery.donation.status = DonationStatus.COMPLETED

    # Add audit log
    log = DeliveryTrackingLog(
        delivery_id=delivery.id,
        status=new_status,
        notes=update_in.notes or f"Delivery status progressed from {old_status.value} to {new_status.value}.",
        latitude=update_in.current_lat,
        longitude=update_in.current_lng
    )
    db.add(log)
    db.commit()
    db.refresh(delivery)

    # Notifications on key milestones
    if new_status == DeliveryStatus.PICKED_UP and delivery.request:
        create_notification(
            db=db,
            user_id=delivery.request.ngo_id,
            title="Food Collected by Volunteer! 📦",
            message=f"Food has been picked up from donor and is now in transit to your shelter.",
            notification_type=NotificationType.DELIVERY_STATUS_CHANGE,
            related_id=delivery.id
        )
    elif new_status == DeliveryStatus.DELIVERED and delivery.request:
        create_notification(
            db=db,
            user_id=delivery.request.ngo_id,
            title="Food Delivered! Please Confirm Receipt 🤝",
            message=f"The volunteer has delivered the food at your facility. Please inspect and confirm receipt.",
            notification_type=NotificationType.DELIVERY_STATUS_CHANGE,
            related_id=delivery.id
        )
    elif new_status == DeliveryStatus.CONFIRMED and delivery.donation:
        create_notification(
            db=db,
            user_id=delivery.donation.donor_id,
            title="Mission Accomplished! Food Received ❤️",
            message=f"The recipient organization has safely confirmed receipt of your food donation. Thank you for making an impact!",
            notification_type=NotificationType.RECEIPT_CONFIRMED,
            related_id=delivery.id
        )

    return delivery

@router.get("/{id}/tracking")
def get_live_tracking(id: int, db: Session = Depends(get_db)):
    delivery = db.query(DeliveryAssignment).filter(DeliveryAssignment.id == id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    donation = delivery.donation
    request = delivery.request
    ngo = request.ngo if request else None
    donor = donation.donor if donation else None
    volunteer = delivery.volunteer

    # Pickup location
    pickup_coords = {
        "address": donation.pickup_address if donation else "Pickup Location",
        "lat": donation.pickup_lat if donation and donation.pickup_lat else 12.9716,
        "lng": donation.pickup_lng if donation and donation.pickup_lng else 77.5946
    }

    # Delivery destination
    dropoff_coords = {
        "address": ngo.address if (ngo and ngo.address) else "NGO Recipient Center",
        "lat": ngo.profile.latitude if (ngo and ngo.profile and ngo.profile.latitude) else 12.9352,
        "lng": ngo.profile.longitude if (ngo and ngo.profile and ngo.profile.longitude) else 77.6245
    }

    # Current volunteer location
    volunteer_coords = {
        "lat": delivery.current_lat if delivery.current_lat else ((pickup_coords["lat"] + dropoff_coords["lat"]) / 2),
        "lng": delivery.current_lng if delivery.current_lng else ((pickup_coords["lng"] + dropoff_coords["lng"]) / 2)
    }

    steps = [
        {"key": "PENDING", "label": "Request Approved", "completed": True},
        {"key": "ACCEPTED", "label": "Volunteer Assigned", "completed": delivery.status in [DeliveryStatus.ACCEPTED, DeliveryStatus.PICKUP_STARTED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED, DeliveryStatus.CONFIRMED]},
        {"key": "PICKUP_STARTED", "label": "Heading to Pickup", "completed": delivery.status in [DeliveryStatus.PICKUP_STARTED, DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED, DeliveryStatus.CONFIRMED]},
        {"key": "PICKED_UP", "label": "Food Collected", "completed": delivery.status in [DeliveryStatus.PICKED_UP, DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED, DeliveryStatus.CONFIRMED]},
        {"key": "IN_TRANSIT", "label": "In Transit to NGO", "completed": delivery.status in [DeliveryStatus.IN_TRANSIT, DeliveryStatus.DELIVERED, DeliveryStatus.CONFIRMED]},
        {"key": "DELIVERED", "label": "Delivered at Shelter", "completed": delivery.status in [DeliveryStatus.DELIVERED, DeliveryStatus.CONFIRMED]},
        {"key": "CONFIRMED", "label": "Receipt Confirmed", "completed": delivery.status == DeliveryStatus.CONFIRMED},
    ]

    return {
        "delivery_id": delivery.id,
        "status": delivery.status.value,
        "current_step": delivery.status.value,
        "steps": steps,
        "food_title": donation.title if donation else "Food Package",
        "quantity": f"{request.requested_quantity} {request.quantity_unit}" if request else "",
        "donor_name": donor.profile.organization_name if (donor and donor.profile and donor.profile.organization_name) else (donor.full_name if donor else "Donor"),
        "ngo_name": ngo.profile.organization_name if (ngo and ngo.profile and ngo.profile.organization_name) else (ngo.full_name if ngo else "NGO Shelter"),
        "volunteer_name": volunteer.full_name if volunteer else "Volunteer Dispatch in Progress",
        "volunteer_phone": volunteer.phone if volunteer else None,
        "pickup_location": pickup_coords,
        "dropoff_location": dropoff_coords,
        "current_volunteer_location": volunteer_coords,
        "estimated_arrival": delivery.estimated_arrival or "15 - 25 mins",
        "proof_photo_url": delivery.proof_photo_url,
        "logs": [
            {
                "status": log.status.value,
                "notes": log.notes,
                "timestamp": log.created_at.strftime("%I:%M %p")
            }
            for log in delivery.tracking_logs
        ]
    }

