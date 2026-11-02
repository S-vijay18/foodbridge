from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.core.database import get_db
from app.models.models import Donation, DonationStatus, DonationCategory, FoodDietType, User, UserRole, NotificationType
from app.schemas.schemas import DonationCreate, DonationUpdate, DonationOut
from app.api.deps import get_current_user, get_current_active_user_optional, require_roles
from app.services.ai_service import AIService, calculate_haversine_distance
from app.services.notification_service import create_notification

router = APIRouter(prefix="/donations", tags=["Donations"])

@router.post("", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DONOR, UserRole.ADMIN]))
):
    now = datetime.now(timezone.utc)
    expiry = donation_in.expiry_time if donation_in.expiry_time.tzinfo else donation_in.expiry_time.replace(tzinfo=timezone.utc)
    
    # Food safety validation
    if expiry <= now:
        raise HTTPException(status_code=400, detail="Food safety violation: The consumption expiry deadline must be in the future.")
    
    if not donation_in.safety_declared:
        raise HTTPException(status_code=400, detail="You must review and declare that the food has been safely handled according to platform guidelines.")

    if donation_in.quantity <= 0:
        raise HTTPException(status_code=400, detail="Donation quantity must be greater than zero.")

    # Calculate meal portions and CO2 emissions via AI service
    ai_est = AIService.estimate_portions(
        category=donation_in.category,
        quantity=donation_in.quantity,
        unit=donation_in.quantity_unit
    )

    donation = Donation(
        donor_id=current_user.id,
        title=donation_in.title,
        category=donation_in.category,
        description=donation_in.description,
        image_url=donation_in.image_url or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
        quantity=donation_in.quantity,
        quantity_unit=donation_in.quantity_unit,
        remaining_quantity=donation_in.quantity,
        estimated_meals=ai_est["estimated_portions"],
        prep_time=donation_in.prep_time,
        expiry_time=donation_in.expiry_time,
        diet_type=donation_in.diet_type,
        allergens=donation_in.allergens or "None reported",
        storage_req=donation_in.storage_req,
        pickup_address=donation_in.pickup_address,
        pickup_lat=donation_in.pickup_lat or (current_user.profile.latitude if current_user.profile else 12.9716),
        pickup_lng=donation_in.pickup_lng or (current_user.profile.longitude if current_user.profile else 77.5946),
        pickup_instructions=donation_in.pickup_instructions,
        max_pickup_distance_km=donation_in.max_pickup_distance_km or 25.0,
        safety_declared=True,
        status=DonationStatus.AVAILABLE
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)

    # Notify NGOs in system
    ngos = db.query(User).filter(User.role == UserRole.NGO, User.is_active == True).all()
    for ngo in ngos[:10]: # notify nearby NGOs
        create_notification(
            db=db,
            user_id=ngo.id,
            title="New Food Donation Available! 🍲",
            message=f"{donation.title} ({donation.quantity} {donation.quantity_unit}) was just published by {current_user.profile.organization_name or current_user.full_name}.",
            notification_type=NotificationType.DONATION_NEW,
            related_id=donation.id
        )

    return donation

@router.get("", response_model=List[DonationOut])
def list_donations(
    category: Optional[DonationCategory] = None,
    diet_type: Optional[FoodDietType] = None,
    status_filter: Optional[DonationStatus] = None,
    search: Optional[str] = None,
    urgent_only: Optional[bool] = False,
    my_donations: Optional[bool] = False,
    sort_by: Optional[str] = "newest", # "newest", "expiry", "quantity"
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_active_user_optional)
):
    query = db.query(Donation)

    if my_donations and current_user:
        query = query.filter(Donation.donor_id == current_user.id)
    else:
        if status_filter:
            query = query.filter(Donation.status == status_filter)
        else:
            # Default marketplace view: available or partially reserved
            query = query.filter(Donation.status.in_([DonationStatus.AVAILABLE, DonationStatus.PARTIALLY_RESERVED]))

    if category:
        query = query.filter(Donation.category == category)
    if diet_type:
        query = query.filter(Donation.diet_type == diet_type)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Donation.title.ilike(search_pattern),
                Donation.description.ilike(search_pattern),
                Donation.pickup_address.ilike(search_pattern)
            )
        )

    now = datetime.now(timezone.utc)
    if urgent_only:
        # Items expiring in the next 12 hours
        from datetime import timedelta
        twelve_hours = now + timedelta(hours=12)
        query = query.filter(Donation.expiry_time <= twelve_hours, Donation.expiry_time >= now)

    if sort_by == "expiry":
        query = query.order_by(asc(Donation.expiry_time))
    elif sort_by == "quantity":
        query = query.order_by(desc(Donation.remaining_quantity))
    else:
        query = query.order_by(desc(Donation.created_at))

    donations = query.all()
    return donations

@router.get("/{id}", response_model=DonationOut)
def get_donation(id: int, db: Session = Depends(get_db)):
    donation = db.query(Donation).filter(Donation.id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation

@router.put("/{id}", response_model=DonationOut)
def update_donation(
    id: int,
    donation_in: DonationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(Donation).filter(Donation.id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    if donation.donor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this donation.")

    update_data = donation_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(donation, field, value)

    # Recalculate estimated meals if quantity changed
    if "remaining_quantity" in update_data:
        ai_est = AIService.estimate_portions(donation.category, donation.remaining_quantity, donation.quantity_unit)
        donation.estimated_meals = ai_est["estimated_portions"]

    db.commit()
    db.refresh(donation)
    return donation

@router.delete("/{id}")
def cancel_donation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    donation = db.query(Donation).filter(Donation.id == id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    if donation.donor_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You do not have permission to cancel this donation.")

    donation.status = DonationStatus.CANCELLED
    db.commit()
    return {"message": "Donation marked as cancelled."}

