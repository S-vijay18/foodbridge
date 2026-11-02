from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, UserProfile, Complaint
from app.schemas.schemas import UserOut, UserProfileBase
from app.api.deps import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

class ComplaintCreate(BaseModel):
    subject: str
    description: str
    donation_id: Optional[int] = None

@router.get("/profile", response_model=UserOut)
def get_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_user_profile(
    profile_in: UserProfileBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/complaint", status_code=status.HTTP_201_CREATED)
def submit_complaint(
    complaint_in: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = Complaint(
        user_id=current_user.id,
        subject=complaint_in.subject,
        description=complaint_in.description,
        donation_id=complaint_in.donation_id,
        status="OPEN"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return {"message": "Your report has been logged and assigned to platform safety moderators.", "id": complaint.id}

