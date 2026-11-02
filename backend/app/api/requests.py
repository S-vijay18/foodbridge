from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Donation, DonationRequest, DonationStatus, RequestStatus,
    DeliveryAssignment, DeliveryStatus, User, UserRole, NotificationType
)
from app.schemas.schemas import DonationRequestCreate, DonationRequestAction, DonationRequestOut
from app.api.deps import get_current_user, require_roles
from app.services.notification_service import create_notification

router = APIRouter(prefix="/requests", tags=["Donation Requests"])

@router.post("", response_model=DonationRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    request_in: DonationRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.NGO, UserRole.ADMIN]))
):
    donation = db.query(Donation).filter(Donation.id == request_in.donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation.status not in [DonationStatus.AVAILABLE, DonationStatus.PARTIALLY_RESERVED]:
        raise HTTPException(status_code=400, detail="This donation is no longer available for requests.")

    if request_in.requested_quantity <= 0:
        raise HTTPException(status_code=400, detail="Requested quantity must be greater than zero.")

    if request_in.requested_quantity > donation.remaining_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Requested quantity ({request_in.requested_quantity} {donation.quantity_unit}) exceeds available stock ({donation.remaining_quantity} {donation.quantity_unit})."
        )

    # Create request
    new_request = DonationRequest(
        donation_id=donation.id,
        ngo_id=current_user.id,
        requested_quantity=request_in.requested_quantity,
        quantity_unit=donation.quantity_unit,
        beneficiary_count=request_in.beneficiary_count,
        notes=request_in.notes,
        status=RequestStatus.PENDING
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Notify Donor
    donor = db.query(User).filter(User.id == donation.donor_id).first()
    if donor:
        create_notification(
            db=db,
            user_id=donor.id,
            title="New Food Request Received! 📋",
            message=f"{current_user.profile.organization_name or current_user.full_name} requested {request_in.requested_quantity} {donation.quantity_unit} of '{donation.title}'.",
            notification_type=NotificationType.REQUEST_RECEIVED,
            related_id=new_request.id
        )

    return new_request

@router.get("", response_model=List[DonationRequestOut])
def list_requests(
    donation_id: Optional[int] = None,
    status_filter: Optional[RequestStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DonationRequest)

    if current_user.role == UserRole.NGO:
        query = query.filter(DonationRequest.ngo_id == current_user.id)
    elif current_user.role == UserRole.DONOR:
        # Get requests for all donations posted by this donor
        donor_donation_ids = [d.id for d in db.query(Donation.id).filter(Donation.donor_id == current_user.id).all()]
        query = query.filter(DonationRequest.donation_id.in_(donor_donation_ids))
    
    if donation_id:
        query = query.filter(DonationRequest.donation_id == donation_id)
    if status_filter:
        query = query.filter(DonationRequest.status == status_filter)

    return query.order_by(DonationRequest.created_at.desc()).all()

@router.put("/{id}/approve", response_model=DonationRequestOut)
def approve_request(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DONOR, UserRole.ADMIN]))
):
    req = db.query(DonationRequest).filter(DonationRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    donation = db.query(Donation).filter(Donation.id == req.donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")

    if current_user.role != UserRole.ADMIN and donation.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the donor of this food can approve requests.")

    if req.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Request is already {req.status.value}.")

    if req.requested_quantity > donation.remaining_quantity:
        raise HTTPException(status_code=400, detail="Remaining quantity is no longer sufficient to approve this request.")

    # Approve request
    req.status = RequestStatus.APPROVED
    
    # Update inventory
    donation.remaining_quantity = round(donation.remaining_quantity - req.requested_quantity, 2)
    if donation.remaining_quantity <= 0.05:
        donation.status = DonationStatus.RESERVED
        donation.remaining_quantity = 0.0
    else:
        donation.status = DonationStatus.PARTIALLY_RESERVED

    # Automatically create delivery assignment for volunteers
    delivery = DeliveryAssignment(
        request_id=req.id,
        donation_id=donation.id,
        status=DeliveryStatus.PENDING,
        pickup_notes=f"Pickup for {req.requested_quantity} {donation.quantity_unit} of {donation.title}. Ready for volunteer pickup."
    )
    db.add(delivery)
    db.commit()
    db.refresh(req)

    # Notify NGO
    create_notification(
        db=db,
        user_id=req.ngo_id,
        title="Donation Request Approved! 🎉",
        message=f"Your request for {req.requested_quantity} {donation.quantity_unit} of '{donation.title}' has been approved by {current_user.full_name}. A volunteer assignment has been opened.",
        notification_type=NotificationType.REQUEST_APPROVED,
        related_id=req.id
    )

    # Broadcast notification to Volunteers
    volunteers = db.query(User).filter(User.role == UserRole.VOLUNTEER, User.is_active == True).all()
    for v in volunteers:
        create_notification(
            db=db,
            user_id=v.id,
            title="New Food Pickup Mission! 🚴",
            message=f"Pickup available at {donation.pickup_address}: {req.requested_quantity} {donation.quantity_unit} of '{donation.title}'.",
            notification_type=NotificationType.DELIVERY_ASSIGNED,
            related_id=delivery.id
        )

    return req

@router.put("/{id}/reject", response_model=DonationRequestOut)
def reject_request(
    id: int,
    action: DonationRequestAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DONOR, UserRole.ADMIN]))
):
    req = db.query(DonationRequest).filter(DonationRequest.id == id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    donation = db.query(Donation).filter(Donation.id == req.donation_id).first()
    if current_user.role != UserRole.ADMIN and donation.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the donor can reject this request.")

    req.status = RequestStatus.REJECTED
    req.rejection_reason = action.rejection_reason or "Donation quantity reserved for emergency relief / other prior request."
    db.commit()
    db.refresh(req)

    # Notify NGO
    create_notification(
        db=db,
        user_id=req.ngo_id,
        title="Donation Request Update",
        message=f"Your request for '{donation.title}' was declined: {req.rejection_reason}",
        notification_type=NotificationType.REQUEST_REJECTED,
        related_id=req.id
    )

    return req

