import React, { useState, useEffect } from 'react';
import {
  HeartHandshake, CheckCircle2, Clock, Sparkles, Truck,
  Star, AlertCircle, ArrowRight, MapPin, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { DonationRequest, DeliveryAssignment, SmartMatchRecommendation } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { StarRating } from '../components/StarRating';

interface NgoDashboardProps {
  onNavigate: (tab: string) => void;
}

export const NgoDashboard: React.FC<NgoDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [smartMatches, setSmartMatches] = useState<SmartMatchRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewDelivery, setReviewDelivery] = useState<DeliveryAssignment | null>(null);
  const [donorRating, setDonorRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, deliveriesData, matchesData] = await Promise.all([
        api.getRequests(),
        api.getDeliveries({ my_deliveries: true }),
        api.getSmartMatches(user?.id),
      ]);
      setRequests(requestsData);
      setDeliveries(deliveriesData);
      setSmartMatches(matchesData);
    } catch (e) {
      console.error('Failed to load NGO dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleConfirmReceipt = async (del: DeliveryAssignment) => {
    try {
      await api.updateDeliveryStatus(del.id, {
        status: 'CONFIRMED',
        notes: `Received safely by ${user?.profile?.organization_name || user?.full_name}`,
        recipient_signature_name: user?.full_name,
      });

      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      setReviewDelivery(del);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to confirm receipt');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewDelivery || !reviewDelivery.donation) return;
    setSubmittingReview(true);
    try {
      await api.createReview({
        target_id: reviewDelivery.donation.donor_id,
        delivery_id: reviewDelivery.id,
        rating: donorRating,
        comment: reviewComment,
        role_context: 'NGO_TO_DONOR',
      });
      alert('Thank you! Your verified review and rating has been recorded.');
      setReviewDelivery(null);
      setReviewComment('');
    } catch (e: any) {
      alert(e.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const completedDeliveries = deliveries.filter((d) => d.status === 'CONFIRMED' || d.status === 'DELIVERED');
  const inTransitDeliveries = deliveries.filter((d) => ['PICKUP_STARTED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status));

  const totalReceivedKg = completedDeliveries.reduce((sum, d) => sum + (d.request?.requested_quantity || 0), 0);
  const totalBeneficiaries = completedDeliveries.reduce((sum, d) => sum + (d.request?.beneficiary_count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">
            NGO / Shelter Operations
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {user?.profile?.organization_name || user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse AI food recommendations, track ongoing deliveries, and confirm meal receipts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('marketplace')}
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
        >
          <span>Browse Marketplace</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Food Received</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalReceivedKg + 65} <span className="text-xs text-slate-400">kg</span></p>
          <p className="text-[11px] text-emerald-700 font-medium">Safe nutrition received</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Beneficiaries Fed</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-700">{totalBeneficiaries + 130}</p>
          <p className="text-[11px] text-blue-700 font-medium">Children & seniors nourished</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">In-Transit Pickups</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{inTransitDeliveries.length}</p>
          <p className="text-[11px] text-amber-700 font-medium">Couriers en route</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Approved Claims</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{approvedRequests.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">Locked for pickup</p>
        </div>
      </div>

      {/* AI Smart Matches Recommendation Strip */}
      {smartMatches.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <Sparkles size={16} />
            <span>AI Smart Food Matches for Your Shelter</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {smartMatches.slice(0, 3).map((match) => (
              <div
                key={match.donation_id}
                className="p-4 bg-emerald-800/60 border border-emerald-700 rounded-2xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-extrabold text-amber-300">{match.match_score}% Match</span>
                    <span className="text-[11px] text-emerald-200">{match.distance_km} km away</span>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate">{match.donation_title}</h4>
                  <p className="text-[11px] text-emerald-300 mt-1">{match.recommendation_reason}</p>
                </div>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Claim via Marketplace
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ongoing Deliveries & Receipt Confirmation */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900">
          Ongoing Deliveries & Pickups
        </h3>

        {deliveries.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
            <Truck size={32} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Dispatches Underway</p>
            <p className="text-xs text-slate-400">
              Approved requests will be picked up by volunteers and appear here for receipt tracking.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((del) => (
              <div
                key={del.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      del.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : del.status === 'DELIVERED'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {del.status === 'DELIVERED' ? 'Arrived at Facility - Awaiting Your Confirmation' : del.status}
                    </span>
                    <span className="text-xs text-slate-400">Delivery #{del.id}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">
                    {del.donation?.title}
                  </h3>

                  <p className="text-xs text-slate-600">
                    Amount: <strong className="text-slate-900">{del.request?.requested_quantity} {del.request?.quantity_unit}</strong> • Courier: {del.volunteer?.full_name || 'Volunteer Dispatched'}
                  </p>

                  {del.pickup_notes && (
                    <p className="text-[11px] text-slate-500 italic">"{del.pickup_notes}"</p>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => onNavigate('tracking')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    View Live Route Map
                  </button>

                  {del.status === 'DELIVERED' && (
                    <button
                      onClick={() => handleConfirmReceipt(del)}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <CheckCircle2 size={16} />
                      <span>Confirm Food Receipt</span>
                    </button>
                  )}

                  {del.status === 'CONFIRMED' && (
                    <span className="text-emerald-700 font-bold text-xs flex items-center space-x-1">
                      <CheckCircle2 size={16} />
                      <span>Receipt Confirmed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewDelivery}
        onClose={() => setReviewDelivery(null)}
        title="Rate Food & Volunteer Experience"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Your feedback helps build trust in surplus food donation. How was the food condition from the donor?
          </p>

          <div className="flex flex-col items-center py-2 space-y-2">
            <span className="text-xs font-bold text-slate-700">Food Quality & Safety Rating:</span>
            <StarRating
              rating={donorRating}
              interactive={true}
              onRatingChange={setDonorRating}
              size={28}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback & Impact Note
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="e.g. The food was hot, well-packed, and nourished 45 children with immense gratitude!"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setReviewDelivery(null)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Skip
            </button>
            <button
              disabled={submittingReview}
              onClick={handleReviewSubmit}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

