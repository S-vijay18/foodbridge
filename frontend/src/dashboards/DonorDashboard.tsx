import React, { useState, useEffect } from 'react';
import {
  Utensils, PlusCircle, CheckCircle2, XCircle, Clock,
  MapPin, HeartHandshake, AlertTriangle, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Donation, DonationRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

interface DonorDashboardProps {
  onNavigate: (tab: string) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'history'>('requests');
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectingRequestId, setRejectingRequestId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [donationsData, requestsData] = await Promise.all([
        api.getDonations({ my_donations: true }),
        api.getRequests(),
      ]);
      setDonations(donationsData);
      setRequests(requestsData);
    } catch (e) {
      console.error('Failed to load donor dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      await api.approveRequest(id);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingRequestId) return;
    setActionLoading(true);
    try {
      await api.rejectRequest(rejectingRequestId, rejectReason);
      setRejectingRequestId(null);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const activeDonations = donations.filter((d) => ['AVAILABLE', 'PARTIALLY_RESERVED'].includes(d.status));
  const completedDonations = donations.filter((d) => d.status === 'COMPLETED');

  const totalKg = donations.reduce((sum, d) => sum + d.quantity, 0);
  const totalMeals = donations.reduce((sum, d) => sum + (d.estimated_meals || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
            Donor Dashboard
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {user?.profile?.organization_name || user?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage surplus food postings, review recipient NGO requests, and track social impact.
          </p>
        </div>

        <button
          onClick={() => onNavigate('donate')}
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
        >
          <PlusCircle size={16} />
          <span>Donate Food</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Food Donated</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalKg} <span className="text-xs text-slate-400">kg</span></p>
          <p className="text-[11px] text-emerald-700 font-medium">~{totalMeals} estimated meals</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Pending Requests</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pendingRequests.length}</p>
          <p className="text-[11px] text-amber-700 font-medium">Awaiting your approval</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Active Listings</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{activeDonations.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">In marketplace</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Completed Rescues</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-700">{completedDonations.length}</p>
          <p className="text-[11px] text-blue-700 font-medium">Delivered to shelters</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'requests'
              ? 'text-emerald-700 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Incoming NGO Requests ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'active'
              ? 'text-emerald-700 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Listings ({activeDonations.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'history'
              ? 'text-emerald-700 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Donation History ({donations.length})
        </button>
      </div>

      {/* Tab 1: Incoming NGO Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
              <HeartHandshake size={32} className="text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Pending Requests</p>
              <p className="text-xs text-slate-400">
                When verified shelters request your food, they will appear here for approval.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending Approval
                    </span>
                    <span className="text-xs text-slate-400">
                      Request #{req.id} • {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">
                    {req.ngo?.profile?.organization_name || req.ngo?.full_name}
                  </h3>

                  <p className="text-xs text-slate-600">
                    Requested: <strong className="text-emerald-800 font-extrabold">{req.requested_quantity} {req.quantity_unit}</strong> of <em>"{req.donation?.title}"</em>
                  </p>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <p><strong>Beneficiaries to feed:</strong> ~{req.beneficiary_count} people</p>
                    {req.notes && <p className="mt-1"><strong>Note:</strong> "{req.notes}"</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    disabled={actionLoading}
                    onClick={() => setRejectingRequestId(req.id)}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleApprove(req.id)}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve & Dispatch</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Active Listings */}
      {activeTab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeDonations.length === 0 ? (
            <div className="col-span-3 bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
              <Utensils size={32} className="text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Active Listings</p>
              <button
                onClick={() => onNavigate('donate')}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Create a Food Donation
              </button>
            </div>
          ) : (
            activeDonations.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="h-40 overflow-hidden relative bg-slate-100">
                  <img src={d.image_url} alt={d.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 rounded-full text-[11px] font-bold text-emerald-800">
                    {d.category}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 truncate">{d.title}</h3>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>Remaining: <strong>{d.remaining_quantity} {d.quantity_unit}</strong></p>
                    <p className="text-amber-700">Safe until: {new Date(d.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="p-4">Donation</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Total Qty</th>
                  <th className="p-4">Meals</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donations.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{d.title}</td>
                    <td className="p-4">{d.category}</td>
                    <td className="p-4">{d.quantity} {d.quantity_unit}</td>
                    <td className="p-4 font-semibold text-emerald-700">~{d.estimated_meals}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingRequestId}
        onClose={() => setRejectingRequestId(null)}
        title="Decline Donation Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a brief reason for declining (e.g. food already allocated to another emergency shelter, storage limitations):
          </p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for declining request..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setRejectingRequestId(null)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              disabled={actionLoading}
              onClick={handleReject}
              className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              {actionLoading ? 'Declining...' : 'Confirm Decline'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

