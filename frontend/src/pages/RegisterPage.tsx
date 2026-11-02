import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { UserRole, OrganizationType } from '../types';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('Restaurant');
  const [taxId, setTaxId] = useState('');
  const [bio, setBio] = useState('');
  const [safetyAgreed, setSafetyAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safetyAgreed) {
      setError('Please agree to the FoodBridge Safety & Hygiene Declaration to proceed.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await register({
        email,
        password,
        full_name: fullName,
        role,
        phone,
        address,
        organization_name: orgName || fullName,
        organization_type: orgType,
        tax_id_or_reg_number: taxId,
        bio,
      });

      if (role === 'donor') onNavigate('donor_dashboard');
      else if (role === 'ngo') onNavigate('ngo_dashboard');
      else if (role === 'volunteer') onNavigate('volunteer_dashboard');
      else onNavigate('marketplace');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white shadow-md cursor-pointer"
          >
            <HeartHandshake size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Your FoodBridge Account
          </h2>
          <p className="text-xs text-slate-500">
            Join the decentralized surplus food rescue network
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'donor' as UserRole, label: '🏨 Food Donor', sub: 'Hotels, Caterers' },
            { id: 'ngo' as UserRole, label: '🏠 NGO / Recipient', sub: 'Shelters, Orphanages' },
            { id: 'volunteer' as UserRole, label: '🚴 Volunteer', sub: 'Courier Transport' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setRole(r.id);
                if (r.id === 'ngo') setOrgType('NGO / Charity');
                else if (r.id === 'donor') setOrgType('Restaurant');
                else setOrgType('Volunteer Group');
              }}
              className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                role === r.id
                  ? 'bg-white text-emerald-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 text-xs font-semibold'
              }`}
            >
              <p className="text-xs">{r.label}</p>
              <p className="text-[10px] text-slate-400 font-normal">{r.sub}</p>
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {role === 'volunteer' ? 'Full Name' : 'Contact Person Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {role !== 'volunteer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization / Establishment Name
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder={role === 'donor' ? 'e.g. Grand Plaza Hotel' : 'e.g. Hope Shelter'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization Type
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  >
                    {role === 'donor' ? (
                      <>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Catering Service">Catering Service</option>
                        <option value="Supermarket">Supermarket</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Individual Donor">Individual Donor</option>
                      </>
                    ) : (
                      <>
                        <option value="NGO / Charity">NGO / Charity</option>
                        <option value="Orphanage">Orphanage</option>
                        <option value="Old Age Home">Old Age Home</option>
                        <option value="Community Kitchen">Community Kitchen</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'donor' ? 'Pickup Address' : role === 'ngo' ? 'Delivery / Shelter Address' : 'Base Operating Location'}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, locality, city"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {role !== 'volunteer' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registration / Tax ID (FSSAI / 12A / 80G / Incorporation)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. FSSAI-12984920 or NGO-REG-2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
            )}

            {/* Food Safety Declaration */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start space-x-3 text-xs text-emerald-950">
              <input
                type="checkbox"
                id="safetyAgreed"
                checked={safetyAgreed}
                onChange={(e) => setSafetyAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-emerald-700 rounded-md focus:ring-emerald-600 border-slate-300 cursor-pointer"
              />
              <label htmlFor="safetyAgreed" className="cursor-pointer leading-relaxed text-[11px]">
                <strong>Food Safety & Dignity Declaration:</strong> I declare that all surplus food donated, requested, or transported will be maintained under hygienic conditions, adhering to temperature controls (hot food &gt;60°C, cold food &lt;4°C), within valid safe-consumption windows.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <UserPlus size={15} />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-emerald-700 font-bold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

