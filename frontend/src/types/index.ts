export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'admin';

export type OrganizationType =
  | 'Restaurant'
  | 'Hotel'
  | 'Catering Service'
  | 'Supermarket'
  | 'Bakery'
  | 'Individual Donor'
  | 'NGO / Charity'
  | 'Orphanage'
  | 'Old Age Home'
  | 'Community Kitchen'
  | 'Volunteer Group'
  | 'Other';

export type DonationCategory =
  | 'Cooked Meals'
  | 'Raw Groceries'
  | 'Baked Goods'
  | 'Dairy & Refrigerated'
  | 'Packaged & Canned'
  | 'Fruits & Vegetables'
  | 'Beverages'
  | 'Other';

export type FoodDietType = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';

export type StorageType =
  | 'Refrigerated (0-4°C)'
  | 'Frozen (-18°C)'
  | 'Ambient / Room Temp'
  | 'Hot Holding (>60°C)';

export type DonationStatus =
  | 'AVAILABLE'
  | 'PARTIALLY_RESERVED'
  | 'RESERVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type DeliveryStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PICKUP_STARTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CONFIRMED';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type NotificationType =
  | 'DONATION_NEW'
  | 'REQUEST_RECEIVED'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'DELIVERY_ASSIGNED'
  | 'DELIVERY_STATUS_CHANGE'
  | 'RECEIPT_CONFIRMED'
  | 'EXPIRY_WARNING'
  | 'SYSTEM_ANNOUNCEMENT';

export interface UserProfile {
  id?: number;
  user_id?: number;
  organization_name?: string;
  organization_type?: OrganizationType;
  tax_id_or_reg_number?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  capacity_meals_per_day?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  is_active: boolean;
  is_verified: boolean;
  verification_status: VerificationStatus;
  verification_docs?: string;
  created_at: string;
  profile?: UserProfile;
}

export interface Donation {
  id: number;
  donor_id: number;
  title: string;
  category: DonationCategory;
  description: string;
  image_url?: string;
  quantity: number;
  quantity_unit: string;
  remaining_quantity: number;
  estimated_meals: number;
  prep_time: string;
  expiry_time: string;
  diet_type: FoodDietType;
  allergens?: string;
  storage_req: StorageType;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_instructions?: string;
  max_pickup_distance_km: number;
  safety_declared: boolean;
  status: DonationStatus;
  created_at: string;
  updated_at: string;
  donor?: User;
}

export interface DonationRequest {
  id: number;
  donation_id: number;
  ngo_id: number;
  requested_quantity: number;
  quantity_unit: string;
  beneficiary_count: number;
  notes?: string;
  status: RequestStatus;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  donation?: Donation;
  ngo?: User;
}

export interface DeliveryTrackingLog {
  id: number;
  delivery_id: number;
  status: DeliveryStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface DeliveryAssignment {
  id: number;
  request_id: number;
  donation_id: number;
  volunteer_id?: number;
  status: DeliveryStatus;
  pickup_notes?: string;
  delivery_notes?: string;
  proof_photo_url?: string;
  recipient_signature_name?: string;
  estimated_arrival?: string;
  pickup_time?: string;
  delivered_time?: string;
  current_lat?: number;
  current_lng?: number;
  created_at: string;
  updated_at: string;
  request?: DonationRequest;
  donation?: Donation;
  volunteer?: User;
  tracking_logs?: DeliveryTrackingLog[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  related_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface ReviewItem {
  id: number;
  author_id: number;
  target_id: number;
  delivery_id?: number;
  rating: number;
  comment?: string;
  role_context?: string;
  created_at: string;
  author_name?: string;
  author_org?: string;
}

export interface DashboardMetrics {
  total_users: number;
  total_donors: number;
  total_ngos: number;
  total_volunteers: number;
  total_donations: number;
  active_donations: number;
  completed_donations: number;
  total_kg_donated: number;
  estimated_meals_served: number;
  co2_offset_kg: number;
  successful_deliveries: number;
  pending_deliveries: number;
}

export interface ImpactMetrics {
  meals_provided: number;
  food_saved_kg: number;
  co2_reduced_kg: number;
  active_organizations: number;
  volunteer_hours_logged: number;
}

export interface AIChatResponse {
  reply: string;
  suggested_actions?: string[];
  source: string;
}

export interface PortionEstimateResponse {
  estimated_portions: number;
  estimated_calories_per_portion: number;
  co2_emissions_saved_kg: number;
  explanation: string;
}

export interface SmartMatchRecommendation {
  donation_id: number;
  donation_title: string;
  category: string;
  quantity: number;
  quantity_unit: string;
  distance_km: number;
  urgency_hours_left: number;
  match_score: number;
  recommendation_reason: string;
}
