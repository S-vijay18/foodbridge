from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Review, User, DeliveryAssignment, DeliveryStatus
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews & Ratings"])

@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = db.query(User).filter(User.id == review_in.target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found")

    if review_in.target_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot rate yourself.")

    # Validate delivery relationship if delivery_id is supplied
    if review_in.delivery_id:
        delivery = db.query(DeliveryAssignment).filter(DeliveryAssignment.id == review_in.delivery_id).first()
        if not delivery:
            raise HTTPException(status_code=404, detail="Delivery record not found.")

    review = Review(
        author_id=current_user.id,
        target_id=review_in.target_id,
        delivery_id=review_in.delivery_id,
        rating=review_in.rating,
        comment=review_in.comment,
        role_context=review_in.role_context
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/target/{user_id}")
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.target_id == user_id).order_by(Review.created_at.desc()).all()
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.target_id == user_id).scalar()
    
    return {
        "user_id": user_id,
        "average_rating": round(float(avg_rating), 1) if avg_rating else 5.0,
        "total_reviews": len(reviews),
        "reviews": [
            {
                "id": r.id,
                "author_name": r.author.full_name if r.author else "Anonymous",
                "author_org": r.author.profile.organization_name if (r.author and r.author.profile) else "",
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.strftime("%Y-%m-%d")
            }
            for r in reviews
        ]
    }

