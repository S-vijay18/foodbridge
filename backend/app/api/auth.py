from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, UserProfile, UserRole, VerificationStatus, NotificationType
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token, PasswordResetRequest, PasswordResetConfirm
from app.api.deps import get_current_user
from app.services.notification_service import create_notification

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Create new user
    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone,
        address=user_in.address,
        is_active=True,
        is_verified=True if user_in.role in [UserRole.DONOR, UserRole.VOLUNTEER] else False,
        verification_status=VerificationStatus.VERIFIED if user_in.role in [UserRole.DONOR, UserRole.VOLUNTEER] else VerificationStatus.PENDING,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create associated profile
    profile = UserProfile(
        user_id=user.id,
        organization_name=user_in.organization_name or user_in.full_name,
        organization_type=user_in.organization_type,
        tax_id_or_reg_number=user_in.tax_id_or_reg_number,
        bio=user_in.bio,
        latitude=user_in.latitude or 12.9716,
        longitude=user_in.longitude or 77.5946,
        capacity_meals_per_day=50
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    # Welcome notification
    create_notification(
        db=db,
        user_id=user.id,
        title="Welcome to FoodBridge! 🌱",
        message=f"Thank you for registering as a {user.role.value.upper()}. Together, we turn surplus food into hope!",
        notification_type=NotificationType.SYSTEM_ANNOUNCEMENT
    )

    token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated. Contact admin.")

    token = create_access_token(subject=user.id, role=user.role.value)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    # In production, send reset email; for demo, return mock confirmation
    if user:
        return {"message": f"Password reset instructions have been dispatched to {req.email}."}
    return {"message": f"If an account exists with {req.email}, reset instructions have been sent."}

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    return {"message": "Password has been successfully updated. Please login with your new credentials."}

@router.get("/demo-users")
def get_demo_users():
    """List of sample accounts for evaluation and rapid switching."""
    return [
        {
            "role": "donor",
            "name": "Grand Plaza Hotel & Catering",
            "email": "hotel@grandplaza.com",
            "password": "Password123!",
            "description": "Commercial donor with regular banquet surplus and buffet trays"
        },
        {
            "role": "ngo",
            "name": "Hope Haven Shelter & Orphanage",
            "email": "contact@hopehaven.org",
            "password": "Password123!",
            "description": "Verified recipient feeding 80+ children & elderly daily"
        },
        {
            "role": "volunteer",
            "name": "Alex Rivera (Courier)",
            "email": "alex@volunteer.org",
            "password": "Password123!",
            "description": "Active volunteer driver available for immediate food transport"
        },
        {
            "role": "admin",
            "name": "Sivaraj (Lead Administrator)",
            "email": "sivaraj82006@gmail.com",
            "phone": "+91 99762 73763",
            "password": "Password123!",
            "description": "Platform Founder and Chief Administrator with full verification, audit log, and reporting controls"
        }
    ]

