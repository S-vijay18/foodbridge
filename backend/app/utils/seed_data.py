from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.models import (
    User, UserProfile, UserRole, OrganizationType, VerificationStatus,
    Donation, DonationCategory, FoodDietType, StorageType, DonationStatus,
    DonationRequest, RequestStatus, DeliveryAssignment, DeliveryStatus,
    DeliveryTrackingLog, Review, Notification, NotificationType
)

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@foodbridge.org").first():
        print("Database already seeded with demo data.")
        return

    print("Seeding FoodBridge database with realistic demonstration data...")

    now = datetime.now(timezone.utc)
    hashed_pwd = get_password_hash("Password123!")

    # 1. Create Users
    admin = User(
        email="sivaraj82006@gmail.com",
        hashed_password=hashed_pwd,
        full_name="Sivaraj (Lead Administrator)",
        role=UserRole.ADMIN,
        phone="+91 99762 73763",
        address="FoodBridge Platform Headquarters, Bangalore",
        is_active=True,
        is_verified=True,
        verification_status=VerificationStatus.VERIFIED
    )
    admin.profile = UserProfile(
        organization_name="FoodBridge Executive Foundation",
        organization_type=OrganizationType.NGO,
        tax_id_or_reg_number="FB-DIR-2026-01",
        bio="Platform Founder and Chief Operations Lead",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        latitude=12.9716,
        longitude=77.5946
    )

    donor1 = User(
        email="hotel@grandplaza.com",
        hashed_password=hashed_pwd,
        full_name="Chef Marco Rossi",
        role=UserRole.DONOR,
        phone="+91 98450 11223",
        address="Grand Plaza Hotel, 45 Residency Road, Bangalore",
        is_active=True,
        is_verified=True,
        verification_status=VerificationStatus.VERIFIED
    )
    donor1.profile = UserProfile(
        organization_name="Grand Plaza Hotel & Banquets",
        organization_type=OrganizationType.HOTEL,
        tax_id_or_reg_number="GST-IND-8849201",
        bio="5-star hotel committed to zero food waste from banquet halls and lunch buffets.",
        avatar_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
        website="https://grandplazahotels.demo",
        latitude=12.9698,
        longitude=77.6025,
        capacity_meals_per_day=300
    )

    donor2 = User(
        email="donor@freshbake.com",
        hashed_password=hashed_pwd,
        full_name="Elena Rostova",
        role=UserRole.DONOR,
        phone="+91 98451 44556",
        address="FreshBake Bakery, 12 Indiranagar 100ft Rd, Bangalore",
        is_active=True,
        is_verified=True,
        verification_status=VerificationStatus.VERIFIED
    )
    donor2.profile = UserProfile(
        organization_name="FreshBake Artisan Bakery",
        organization_type=OrganizationType.BAKERY,
        tax_id_or_reg_number="FSSAI-29182746",
        bio="Artisan baker providing daily unsold organic bread, baguettes, and pastries.",
        avatar_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
        latitude=12.9784,
        longitude=77.6408,
        capacity_meals_per_day=150
    )

    ngo1 = User(
        email="contact@hopehaven.org",
        hashed_password=hashed_pwd,
        full_name="Sister Mary D'Souza",
        role=UserRole.NGO,
        phone="+91 98223 99887",
        address="Hope Haven Children Home, Koramangala 4th Block, Bangalore",
        is_active=True,
        is_verified=True,
        verification_status=VerificationStatus.VERIFIED
    )
    ngo1.profile = UserProfile(
        organization_name="Hope Haven Orphanage & Shelter",
        organization_type=OrganizationType.ORPHANAGE,
        tax_id_or_reg_number="NGO-REG-KAR-7712",
        bio="Providing safe shelter, education, and balanced nutrition to 85 underprivileged children.",
        avatar_url="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80",
        latitude=12.9352,
        longitude=77.6245,
        capacity_meals_per_day=90
    )

    ngo2 = User(
        email="info@cityfoodrescue.org",
        hashed_password=hashed_pwd,
        full_name="David Anand",
        role=UserRole.NGO,
        phone="+91 98112 33445",
        address="City Food Bank Community Center, Jayanagar 7th Block, Bangalore",
        is_active=True,
        is_verified=True,
        verification_status=VerificationStatus.VERIFIED
    )
    ngo2.profile = UserProfile(
        organization_name="City Community Kitchen & Relief",
        organization_type=OrganizationType.COMMUNITY_KITCHEN,
        tax_id_or_reg_number="NGO-REG-KAR-8834",
        bio="Operating 3 daily soup kitchens serving transient laborers and old age homes.",
        avatar_url="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80",
        latitude=12.9250,
        longitude=77.5838,
        capacity_meals_per_day=200
    )

    volunteer1 = User(
        email="alex@volunteer.org",
        hashed_password=hashed_pwd,
        full_name="Alex Rivera",
        role=UserRole.VOLUNTEER,
        phone="+91 97334 55667",
        address="Domlur Layout, Bangalore",
        is_active=True,
        is_verified=True,
        verification_status=VerificationStatus.VERIFIED
    )
    volunteer1.profile = UserProfile(
        organization_name="Independent Green Courier",
        organization_type=OrganizationType.VOLUNTEER_GROUP,
        bio="Equipped with insulated thermal bags and electric scooter for rapid food transport.",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        latitude=12.9609,
        longitude=77.6387
    )

    volunteer2 = User(
        email="priya@volunteer.org",
        hashed_password=hashed_pwd,
        full_name="Priya Sharma",
        role=UserRole.VOLUNTEER,
        phone="+91 97112 88990",
        address="HSR Layout Sector 1, Bangalore",
        is_active=True,
        is_verified=True,
        verification_status=VerificationStatus.VERIFIED
    )
    volunteer2.profile = UserProfile(
        organization_name="Youth Against Hunger Volunteer",
        organization_type=OrganizationType.VOLUNTEER_GROUP,
        bio="College student and community food rescue volunteer on weekends.",
        avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        latitude=12.9121,
        longitude=77.6446
    )

    db.add_all([admin, donor1, donor2, ngo1, ngo2, volunteer1, volunteer2])
    db.commit()

    # 2. Create Donations
    don1 = Donation(
        donor_id=donor1.id,
        title="Royal Vegetable Biryani & Paneer Curry Trays",
        category=DonationCategory.COOKED_MEALS,
        description="Freshly cooked vegetable dum biryani, cottage cheese paneer gravy, and mint raita prepared for a corporate lunch event. Handled with strict hygiene and kept in commercial hot-holding thermal trays.",
        image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
        quantity=25.0,
        quantity_unit="kg",
        remaining_quantity=10.0,  # 15 kg requested
        estimated_meals=70,
        prep_time=now - timedelta(hours=2),
        expiry_time=now + timedelta(hours=6), # Urgent!
        diet_type=FoodDietType.VEGETARIAN,
        allergens="Dairy (Paneer & Raita)",
        storage_req=StorageType.HOT_HOLDING,
        pickup_address="Grand Plaza Hotel Kitchen Entrance, Gate 3, Residency Road, Bangalore",
        pickup_lat=12.9698,
        pickup_lng=77.6025,
        pickup_instructions="Report to Security Desk 2, ask for Sous Chef Rajesh. Thermal transport containers provided.",
        max_pickup_distance_km=20.0,
        safety_declared=True,
        status=DonationStatus.PARTIALLY_RESERVED
    )

    don2 = Donation(
        donor_id=donor2.id,
        title="Artisan Sourdough Loaves & Croissant Assortment",
        category=DonationCategory.BAKED_GOODS,
        description="Baked this morning: country sourdough boules, pain au chocolat, butter croissants, and whole wheat baguettes. Intact, individually paper-bagged, crisp crust.",
        image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
        quantity=18.0,
        quantity_unit="kg",
        remaining_quantity=18.0,
        estimated_meals=55,
        prep_time=now - timedelta(hours=5),
        expiry_time=now + timedelta(hours=30),
        diet_type=FoodDietType.VEGAN,
        allergens="Gluten (Wheat)",
        storage_req=StorageType.ROOM_TEMP,
        pickup_address="FreshBake Indiranagar, 12 Indiranagar 100ft Rd, Bangalore",
        pickup_lat=12.9784,
        pickup_lng=77.6408,
        pickup_instructions="Call front counter 5 minutes prior to arrival.",
        max_pickup_distance_km=25.0,
        safety_declared=True,
        status=DonationStatus.AVAILABLE
    )

    don3 = Donation(
        donor_id=donor1.id,
        title="Crated Farm-Fresh Apples, Oranges & Bananas",
        category=DonationCategory.FRUITS_VEGETABLES,
        description="Crisp Himachal apples, sweet Nagpur oranges, and ripe Cavendish bananas from brunch fruit displays. Uncut, intact skins, clean and fresh.",
        image_url="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
        quantity=40.0,
        quantity_unit="kg",
        remaining_quantity=0.0,
        estimated_meals=100,
        prep_time=now - timedelta(days=1),
        expiry_time=now + timedelta(days=2),
        diet_type=FoodDietType.VEGAN,
        allergens="None",
        storage_req=StorageType.ROOM_TEMP,
        pickup_address="Grand Plaza Loading Dock B, Residency Road, Bangalore",
        pickup_lat=12.9698,
        pickup_lng=77.6025,
        pickup_instructions="Forklift crate access available.",
        max_pickup_distance_km=30.0,
        safety_declared=True,
        status=DonationStatus.COMPLETED
    )

    don4 = Donation(
        donor_id=donor1.id,
        title="Organic Pasteurized Milk & Greek Yogurt Cups",
        category=DonationCategory.DAIRY_PRODUCTS,
        description="Cartons of whole pasteurized cow milk (500ml each) and unflavored Greek yogurt tubs. Continuously refrigerated at 2°C.",
        image_url="https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
        quantity=30.0,
        quantity_unit="litres",
        remaining_quantity=30.0,
        estimated_meals=90,
        prep_time=now - timedelta(hours=10),
        expiry_time=now + timedelta(hours=22),
        diet_type=FoodDietType.VEGETARIAN,
        allergens="Dairy (Lactose)",
        storage_req=StorageType.REFRIGERATED,
        pickup_address="Grand Plaza Hotel Cold Room, Gate 3",
        pickup_lat=12.9698,
        pickup_lng=77.6025,
        max_pickup_distance_km=15.0,
        safety_declared=True,
        status=DonationStatus.AVAILABLE
    )

    don5 = Donation(
        donor_id=donor2.id,
        title="Wholesome Vegetable Pulao & Lentil Dal",
        category=DonationCategory.COOKED_MEALS,
        description="Steamed basmati pulao with carrots, peas, and golden cumin tempered yellow moong dal. Cooked in pure olive oil.",
        image_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
        quantity=20.0,
        quantity_unit="kg",
        remaining_quantity=20.0,
        estimated_meals=56,
        prep_time=now - timedelta(hours=1),
        expiry_time=now + timedelta(hours=8),
        diet_type=FoodDietType.VEGAN,
        allergens="None",
        storage_req=StorageType.HOT_HOLDING,
        pickup_address="FreshBake Community Center, Indiranagar",
        pickup_lat=12.9784,
        pickup_lng=77.6408,
        max_pickup_distance_km=25.0,
        safety_declared=True,
        status=DonationStatus.AVAILABLE
    )

    db.add_all([don1, don2, don3, don4, don5])
    db.commit()

    # 3. Create Requests
    req1 = DonationRequest(
        donation_id=don1.id,
        ngo_id=ngo1.id,
        requested_quantity=15.0,
        quantity_unit="kg",
        beneficiary_count=45,
        notes="Our 45 resident children are having dinner at 7:30 PM. This biryani is ideal for them!",
        status=RequestStatus.APPROVED
    )

    req2 = DonationRequest(
        donation_id=don2.id,
        ngo_id=ngo2.id,
        requested_quantity=10.0,
        quantity_unit="kg",
        beneficiary_count=35,
        notes="To distribute with morning soup for elderly shelter residents.",
        status=RequestStatus.PENDING
    )

    req3 = DonationRequest(
        donation_id=don3.id,
        ngo_id=ngo1.id,
        requested_quantity=40.0,
        quantity_unit="kg",
        beneficiary_count=85,
        notes="Weekly fresh fruit supply for the children's afternoon snacks.",
        status=RequestStatus.COMPLETED
    )

    db.add_all([req1, req2, req3])
    db.commit()

    # 4. Create Deliveries
    del1 = DeliveryAssignment(
        request_id=req1.id,
        donation_id=don1.id,
        volunteer_id=volunteer1.id,
        status=DeliveryStatus.IN_TRANSIT,
        pickup_notes="Collected from Chef Marco in thermal hot box #3 at 1:15 PM.",
        current_lat=12.9525,
        current_lng=77.6135,
        pickup_time=now - timedelta(minutes=25)
    )

    del2 = DeliveryAssignment(
        request_id=req3.id,
        donation_id=don3.id,
        volunteer_id=volunteer2.id,
        status=DeliveryStatus.CONFIRMED,
        pickup_notes="40kg fresh fruit crates loaded onto tempo.",
        delivery_notes="Delivered to Hope Haven reception. Signed by Sister Mary.",
        proof_photo_url="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
        recipient_signature_name="Sister Mary D'Souza",
        pickup_time=now - timedelta(days=1, hours=3),
        delivered_time=now - timedelta(days=1, hours=2)
    )

    db.add_all([del1, del2])
    db.commit()

    # Tracking Logs for del1
    log1 = DeliveryTrackingLog(
        delivery_id=del1.id,
        status=DeliveryStatus.ACCEPTED,
        notes="Volunteer Alex Rivera accepted assignment",
        latitude=12.9609,
        longitude=77.6387,
        created_at=now - timedelta(minutes=45)
    )
    log2 = DeliveryTrackingLog(
        delivery_id=del1.id,
        status=DeliveryStatus.PICKUP_STARTED,
        notes="Heading towards Grand Plaza Hotel",
        latitude=12.9650,
        longitude=77.6200,
        created_at=now - timedelta(minutes=35)
    )
    log3 = DeliveryTrackingLog(
        delivery_id=del1.id,
        status=DeliveryStatus.PICKED_UP,
        notes="15kg Biryani verified hot and securely loaded",
        latitude=12.9698,
        longitude=77.6025,
        created_at=now - timedelta(minutes=25)
    )
    log4 = DeliveryTrackingLog(
        delivery_id=del1.id,
        status=DeliveryStatus.IN_TRANSIT,
        notes="En route to Hope Haven Shelter via Hosur Road",
        latitude=12.9525,
        longitude=77.6135,
        created_at=now - timedelta(minutes=10)
    )
    db.add_all([log1, log2, log3, log4])

    # 5. Reviews
    rev1 = Review(
        author_id=ngo1.id,
        target_id=donor1.id,
        delivery_id=del2.id,
        rating=5,
        comment="The fruit crates were exceptionally fresh and clean. The children enjoyed them thoroughly. Grand Plaza is a champion of food rescue!",
        role_context="NGO_TO_DONOR"
    )
    rev2 = Review(
        author_id=ngo1.id,
        target_id=volunteer2.id,
        delivery_id=del2.id,
        rating=5,
        comment="Priya arrived with a smile and carried all 40 kg into our dining hall. Outstanding volunteer spirit!",
        role_context="NGO_TO_VOLUNTEER"
    )
    db.add_all([rev1, rev2])

    # 6. Notifications
    notif1 = Notification(
        user_id=ngo1.id,
        title="Donation Request Approved! 🎉",
        message="Grand Plaza Hotel approved your request for 15kg Vegetable Biryani. Volunteer Alex Rivera is in transit!",
        type=NotificationType.REQUEST_APPROVED,
        related_id=req1.id,
        is_read=False
    )
    notif2 = Notification(
        user_id=donor1.id,
        title="Delivery in Progress 🚚",
        message="Alex Rivera has collected your food donation and is en route to Hope Haven.",
        type=NotificationType.DELIVERY_STATUS_CHANGE,
        related_id=del1.id,
        is_read=False
    )
    notif3 = Notification(
        user_id=volunteer1.id,
        title="Pickup Mission Active 🚴",
        message="Delivery to Hope Haven Shelter in Koramangala is active. Estimated arrival: 15 mins.",
        type=NotificationType.DELIVERY_ASSIGNED,
        related_id=del1.id,
        is_read=True
    )
    db.add_all([notif1, notif2, notif3])

    db.commit()
    print("Database seeding completed successfully!")

