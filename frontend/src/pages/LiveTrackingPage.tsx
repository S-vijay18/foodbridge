import React, { useState, useEffect } from 'react';
import {
  Truck, CheckCircle2, Clock, MapPin, Phone,
  User as UserIcon, ShieldCheck, ArrowRight, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { DeliveryAssignment } from '../types';
import { LiveTrackingMap } from '../components/LiveTrackingMap';

interface LiveTrackingPageProps {
  onNavigate: (tab: string) => void;
}

export const LiveTrackingPage: React.FC<LiveTrackingPageProps> = ({ onNavigate }) => {
  const [deliveries, setDeliveries] = useState<DeliveryAssignment[]>([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = async () => {
    try {
      const data = await api.getDeliveries();
      setDeliveries(data);
      if (data.length > 0 && !selectedDeliveryId) {
        setSelectedDeliveryId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load deliveries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    if (!selectedDeliveryId) return;
    const fetchTracking = async () => {
      try {
        const trk = await api.getTracking(selectedDeliveryId);
        setTrackingData(trk);
      } catch (e) {
        console.error('Failed to fetch tracking data', e);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, [selectedDeliveryId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
          Real-Time Logistics
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Live Dispatch & Transit Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor pickup verification, thermal transit status, and delivery confirmation step-by-step.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Connecting to live dispatch stream...</p>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto">
            <Truck size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Active Deliveries Right Now</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When a donor approves an NGO request, a delivery dispatch mission is launched here for volunteers.
          </p>
          <button
            onClick={() => onNavigate('marketplace')}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Browse Marketplace to Request Food
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Delivery Selector & Details */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Active Missions</h3>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {deliveries.map((del) => (
                  <button
                    key={del.id}
                    onClick={() => setSelectedDeliveryId(del.id)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                      selectedDeliveryId === del.id
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                        : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-extrabold text-slate-900">Mission #{del.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        del.status === 'CONFIRMED' || del.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : del.status === 'IN_TRANSIT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {del.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold truncate">
                      {del.donation?.title || 'Surplus Food'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      To: {del.request?.ngo?.profile?.organization_name || del.request?.ngo?.full_name || 'NGO Recipient'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Stakeholder Details */}
            {trackingData && (
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Logistics Parties</h4>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                      🍲
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-400 font-medium">Donor</p>
                      <p className="font-bold text-slate-900 truncate">{trackingData.donor_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{trackingData.pickup_location.address}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                      🏠
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-400 font-medium">Recipient NGO</p>
                      <p className="font-bold text-slate-900 truncate">{trackingData.ngo_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{trackingData.dropoff_location.address}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                      🚴
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-amber-700 font-medium">Courier Volunteer</p>
                      <p className="font-bold text-slate-900 truncate">{trackingData.volunteer_name}</p>
                      {trackingData.volunteer_phone && (
                        <p className="text-[11px] text-amber-800 font-semibold">{trackingData.volunteer_phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {trackingData.proof_photo_url && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="font-bold text-slate-700">Proof of Delivery Photo:</p>
                    <img
                      src={trackingData.proof_photo_url}
                      alt="Proof of delivery"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right 2 Columns: Live Map & Progress Tracker */}
          <div className="lg:col-span-2 space-y-6">
            {trackingData && (
              <>
                {/* Interactive Leaflet Map */}
                <LiveTrackingMap
                  pickup={{
                    lat: trackingData.pickup_location.lat,
                    lng: trackingData.pickup_location.lng,
                    address: trackingData.pickup_location.address,
                    name: trackingData.donor_name,
                  }}
                  dropoff={{
                    lat: trackingData.dropoff_location.lat,
                    lng: trackingData.dropoff_location.lng,
                    address: trackingData.dropoff_location.address,
                    name: trackingData.ngo_name,
                  }}
                  volunteer={
                    trackingData.current_volunteer_location
                      ? {
                          lat: trackingData.current_volunteer_location.lat,
                          lng: trackingData.current_volunteer_location.lng,
                          name: trackingData.volunteer_name,
                        }
                      : undefined
                  }
                  height="420px"
                />

                {/* Step Timeline */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {trackingData.food_title} ({trackingData.quantity})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Current Status: <strong className="text-emerald-700">{trackingData.status}</strong>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">Estimated Arrival</span>
                      <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                        {trackingData.estimated_arrival}
                      </span>
                    </div>
                  </div>

                  {/* Visual Step Progress Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
                    {trackingData.steps.map((step: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            step.completed
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {step.completed ? <CheckCircle2 size={16} /> : idx + 1}
                        </div>
                        <span
                          className={`text-[10px] leading-tight ${
                            step.completed ? 'font-bold text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Audit Trail Logs */}
                  {trackingData.logs && trackingData.logs.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700">Chronological Event Logs</h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {trackingData.logs.map((log: any, i: number) => (
                          <div
                            key={i}
                            className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              <span className="font-semibold text-slate-800">{log.status}</span>
                              <span className="text-slate-500">— {log.notes}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

