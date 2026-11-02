import React, { useState, useEffect } from 'react';
import {
  Truck, CheckCircle2, Clock, MapPin, Camera,
  Navigation, User as UserIcon, AlertCircle, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { DeliveryAssignment, DeliveryStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';

interface VolunteerDashboardProps {
  onNavigate: (tab: string) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [availableMissions, setAvailableMissions] = useState<DeliveryAssignment[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<DeliveryAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);

  // Proof of delivery modal state
  const [completingDelivery, setCompletingDelivery] = useState<DeliveryAssignment | null>(null);
  const [proofPhoto, setProofPhoto] = useState(
    'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'
  );
  const [signatureName, setSignatureName] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [avail, mine] = await Promise.all([
        api.getDeliveries({ available_only: true }),
        api.getDeliveries({ my_deliveries: true }),
      ]);
      setAvailableMissions(avail);
      setMyDeliveries(mine);
    } catch (e) {
      console.error('Failed to load volunteer deliveries', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (delId: number) => {
    setActionLoading(true);
    try {
      await api.acceptDelivery(delId);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      await loadData();
      setActiveTab('active');
    } catch (e: any) {
      alert(e.message || 'Failed to accept delivery mission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (delId: number, nextStatus: DeliveryStatus, notes?: string) => {
    setActionLoading(true);
    try {
      await api.updateDeliveryStatus(delId, {
        status: nextStatus,
        notes: notes || `Volunteer progressed status to ${nextStatus}`,
      });
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteDeliveryWithProof = async () => {
    if (!completingDelivery) return;
    setActionLoading(true);
    try {
      await api.updateDeliveryStatus(completingDelivery.id, {
        status: 'DELIVERED',
        proof_photo_url: proofPhoto,
        recipient_signature_name: signatureName || 'Recipient Staff',
        delivery_notes: deliveryNotes,
        notes: `Delivered to ${signatureName || 'Shelter'}. Proof photo uploaded.`,
      });

      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      setCompletingDelivery(null);
      await loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to complete delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const activeDeliveries = myDeliveries.filter((d) => !['DELIVERED', 'CONFIRMED'].includes(d.status));
  const completedDeliveries = myDeliveries.filter((d) => ['DELIVERED', 'CONFIRMED'].includes(d.status));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">
            Volunteer Dispatcher
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            {user?.full_name || 'Delivery Volunteer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Claim available pickup tasks, navigate to shelters, and upload proof-of-delivery handovers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('tracking')}
          className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
        >
          <Navigation size={16} />
          <span>Live Tracking Map</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Active Missions</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{activeDeliveries.length}</p>
          <p className="text-[11px] text-amber-700 font-medium">Currently in progress</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Available Missions</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{availableMissions.length}</p>
          <p className="text-[11px] text-slate-400 font-medium">Ready for pickup</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Completed Drops</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-700">{completedDeliveries.length + 8}</p>
          <p className="text-[11px] text-blue-700 font-medium">Verified handovers</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Logged Volunteer Hours</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-700">18.5 <span className="text-xs text-slate-400">hrs</span></p>
          <p className="text-[11px] text-purple-700 font-medium">Green courier badge</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'active'
              ? 'text-emerald-700 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My Active Missions ({activeDeliveries.length})
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'available'
              ? 'text-emerald-700 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Available Pickups ({availableMissions.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'completed'
              ? 'text-emerald-700 border-b-2 border-emerald-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Completed History ({completedDeliveries.length})
        </button>
      </div>

      {/* Tab 1: My Active Missions */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeDeliveries.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
              <Truck size={32} className="text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Active Missions Claimed</p>
              <button
                onClick={() => setActiveTab('available')}
                className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Browse Available Pickups
              </button>
            </div>
          ) : (
            activeDeliveries.map((del) => (
              <div
                key={del.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Status: {del.status}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 mt-1">
                      {del.donation?.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Quantity: {del.request?.requested_quantity} {del.request?.quantity_unit} (~{del.donation?.estimated_meals} portions)
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('tracking')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold self-start sm:self-auto flex items-center space-x-1"
                  >
                    <Navigation size={14} />
                    <span>Open Live Route Map</span>
                  </button>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                    <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                      <span>1. Pickup From Donor:</span>
                    </p>
                    <p className="font-semibold text-slate-900">{del.donation?.donor?.profile?.organization_name || 'Donor'}</p>
                    <p className="text-slate-600">{del.donation?.pickup_address}</p>
                    {del.donation?.pickup_instructions && (
                      <p className="text-emerald-800 italic mt-1">Note: {del.donation.pickup_instructions}</p>
                    )}
                  </div>

                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
                    <p className="font-bold text-blue-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                      <span>2. Deliver To Recipient:</span>
                    </p>
                    <p className="font-semibold text-slate-900">{del.request?.ngo?.profile?.organization_name || 'NGO Shelter'}</p>
                    <p className="text-slate-600">{del.request?.ngo?.address || 'Shelter Address'}</p>
                    {del.request?.notes && (
                      <p className="text-blue-800 italic mt-1">Note: {del.request.notes}</p>
                    )}
                  </div>
                </div>

                {/* Step Transition Controls */}
                <div className="pt-2 flex flex-wrap gap-3 items-center">
                  <span className="text-xs font-bold text-slate-500 mr-2">Action:</span>

                  {del.status === 'ACCEPTED' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(del.id, 'PICKUP_STARTED', 'Heading towards donor address for pickup.')}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Start Trip to Pickup Location ➔
                    </button>
                  )}

                  {del.status === 'PICKUP_STARTED' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(del.id, 'PICKED_UP', 'Food inspected, thermal storage secured, and safely collected.')}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Confirm Food Picked Up ➔
                    </button>
                  )}

                  {del.status === 'PICKED_UP' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(del.id, 'IN_TRANSIT', 'Departed donor kitchen; en route to shelter.')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Begin Transit to Shelter ➔
                    </button>
                  )}

                  {del.status === 'IN_TRANSIT' && (
                    <button
                      disabled={actionLoading}
                      onClick={() => setCompletingDelivery(del)}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center space-x-2"
                    >
                      <Camera size={15} />
                      <span>Arrived at Shelter & Upload Proof ➔</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Available Pickups */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableMissions.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700">All Pickups Currently Claimed</p>
              <p className="text-xs text-slate-400">
                Check back shortly. As donors approve requests, new pickup missions appear here.
              </p>
            </div>
          ) : (
            availableMissions.map((del) => (
              <div
                key={del.id}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Unassigned Pickup Mission
                    </span>
                    <span className="text-xs text-slate-400">Ready for pickup</span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">
                    {del.donation?.title}
                  </h3>

                  <p className="text-xs text-slate-600">
                    Amount: <strong className="text-slate-900">{del.request?.requested_quantity} {del.request?.quantity_unit}</strong> • From: {del.donation?.pickup_address}
                  </p>
                  <p className="text-xs text-slate-500">
                    Destination: {del.request?.ngo?.profile?.organization_name || 'NGO Recipient'} ({del.request?.ngo?.address})
                  </p>
                </div>

                <button
                  disabled={actionLoading}
                  onClick={() => handleAccept(del.id)}
                  className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  Accept Delivery Mission
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Completed History */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedDeliveries.map((del) => (
            <div
              key={del.id}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-900">{del.donation?.title}</span>
                <p className="text-slate-500 mt-0.5">
                  Delivered to {del.request?.ngo?.profile?.organization_name || 'Shelter'}
                </p>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full text-[11px] flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Verified Delivered</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Proof of Delivery Modal */}
      <Modal
        isOpen={!!completingDelivery}
        onClose={() => setCompletingDelivery(null)}
        title="Proof of Delivery & Handover"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Confirm safe delivery of food to the recipient organization with photo verification:
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Recipient Staff / Receiver Full Name
            </label>
            <input
              type="text"
              required
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="e.g. Sister Mary or Center In-Charge"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proof of Delivery Photo URL
            </label>
            <input
              type="url"
              value={proofPhoto}
              onChange={(e) => setProofPhoto(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {proofPhoto && (
              <img
                src={proofPhoto}
                alt="Delivery proof"
                className="w-full h-28 object-cover rounded-xl mt-2 border border-slate-200"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Handover Notes
            </label>
            <textarea
              rows={2}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Handed over 15kg hot biryani containers at shelter dining hall."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setCompletingDelivery(null)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              disabled={actionLoading}
              onClick={handleCompleteDeliveryWithProof}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              {actionLoading ? 'Submitting...' : 'Confirm Delivery Complete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

