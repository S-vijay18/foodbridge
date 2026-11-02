import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Clock, MapPin, AlertTriangle, ShieldCheck,
  CheckCircle2, Sparkles, HeartHandshake, ArrowRight, Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Donation, DonationCategory, FoodDietType } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

interface MarketplacePageProps {
  onNavigate: (tab: string) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ onNavigate }) => {
  const { user, quickLoginAsRole } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDiet, setSelectedDiet] = useState<string>('All');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Request Modal State
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [requestQuantity, setRequestQuantity] = useState<number>(1);
  const [beneficiaries, setBeneficiaries] = useState<number>(20);
  const [requestNotes, setRequestNotes] = useState<string>('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  const categories = [
    'All',
    'Cooked Meals',
    'Raw Groceries',
    'Baked Goods',
    'Dairy & Refrigerated',
    'Packaged & Canned',
    'Fruits & Vegetables',
    'Beverages',
  ];

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const data = await api.getDonations({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        diet_type: selectedDiet === 'All' ? undefined : selectedDiet,
        urgent_only: urgentOnly,
        search: searchTerm.trim() || undefined,
      });
      setDonations(data);
    } catch (err) {
      console.error('Failed to fetch donations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [selectedCategory, selectedDiet, urgentOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonations();
  };

  const handleOpenRequest = (don: Donation) => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setSelectedDonation(don);
    setRequestQuantity(don.remaining_quantity);
    setBeneficiaries(don.estimated_meals || 20);
    setRequestNotes('');
    setRequestSuccess(null);
  };

  const handleSendRequest = async () => {
    if (!selectedDonation) return;
    setSubmittingRequest(true);
    try {
      await api.createRequest({
        donation_id: selectedDonation.id,
        requested_quantity: requestQuantity,
        quantity_unit: selectedDonation.quantity_unit,
        beneficiary_count: beneficiaries,
        notes: requestNotes,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setRequestSuccess(`Your request for ${requestQuantity} ${selectedDonation.quantity_unit} was successfully submitted! The donor will review it shortly.`);
      fetchDonations();
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
            Surplus Food Exchange
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Food Donation Marketplace
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Discover safe, verified surplus food ready for immediate pickup and distribution.
          </p>
        </div>

        {/* Action quick links */}
        <div className="flex items-center space-x-3">
          {(!user || user.role === 'donor') && (
            <button
              onClick={() => onNavigate('donate')}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-2"
            >
              <Utensils size={15} />
              <span>List Surplus Food</span>
            </button>
          )}
          {user?.role === 'ngo' && (
            <button
              onClick={() => onNavigate('ngo_dashboard')}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              My Requests Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by food name, hotel, locality (e.g. biryani, bread, Koramangala)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-4">
            {/* Diet Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Dietary:</span>
              {(['All', 'Vegetarian', 'Vegan', 'Non-Vegetarian'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDiet(d)}
                  className={`px-2.5 py-1 rounded-lg font-semibold ${
                    selectedDiet === d
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Urgency Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={(e) => setUrgentOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300"
              />
              <span className="font-semibold text-amber-700 flex items-center">
                ⚡ Urgent (&lt;12 hrs left)
              </span>
            </label>
          </div>

          <div className="text-slate-400">
            Showing <strong className="text-slate-700">{donations.length}</strong> available donations
          </div>
        </div>
      </div>

      {/* Grid of Donations */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Loading fresh donations...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto">
            <Utensils size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Food Listings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, dietary filters, or clearing the urgency toggle to find more surplus listings.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedDiet('All');
              setUrgentOnly(false);
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((don) => {
            const expiryDate = new Date(don.expiry_time);
            const isUrgent =
              (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60) <= 12;

            return (
              <div
                key={don.id}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image Header */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={
                        don.image_url ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={don.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges on image */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs rounded-full text-[11px] font-bold text-emerald-900 shadow-xs">
                        {don.category}
                      </span>
                      <span className="px-2 py-1 bg-emerald-950/80 backdrop-blur-xs rounded-full text-[10px] font-semibold text-emerald-200">
                        {don.diet_type}
                      </span>
                    </div>

                    {isUrgent && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-rose-600 text-white rounded-full text-[10px] font-bold shadow-xs animate-pulse">
                        ⚡ Urgent Pickup
                      </span>
                    )}

                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full text-xs font-extrabold text-emerald-800 shadow-xs">
                      ~{don.estimated_meals} Portions
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 line-clamp-1">{don.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{don.description}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Available Quantity:</span>
                        <span className="font-extrabold text-slate-900">
                          {don.remaining_quantity} {don.quantity_unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Storage Protocol:</span>
                        <span className="font-semibold text-emerald-800 text-[11px]">
                          {don.storage_req}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Safe Until:</span>
                        <span className="font-semibold text-amber-700 flex items-center text-[11px]">
                          <Clock size={12} className="mr-1" />
                          {expiryDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                          {expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 text-xs text-slate-600 pt-1">
                      <MapPin size={15} className="text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1 text-[11px]">{don.pickup_address}</span>
                    </div>

                    {don.allergens && don.allergens !== 'None reported' && (
                      <div className="text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg">
                        <strong>Allergens:</strong> {don.allergens}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenRequest(don)}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
                  >
                    <HeartHandshake size={15} />
                    <span>Request Food Donation</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REQUEST MODAL */}
      <Modal
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
        title="Submit Donation Request"
        maxWidth="max-w-md"
      >
        {selectedDonation && (
          <div className="space-y-4">
            {requestSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Request Dispatched!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{requestSuccess}</p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDonation(null);
                      onNavigate('ngo_dashboard');
                    }}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
                  >
                    View My Requests
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-emerald-50 rounded-2xl flex items-center space-x-3">
                  <img
                    src={selectedDonation.image_url}
                    alt={selectedDonation.title}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {selectedDonation.title}
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Total Stock: {selectedDonation.remaining_quantity}{' '}
                      {selectedDonation.quantity_unit}
                    </p>
                  </div>
                </div>

                {user && user.role !== 'ngo' && user.role !== 'admin' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      You are currently signed in as a <strong>{user.role}</strong>. Switching to an{' '}
                      <strong>NGO / Shelter</strong> account is recommended to request food for beneficiaries.
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <label className="font-bold text-slate-700">
                      Quantity Needed ({selectedDonation.quantity_unit})
                    </label>
                    <span className="font-extrabold text-emerald-700">
                      {requestQuantity} / {selectedDonation.remaining_quantity}{' '}
                      {selectedDonation.quantity_unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={selectedDonation.remaining_quantity}
                    step={selectedDonation.remaining_quantity > 50 ? 5 : 1}
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      min={1}
                      max={selectedDonation.remaining_quantity}
                      value={requestQuantity}
                      onChange={(e) =>
                        setRequestQuantity(
                          Math.min(
                            selectedDonation.remaining_quantity,
                            Math.max(1, Number(e.target.value))
                          )
                        )
                      }
                      className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setRequestQuantity(selectedDonation.remaining_quantity)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold"
                    >
                      Request Entire Stock
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Beneficiaries Fed
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Instructions / Notes for Donor
                  </label>
                  <textarea
                    rows={2}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="e.g. For our shelter children dinner; we have refrigerated storage ready."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  />
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-[11px] text-emerald-900 flex items-center space-x-2">
                  <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    No reservation lock until donor approves. Prevents accidental double-booking.
                  </span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDonation(null)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingRequest}
                    onClick={handleSendRequest}
                    className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
                  >
                    {submittingRequest ? 'Submitting...' : 'Confirm Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

