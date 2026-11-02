from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import (
    AIChatRequest, AIChatResponse, PortionEstimateRequest,
    PortionEstimateResponse, SmartMatchRecommendation
)
from app.services.ai_service import AIService
from app.api.deps import get_current_user, get_current_active_user_optional
from app.models.models import User, UserRole

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/chat", response_model=AIChatResponse)
def chat_with_assistant(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_active_user_optional)
):
    user_id = current_user.id if current_user else None
    response = AIService.handle_chatbot_query(db=db, message=req.message, user_id=user_id)
    return response

@router.post("/estimate-portions", response_model=PortionEstimateResponse)
def estimate_food_portions(req: PortionEstimateRequest):
    result = AIService.estimate_portions(
        category=req.category,
        quantity=req.quantity,
        unit=req.quantity_unit
    )
    return result

@router.get("/smart-match", response_model=list[SmartMatchRecommendation])
def get_smart_food_matches(
    ngo_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_id = ngo_id or current_user.id
    matches = AIService.get_smart_matches(db=db, ngo_id=target_id)
    return matches

@router.get("/waste-insights")
def get_waste_insights(db: Session = Depends(get_db)):
    return AIService.generate_waste_analytics(db=db)

