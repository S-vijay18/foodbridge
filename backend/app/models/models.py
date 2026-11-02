from datetime import datetime, timezone
import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    DONOR = "donor"
    NGO = "ngo"
    VOLUNTEER = "volunteer"
    ADMIN = "admin"

class OrganizationType(str, enum.Enum):
    RESTAURANT = "Restaurant"
    HOTEL = "Hotel"
    CATERING = "Catering Service"
    SUPERMARKET = "Supermarket"
    BAKERY = "Bakery"
    INDIVIDUAL = "Individual Donor"
    NGO = "NGO / Charity"
    ORPHANAGE = "Orphanage"
    OLD_AGE_HOME = "Old Age Home"
    COMMUNITY_KITCHEN = "Community Kitchen"
    VOLUNTEER_GROUP = "Volunteer Group"
    OTHER = "Other"

class DonationCategory(str, enum.Enum):
    COOKED_MEALS = "Cooked Meals"
    RAW_GROCERIES = "Raw Groceries"
    BAKED_GOODS = "Baked Goods"
    DAIRY_PRODUCTS = "Dairy & Refrigerated"
    PACKAGED_CANNED = "Packaged & Canned"
    FRUITS_VEGETABLES = "Fruits & Vegetables"
    BEVERAGES = "Beverages"
    OTHER = "Other"

class FoodDietType(str, enum.Enum):
    VEGETARIAN = "Vegetarian"
    NON_VEGETARIAN = "Non-Vegetarian"
    VEGAN = "Vegan"

class StorageType(str, enum.Enum):
    REFRIGERATED = "Refrigerated (0-4°C)"
    FROZEN = "Frozen (-18°C)"
    ROOM_TEMP = "Ambient / Room Temp"
    HOT_HOLDING = "Hot Holding (>60°C)"

class DonationStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    PARTIALLY_RESERVED = "PARTIALLY_RESERVED"
    RESERVED = "RESERVED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class RequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

class DeliveryStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    PICKUP_STARTED = "PICKUP_STARTED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CONFIRMED = "CONFIRMED"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class NotificationType(str, enum.Enum):
    DONATION_NEW = "DONATION_NEW"
    REQUEST_RECEIVED = "REQUEST_RECEIVED"
    REQUEST_APPROVED = "REQUEST_APPROVED"
    REQUEST_REJECTED = "REQUEST_REJECTED"
    DELIVERY_ASSIGNED = "DELIVERY_ASSIGNED"
    DELIVERY_STATUS_CHANGE = "DELIVERY_STATUS_CHANGE"
    RECEIPT_CONFIRMED = "RECEIPT_CONFIRMED"
    EXPIRY_WARNING = "EXPIRY_WARNING"
    SYSTEM_ANNOUNCEMENT = "SYSTEM_ANNOUNCEMENT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.DONOR, nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.PENDING)
    verification_docs = Column(Text, nullable=True)  # URL or doc description
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    donations = relationship("Donation", back_populates="donor", foreign_keys="Donation.donor_id")
    requests = relationship("DonationRequest", back_populates="ngo", foreign_keys="DonationRequest.ngo_id")
    deliveries = relationship("DeliveryAssignment", back_populates="volunteer", foreign_keys="DeliveryAssignment.volunteer_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reviews_written = relationship("Review", foreign_keys="Review.author_id", back_populates="author")
    reviews_received = relationship("Review", foreign_keys="Review.target_id", back_populates="target")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    organization_name = Column(String(255), nullable=True)
    organization_type = Column(SQLEnum(OrganizationType), default=OrganizationType.INDIVIDUAL)
    tax_id_or_reg_number = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    website = Column(String(255), nullable=True)
    latitude = Column(Float, default=12.9716)   # Default Bangalore coordinates for demo
    longitude = Column(Float, default=77.5946)
    capacity_meals_per_day = Column(Integer, default=50)

    user = relationship("User", back_populates="profile")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(SQLEnum(DonationCategory), default=DonationCategory.COOKED_MEALS, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    quantity = Column(Float, nullable=False)
    quantity_unit = Column(String(50), default="kg", nullable=False)  # kg, portions, litres, packets
    remaining_quantity = Column(Float, nullable=False)
    estimated_meals = Column(Integer, default=1)
    
    prep_time = Column(DateTime, nullable=False)
    expiry_time = Column(DateTime, nullable=False)
    
    diet_type = Column(SQLEnum(FoodDietType), default=FoodDietType.VEGETARIAN, nullable=False)
    allergens = Column(String(255), default="None reported")
    storage_req = Column(SQLEnum(StorageType), default=StorageType.ROOM_TEMP, nullable=False)
    
    pickup_address = Column(String(500), nullable=False)
    pickup_lat = Column(Float, default=12.9716)
    pickup_lng = Column(Float, default=77.5946)
    pickup_instructions = Column(Text, nullable=True)
    max_pickup_distance_km = Column(Float, default=25.0)
    safety_declared = Column(Boolean, default=True)
    
    status = Column(SQLEnum(DonationStatus), default=DonationStatus.AVAILABLE, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    donor = relationship("User", back_populates="donations", foreign_keys=[donor_id])
    requests = relationship("DonationRequest", back_populates="donation", cascade="all, delete-orphan")
    deliveries = relationship("DeliveryAssignment", back_populates="donation")

class DonationRequest(Base):
    __tablename__ = "donation_requests"

    id = Column(Integer, primary_key=True, index=True)
    donation_id = Column(Integer, ForeignKey("donations.id", ondelete="CASCADE"), nullable=False)
    ngo_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_quantity = Column(Float, nullable=False)
    quantity_unit = Column(String(50), default="kg", nullable=False)
    beneficiary_count = Column(Integer, default=10)
    notes = Column(Text, nullable=True)
    status = Column(SQLEnum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    rejection_reason = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    donation = relationship("Donation", back_populates="requests")
    ngo = relationship("User", back_populates="requests", foreign_keys=[ngo_id])
    delivery = relationship("DeliveryAssignment", back_populates="request", uselist=False)

class DeliveryAssignment(Base):
    __tablename__ = "delivery_assignments"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("donation_requests.id", ondelete="CASCADE"), nullable=False, unique=True)
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=False)
    volunteer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(SQLEnum(DeliveryStatus), default=DeliveryStatus.PENDING, nullable=False, index=True)
    
    pickup_notes = Column(Text, nullable=True)
    delivery_notes = Column(Text, nullable=True)
    proof_photo_url = Column(String(500), nullable=True)
    recipient_signature_name = Column(String(255), nullable=True)
    
    estimated_arrival = Column(DateTime, nullable=True)
    pickup_time = Column(DateTime, nullable=True)
    delivered_time = Column(DateTime, nullable=True)
    
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    request = relationship("DonationRequest", back_populates="delivery")
    donation = relationship("Donation", back_populates="deliveries")
    volunteer = relationship("User", back_populates="deliveries", foreign_keys=[volunteer_id])
    tracking_logs = relationship("DeliveryTrackingLog", back_populates="delivery", cascade="all, delete-orphan", order_by="DeliveryTrackingLog.created_at.desc()")
    reviews = relationship("Review", back_populates="delivery")

class DeliveryTrackingLog(Base):
    __tablename__ = "delivery_tracking_logs"

    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("delivery_assignments.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(DeliveryStatus), nullable=False)
    notes = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    delivery = relationship("DeliveryAssignment", back_populates="tracking_logs")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(SQLEnum(NotificationType), default=NotificationType.SYSTEM_ANNOUNCEMENT)
    related_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    delivery_id = Column(Integer, ForeignKey("delivery_assignments.id"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    role_context = Column(String(50), nullable=True)  # "NGO_TO_DONOR", "NGO_TO_VOLUNTEER", "DONOR_TO_VOLUNTEER"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    author = relationship("User", foreign_keys=[author_id], back_populates="reviews_written")
    target = relationship("User", foreign_keys=[target_id], back_populates="reviews_received")
    delivery = relationship("DeliveryAssignment", back_populates="reviews")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    donation_id = Column(Integer, ForeignKey("donations.id"), nullable=True)
    status = Column(String(50), default="OPEN")  # OPEN, INVESTIGATING, RESOLVED
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=True)
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

