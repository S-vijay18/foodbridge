from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from app.models.models import (
    UserRole, OrganizationType, DonationCategory, FoodDietType,
    StorageType, DonationStatus, RequestStatus, DeliveryStatus,
    VerificationStatus, NotificationType
)

# --- USER SCHEMAS ---
class UserProfileBase(BaseModel):
    organization_name: Optional[str] = None
    organization_type: Optional[OrganizationType] = OrganizationType.INDIVIDUAL
    tax_id_or_reg_number: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    website: Optional[str] = None
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    capacity_meals_per_day: Optional[int] = 50

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileOut(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    organization_name: Optional[str] = None
    organization_type: Optional[OrganizationType] = OrganizationType.INDIVIDUAL
    tax_id_or_reg_number: Optional[str] = None
    bio: Optional[str] = None
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    verification_status: VerificationStatus
    verification_docs: Optional[str] = None
    created_at: datetime
    profile: Optional[UserProfileOut] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# --- DONATION SCHEMAS ---
class DonationBase(BaseModel):
    title: str
    category: DonationCategory
    description: str
    image_url: Optional[str] = None
    quantity: float
    quantity_unit: str = "kg"
    prep_time: datetime
    expiry_time: datetime
    diet_type: FoodDietType = FoodDietType.VEGETARIAN
    allergens: Optional[str] = "None reported"
    storage_req: StorageType = StorageType.ROOM_TEMP
    pickup_address: str
    pickup_lat: Optional[float] = 12.9716
    pickup_lng: Optional[float] = 77.5946
    pickup_instructions: Optional[str] = None
    max_pickup_distance_km: Optional[float] = 25.0
    safety_declared: bool = True

class DonationCreate(DonationBase):
    pass

class DonationUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[DonationCategory] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    remaining_quantity: Optional[float] = None
    prep_time: Optional[datetime] = None
    expiry_time: Optional[datetime] = None
    diet_type: Optional[FoodDietType] = None
    allergens: Optional[str] = None
    storage_req: Optional[StorageType] = None
    pickup_address: Optional[str] = None
    status: Optional[DonationStatus] = None

class DonationOut(DonationBase):
    id: int
    donor_id: int
    remaining_quantity: float
    estimated_meals: int
    status: DonationStatus
    created_at: datetime
    updated_at: datetime
    donor: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- REQUEST SCHEMAS ---
class DonationRequestCreate(BaseModel):
    donation_id: int
    requested_quantity: float
    quantity_unit: str = "kg"
    beneficiary_count: int = 10
    notes: Optional[str] = None

class DonationRequestAction(BaseModel):
    status: RequestStatus  # APPROVED or REJECTED
    rejection_reason: Optional[str] = None

class DonationRequestOut(BaseModel):
    id: int
    donation_id: int
    ngo_id: int
    requested_quantity: float
    quantity_unit: str
    beneficiary_count: int
    notes: Optional[str] = None
    status: RequestStatus
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    donation: Optional[DonationOut] = None
    ngo: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- DELIVERY SCHEMAS ---
class DeliveryTrackingLogOut(BaseModel):
    id: int
    delivery_id: int
    status: DeliveryStatus
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class DeliveryStatusUpdate(BaseModel):
    status: DeliveryStatus
    notes: Optional[str] = None
    pickup_notes: Optional[str] = None
    delivery_notes: Optional[str] = None
    proof_photo_url: Optional[str] = None
    recipient_signature_name: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

class DeliveryAssignmentOut(BaseModel):
    id: int
    request_id: int
    donation_id: int
    volunteer_id: Optional[int] = None
    status: DeliveryStatus
    pickup_notes: Optional[str] = None
    delivery_notes: Optional[str] = None
    proof_photo_url: Optional[str] = None
    recipient_signature_name: Optional[str] = None
    estimated_arrival: Optional[datetime] = None
    pickup_time: Optional[datetime] = None
    delivered_time: Optional[datetime] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    request: Optional[DonationRequestOut] = None
    donation: Optional[DonationOut] = None
    volunteer: Optional[UserOut] = None
    tracking_logs: List[DeliveryTrackingLogOut] = []

    class Config:
        from_attributes = True

# --- NOTIFICATION SCHEMAS ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: NotificationType
    related_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- REVIEW SCHEMAS ---
class ReviewCreate(BaseModel):
    target_id: int
    delivery_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    role_context: Optional[str] = "NGO_TO_DONOR"

class ReviewOut(BaseModel):
    id: int
    author_id: int
    target_id: int
    delivery_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
    role_context: Optional[str] = None
    created_at: datetime
    author: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- AI & ANALYTICS SCHEMAS ---
class AIChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    source: str = "ai_engine"

class PortionEstimateRequest(BaseModel):
    category: DonationCategory
    quantity: float
    quantity_unit: str = "kg"
    food_name: Optional[str] = ""

class PortionEstimateResponse(BaseModel):
    estimated_portions: int
    estimated_calories_per_portion: int
    co2_emissions_saved_kg: float
    explanation: str

class SmartMatchRecommendation(BaseModel):
    donation_id: int
    donation_title: str
    category: str
    quantity: float
    quantity_unit: str
    distance_km: float
    urgency_hours_left: float
    match_score: int  # 0 to 100
    recommendation_reason: str

class DashboardMetricsOut(BaseModel):
    total_users: int
    total_donors: int
    total_ngos: int
    total_volunteers: int
    total_donations: int
    active_donations: int
    completed_donations: int
    total_kg_donated: float
    estimated_meals_served: int
    co2_offset_kg: float
    successful_deliveries: int
    pending_deliveries: int

class ImpactMetricsOut(BaseModel):
    meals_provided: int
    food_saved_kg: float
    co2_reduced_kg: float
    active_organizations: int
    volunteer_hours_logged: int
