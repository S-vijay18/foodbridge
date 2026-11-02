import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, LogIn, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickLoginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onNavigate('marketplace');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await quickLoginAsRole(role);
      if (role === 'donor') onNavigate('donor_dashboard');
      else if (role === 'ngo') onNavigate('ngo_dashboard');
      else if (role === 'volunteer') onNavigate('volunteer_dashboard');
      else if (role === 'admin') onNavigate('admin_dashboard');
      else onNavigate('marketplace');
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white shadow-md cursor-pointer"
          >
            <HeartHandshake size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome to FoodBridge
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to manage donations, requests, or volunteer deliveries
          </p>
        </div>

        {/* Demo Fast Login Switcher Card */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
            <Sparkles size={15} className="text-amber-500" />
            <span>Evaluation One-Click Login</span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-snug">
            Click any role below to sign in immediately with preloaded demo data:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('donor')}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-xl text-left transition-colors"
            >
              <p className="text-xs font-bold text-emerald-900">🏨 Donor</p>
              <p className="text-[10px] text-slate-500 truncate">Grand Plaza Hotel</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ngo')}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-xl text-left transition-colors"
            >
              <p className="text-xs font-bold text-emerald-900">🏠 NGO / Shelter</p>
              <p className="text-[10px] text-slate-500 truncate">Hope Haven Home</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('volunteer')}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-xl text-left transition-colors"
            >
              <p className="text-xs font-bold text-emerald-900">🚴 Volunteer</p>
              <p className="text-[10px] text-slate-500 truncate">Alex Rivera (Courier)</p>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-2 bg-white hover:bg-emerald-100/50 border border-emerald-200 rounded-xl text-left transition-colors"
            >
              <p className="text-xs font-bold text-emerald-900">🛡️ Administrator</p>
              <p className="text-[10px] text-slate-500 truncate">Sivaraj (Admin)</p>
            </button>
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hotel@grandplaza.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {showForgot && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <p className="text-slate-600">Enter your email and click send to receive reset instructions:</p>
                <button
                  type="button"
                  onClick={() => setForgotMsg(`Reset link dispatched to ${email || 'your email'}.`)}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold text-xs"
                >
                  Send Reset Link
                </button>
                {forgotMsg && <p className="text-emerald-700 font-semibold text-[11px]">{forgotMsg}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <LogIn size={15} />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-emerald-700 font-bold hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

