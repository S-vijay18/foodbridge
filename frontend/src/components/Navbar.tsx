import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Menu, X, HeartHandshake, PlusCircle, Search,
  Activity, ShieldCheck, BarChart3, LogOut, User as UserIcon,
  ChevronDown, Sparkles
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout, quickLoginAsRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'marketplace', label: 'Find Food', icon: <Search size={15} /> },
    { id: 'donate', label: 'Donate Food', icon: <PlusCircle size={15} /> },
    { id: 'tracking', label: 'Live Tracking', icon: <Activity size={15} /> },
    { id: 'analytics', label: 'Impact Analytics', icon: <BarChart3 size={15} /> },
    { id: 'safety', label: 'Food Safety', icon: <ShieldCheck size={15} /> },
  ];

  const getDashboardId = (role?: UserRole) => {
    switch (role) {
      case 'donor':
        return 'donor_dashboard';
      case 'ngo':
        return 'ngo_dashboard';
      case 'volunteer':
        return 'volunteer_dashboard';
      case 'admin':
        return 'admin_dashboard';
      default:
        return 'marketplace';
    }
  };

  const handleRoleSwitch = async (role: UserRole) => {
    setDemoMenuOpen(false);
    await quickLoginAsRole(role);
    onNavigate(getDashboardId(role));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Demo Banner for Rapid Evaluation */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] py-1 px-4 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center space-x-2">
          <Sparkles size={13} className="text-amber-300" />
          <span>Quick Evaluation Switcher:</span>
          <div className="hidden sm:flex items-center space-x-1.5 ml-2">
            {(['donor', 'ngo', 'volunteer', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-semibold transition-colors ${
                  user?.role === r
                    ? 'bg-amber-400 text-emerald-950 shadow-xs'
                    : 'bg-emerald-800 hover:bg-emerald-700 text-white'
                }`}
              >
                {r === 'ngo' ? 'NGO' : r}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[11px] text-emerald-300 hidden md:block">
          FoodBridge: Smart Surplus Food Rescue Platform
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <HeartHandshake size={22} className="text-emerald-100" />
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-emerald-900 flex items-center leading-none">
                FOOD<span className="text-emerald-600">BRIDGE</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
                Share Hope • Reduce Waste
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === link.id
                    ? 'bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-50'
                }`}
              >
                {link.icon && <span>{link.icon}</span>}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <NotificationDropdown />

                <button
                  onClick={() => onNavigate(getDashboardId(user.role))}
                  className={`hidden sm:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    currentTab.includes('dashboard')
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-800'
                  }`}
                >
                  <Activity size={14} />
                  <span>My Dashboard</span>
                </button>

                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {user.profile?.organization_name || user.full_name}
                    </span>
                    <span className="scale-90 origin-right">
                      <RoleBadge role={user.role} size="sm" />
                    </span>
                  </div>

                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors"
                >
                  Join FoodBridge
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-emerald-800 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                currentTab === link.id
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
          {user && (
            <button
              onClick={() => {
                onNavigate(getDashboardId(user.role));
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-emerald-700 text-white"
            >
              <Activity size={16} />
              <span>Go to {user.role.toUpperCase()} Dashboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};

