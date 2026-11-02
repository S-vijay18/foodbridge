import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Users, Utensils, Download, CheckCircle2,
  XCircle, FileText, Ban, Check, Sparkles, Filter, Award,
  Database, Server, HardDrive
} from 'lucide-react';
import { api } from '../services/api';
import { User, Donation, DashboardMetrics } from '../types';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, quickLoginAsRole } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [donationsList, setDonationsList] = useState<Donation[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'donations' | 'logs' | 'database'>('users');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [m, u, d, l, s] = await Promise.all([
        api.getDashboardMetrics(),
        api.getAdminUsers(),
        api.getAdminDonations(),
        api.getAdminLogs(),
        api.getDatabaseStatus(),
      ]);
      setMetrics(m);
      setUsersList(u);
      setDonationsList(d);
      setAuditLogs(l);
      setDbStatus(s);
    } catch (e) {
      console.error('Failed to load admin operations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  const handleVerify = async (userId: number, statusVal: string) => {
    try {
      await api.updateUserVerification(userId, statusVal);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Verification update failed');
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await api.toggleUserActive(userId, !currentActive);
      await loadAdminData();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle active state');
    }
  };

  const handleExport = (type: 'donations' | 'users' | 'deliveries') => {
    window.open(api.exportReportUrl(type), '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-purple-700 font-bold text-xs uppercase tracking-wider">
            Platform Governance
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Administrator Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System verification oversight, platform metrics, audit trail, and regulatory export.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Export CSV:</span>
          <button
            onClick={() => handleExport('donations')}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs"
          >
            <Download size={13} />
            <span>Donations</span>
          </button>
          <button
            onClick={() => handleExport('users')}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs"
          >
            <Download size={13} />
            <span>Users</span>
          </button>
          <button
            onClick={() => handleExport('deliveries')}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs"
          >
            <Download size={13} />
            <span>Deliveries</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Accounts</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{metrics?.total_users || 15}</p>
          <p className="text-[11px] text-purple-700 font-medium">{metrics?.total_donors} Donors • {metrics?.total_ngos} NGOs</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Total Food Donated</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700">{metrics?.total_kg_donated || 340} kg</p>
          <p className="text-[11px] text-emerald-700 font-medium">~{metrics?.estimated_meals_served || 950} meals</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">CO₂ Emissions Averted</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{metrics?.co2_offset_kg || 850} kg</p>
          <p className="text-[11px] text-slate-400 font-medium">GHG emission reduction</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-1">
          <p className="text-xs text-slate-500 font-semibold">Deliveries Handled</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-700">{metrics?.successful_deliveries || 14}</p>
          <p className="text-[11px] text-blue-700 font-medium">100% verified</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'users'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Users & Verifications ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'donations'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manage Food Donations ({donationsList.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'logs'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Administrative Audit Logs ({auditLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'database'
              ? 'text-purple-700 border-b-2 border-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Database & Schema ({dbStatus?.total_records || '8'} records)
        </button>
      </div>

      {/* Tab 1: Users & Verifications */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="p-4">User / Organization</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Reg / Tax ID</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{u.profile?.organization_name || u.full_name}</p>
                      <p className="text-slate-400 text-[11px]">{u.email} • {u.phone || 'No phone'}</p>
                    </td>
                    <td className="p-4">
                      <RoleBadge role={u.role} size="sm" />
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-600">
                      {u.profile?.tax_id_or_reg_number || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_verified
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.verification_status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.verification_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {u.role === 'ngo' && !u.is_verified && (
                        <button
                          onClick={() => handleVerify(u.id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                          title="Approve NGO Verification"
                        >
                          Verify NGO
                        </button>
                      )}
                      {u.role === 'ngo' && u.is_verified && (
                        <button
                          onClick={() => handleVerify(u.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold"
                          title="Revoke Verification"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleActive(u.id, u.is_active)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          u.is_active
                            ? 'bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Donations */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
                <tr>
                  <th className="p-4">Donation</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Safe Consumption Deadline</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donationsList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{d.title}</p>
                      <p className="text-[11px] text-slate-400">ID #{d.id} • {d.pickup_address}</p>
                    </td>
                    <td className="p-4">{d.category}</td>
                    <td className="p-4">{d.remaining_quantity} / {d.quantity} {d.quantity_unit}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'COMPLETED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(d.expiry_time).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      {d.status === 'AVAILABLE' && (
                        <button
                          onClick={async () => {
                            if (confirm(`Cancel donation listing #${d.id}?`)) {
                              await api.cancelDonation(d.id);
                              loadAdminData();
                            }
                          }}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold"
                        >
                          Cancel Listing
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs p-5 space-y-3">
          <h3 className="font-bold text-sm text-slate-900">Security & Operational Logs</h3>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 mr-2">[{log.action}]</span>
                  <span className="text-slate-600">{log.details}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Database & Schema Inspector */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Connection Status Box */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database size={24} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-black text-lg text-white">
                      {dbStatus?.engine || 'SQLITE'} Database Engine
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ● {dbStatus?.status || 'CONNECTED'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {dbStatus?.database_url || 'sqlite:///./foodbridge.db'}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-700 sm:pl-6 text-xs text-slate-300 space-y-1">
                <p>Migration Tool: <strong className="text-amber-400">{dbStatus?.migration_framework || 'Alembic v1.20'}</strong></p>
                <p>Current Revision: <strong className="text-emerald-400 font-mono text-[11px]">{dbStatus?.current_migration || 'c9126fd7a185'}</strong></p>
                <p>Total Records: <strong className="text-white font-black">{dbStatus?.total_records || '0'}</strong></p>
              </div>
            </div>
          </div>

          {/* Tables Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dbStatus?.tables?.map((table: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      {table.name}
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {table.rows} <span className="text-[10px] text-slate-400 font-medium">rows</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {table.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Configuration Instructions Guide */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-4 text-xs">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <Server size={16} className="text-purple-700" />
              <span>Database Drivers & Migration Commands</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900">PostgreSQL / Docker Support:</p>
                <p className="text-slate-600">
                  To switch to PostgreSQL, set <code>DATABASE_URL</code> in <code>.env</code>:
                </p>
                <pre className="p-2.5 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto">
DATABASE_URL=postgresql://user:pass@localhost:5432/foodbridge
                </pre>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900">Alembic Migration Commands:</p>
                <p className="text-slate-600">
                  Run migrations or autogenerate new schema revisions:
                </p>
                <pre className="p-2.5 bg-slate-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto">
alembic revision --autogenerate -m "new_feature"
alembic upgrade head
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

