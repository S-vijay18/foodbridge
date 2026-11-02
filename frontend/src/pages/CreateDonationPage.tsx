import React, { useState, useEffect } from 'react';
import {
  Utensils, Sparkles, Clock, ShieldCheck, AlertTriangle,
  MapPin, CheckCircle2, ArrowRight, Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { DonationCategory, FoodDietType, StorageType, PortionEstimateResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { SafetyBanner } from '../components/SafetyBanner';

interface CreateDonationPageProps {
  onNavigate: (tab: string) => void;
}

export const CreateDonationPage: React.FC<CreateDonationPageProps> = ({ onNavigate }) => {
  const { user, quickLoginAsRole } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DonationCategory>('Cooked Meals');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(20);
  const [quantityUnit, setQuantityUnit] = useState<string>('kg');
  const [dietType, setDietType] = useState<FoodDietType>('Vegetarian');
  const [allergens, setAllergens] = useState('None reported');
  const [storageReq, setStorageReq] = useState<StorageType>('Hot Holding (>60°C)');
  const [pickupAddress, setPickupAddress] = useState(
    user?.address || 'Grand Plaza Hotel Kitchen, Gate 3, Residency Road, Bangalore'
  );
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [safetyDeclared, setSafetyDeclared] = useState(false);

  // Default times: prep time 1 hour ago, expiry 6 hours in future
  const now = new Date();
  const defaultPrep = new Date(now.getTime() - 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultExpiry = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [prepTime, setPrepTime] = useState(defaultPrep);
  const [expiryTime, setExpiryTime] = useState(defaultExpiry);

  const [aiEstimate, setAiEstimate] = useState<PortionEstimateResponse | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedDonationId, setPublishedDonationId] = useState<number | null>(null);

  // Preset Realistic Culinary Photos for rapid selection
  const presetPhotos: Record<DonationCategory, string[]> = {
    'Cooked Meals': [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
    ],
    'Raw Groceries': [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    ],
    'Baked Goods': [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    ],
    'Dairy & Refrigerated': [
      'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    ],
    'Packaged & Canned': [
      'https://images.unsplash.com/photo-1584473457406-624048518851?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
    ],
    'Fruits & Vegetables': [
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ],
    'Beverages': [
      'https://images.unsplash.com/photo-1622484214143-69024f2b963e?auto=format&fit=crop&w=800&q=80',
    ],
    'Other': [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ],
  };

  // Set default image when category changes
  useEffect(() => {
    const list = presetPhotos[category] || presetPhotos['Cooked Meals'];
    if (!imageUrl || Object.values(presetPhotos).flat().includes(imageUrl)) {
      setImageUrl(list[0]);
    }
  }, [category]);

  // Recalculate AI Portions
  useEffect(() => {
    const calcPortions = async () => {
      if (quantity <= 0) return;
      setIsEstimating(true);
      try {
        const est = await api.estimatePortions({
          category,
          quantity: Number(quantity),
          quantity_unit: quantityUnit,
        });
        setAiEstimate(est);
      } catch (e) {
        console.error('Portion estimate error', e);
      } finally {
        setIsEstimating(false);
      }
    };
    calcPortions();
  }, [category, quantity, quantityUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate future expiry
    const expiryDateObj = new Date(expiryTime);
    if (expiryDateObj <= new Date()) {
      setError('Food safety violation: The consumption expiry deadline must be strictly in the future.');
      return;
    }

    if (!safetyDeclared) {
      setError('You must confirm the Food Safety Handling Declaration to publish.');
      return;
    }

    // Auto-login as donor if not signed in for smooth flow
    if (!user) {
      await quickLoginAsRole('donor');
    }

    setIsSubmitting(true);
    try {
      const created = await api.createDonation({
        title,
        category,
        description,
        image_url: imageUrl,
        quantity: Number(quantity),
        quantity_unit: quantityUnit,
        prep_time: new Date(prepTime).toISOString(),
        expiry_time: new Date(expiryTime).toISOString(),
        diet_type: dietType,
        allergens,
        storage_req: storageReq,
        pickup_address: pickupAddress,
        pickup_instructions: pickupInstructions,
        max_pickup_distance_km: Number(maxDistance),
        safety_declared: true,
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setPublishedDonationId(created.id);
    } catch (err: any) {
      setError(err.message || 'Failed to create donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (publishedDonationId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto shadow-md">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Donation Successfully Published!</h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Your listing <strong>"{title}"</strong> has been broadcast to nearby verified shelters and orphanages. You will receive an instant notification when a request is made.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('donor_dashboard')}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Go to Donor Dashboard
          </button>
          <button
            onClick={() => {
              setPublishedDonationId(null);
              setTitle('');
              setDescription('');
            }}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
          >
            Publish Another Donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
          Donor Portal
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Create Food Donation Listing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Provide accurate food details, storage specifications, and expiry deadlines to protect nutrition and food safety.
        </p>
      </div>

      <SafetyBanner
        title="Safe Food Donation Protocol"
        message="FoodBridge prohibits the donation of spoiled, expired, or partially consumed food. All food must be kept either hot (>60°C) or cold (<4°C), and labeled with potential allergens."
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center space-x-2">
          <AlertTriangle size={18} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Food Details */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Utensils size={18} className="text-emerald-700" />
            <span>1. Food Characteristics & Classification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Food Item Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Vegetable Dum Biryani & Curry"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Food Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DonationCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Raw Groceries">Raw Groceries</option>
                <option value="Baked Goods">Baked Goods</option>
                <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
                <option value="Packaged & Canned">Packaged & Canned</option>
                <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description & Preparation Details *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Cooked this morning for a corporate luncheon buffet. Untouched surplus kept continuously in commercial thermal hot boxes."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Quantity & AI Meal Portion Estimator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit *</label>
              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                <option value="kg">kg (Kilograms)</option>
                <option value="portions">Portions / Plates</option>
                <option value="litres">Litres</option>
                <option value="packets">Packets / Boxes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Type *</label>
              <select
                value={dietType}
                onChange={(e) => setDietType(e.target.value as FoodDietType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              >
                <option value="Vegetarian">Vegetarian (Pure Veg)</option>
                <option value="Vegan">Vegan (Plant-Based)</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          {/* Dynamic AI Estimation Box */}
          {aiEstimate && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs">
              <Sparkles size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-extrabold text-emerald-950 flex items-center gap-2">
                  <span>AI Meal Yield:</span>
                  <span className="text-emerald-800 font-black text-sm">
                    ~{aiEstimate.estimated_portions} Meal Portions
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    (Estimated ~{aiEstimate.co2_emissions_saved_kg} kg CO₂ saved)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  {aiEstimate.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Photo Selection */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-slate-700">
              Food Photo (Select preset or provide custom URL)
            </label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {(presetPhotos[category] || []).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`preset-${i}`}
                  onClick={() => setImageUrl(img)}
                  className={`w-20 h-16 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                    imageUrl === img
                      ? 'border-emerald-700 scale-105 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste external image URL..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Section 2: Safety & Timestamps */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck size={18} className="text-emerald-700" />
            <span>2. Storage Protocol & Consumption Expiry</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preparation Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Safe Consumption Expiry Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Must be strictly in the future. Listing automatically expires past this timestamp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storage & Temperature Requirements *
              </label>
              <select
                value={storageReq}
                onChange={(e) => setStorageReq(e.target.value as StorageType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="Hot Holding (>60°C)">Hot Holding (&gt;60°C)</option>
                <option value="Refrigerated (0-4°C)">Refrigerated (0-4°C)</option>
                <option value="Frozen (-18°C)">Frozen (-18°C)</option>
                <option value="Ambient / Room Temp">Ambient / Room Temp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Allergen Disclosures
              </label>
              <input
                type="text"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="e.g. Contains dairy (paneer) and tree nuts"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Pickup Location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <MapPin size={18} className="text-emerald-700" />
            <span>3. Pickup Logistics & Dispatch</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Address *</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. 45 Residency Road, Bangalore, Landmark: Opp Commercial Bank"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Volunteer / Courier Pickup Instructions
              </label>
              <input
                type="text"
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                placeholder="e.g. Report to Kitchen Gate 3, bring insulated crates"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Max Pickup Distance Radius (km)
              </label>
              <input
                type="number"
                min={2}
                max={60}
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Safety Confirmation Checkbox */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-xs text-emerald-950">
            <input
              type="checkbox"
              id="confirmSafety"
              checked={safetyDeclared}
              onChange={(e) => setSafetyDeclared(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-emerald-700 rounded-md focus:ring-emerald-600 border-slate-300 cursor-pointer"
            />
            <label htmlFor="confirmSafety" className="cursor-pointer leading-relaxed text-[11px]">
              <strong>Donor Food Safety Warranty:</strong> I certify that this food was prepared and stored following hygienic standards, has not exceeded temperature limits, has not been touched by consumers, and is safe and fit for dignified consumption.
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Utensils size={18} />
            <span>{isSubmitting ? 'Publishing Food Listing...' : 'Publish Food Donation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

