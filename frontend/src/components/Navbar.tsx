import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Menu, X, HeartHandshake, PlusCircle, Search,
  Activity, ShieldCheck, BarChart3, LogOut,
  Sparkles, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout, quickLoginAsRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'marketplace', label: 'Find Food', icon: <Search size={14} /> },
    { id: 'donate', label: 'Donate Food', icon: <PlusCircle size={14} /> },
    { id: 'tracking', label: 'Live Tracking', icon: <Activity size={14} /> },
    { id: 'analytics', label: 'Impact', icon: <BarChart3 size={14} /> },
    { id: 'safety', label: 'Safety Guidelines', icon: <ShieldCheck size={14} /> },
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
    await quickLoginAsRole(role);
    onNavigate(getDashboardId(role));
  };

  return (
    <header className="sticky top-0 z-50 transition-all duration-200">
      {/* Top Demo Banner for Rapid Evaluation */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-emerald-100 text-xs py-1.5 px-4 sm:px-8 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-x-auto py-0.5 no-scrollbar">
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-amber-300 shrink-0">
              <Sparkles size={13} className="text-amber-400 animate-pulse" />
              <span>1-Click Switch Persona:</span>
            </span>
            <div className="flex items-center space-x-1.5">
              {(['donor', 'ngo', 'volunteer', 'admin'] as UserRole[]).map((r) => {
                const isActive = user?.role === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`px-2.5 py-0.5 rounded-full capitalize text-[11px] font-bold transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/20 ring-1 ring-white/40'
                        : 'bg-emerald-800/50 hover:bg-emerald-700/70 text-emerald-200 hover:text-white border border-emerald-700/30'
                    }`}
                  >
                    {r === 'ngo' ? 'NGO / Shelter' : r}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="text-[11px] text-emerald-300/80 hidden lg:flex items-center space-x-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Food Rescue Network Active</span>
          </div>
        </div>
      </div>

      {/* Main Glass Navbar */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Brand Logo */}
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25 group-hover:scale-105 group-hover:shadow-emerald-600/40 transition-all duration-300">
                  <HeartHandshake size={24} className="group-hover:rotate-[-6deg] transition-transform duration-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl tracking-tight text-slate-900 flex items-center leading-none">
                  Food<span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Bridge</span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">
                  Surplus Food Rescue
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/60">
              {navLinks.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-emerald-800 shadow-sm border border-slate-200/50 scale-[1.02]'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-white/60'
                    }`}
                  >
                    {link.icon && <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>{link.icon}</span>}
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center space-x-2.5">
              {/* Donate Food Quick Action Button */}
              <button
                onClick={() => onNavigate('donate')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
              >
                <PlusCircle size={15} />
                <span>Donate Food</span>
              </button>

              {user ? (
                <>
                  <NotificationDropdown />

                  <button
                    onClick={() => onNavigate(getDashboardId(user.role))}
                    className={`hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
                      currentTab.includes('dashboard')
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-800'
                    }`}
                  >
                    <Activity size={14} className="text-emerald-500" />
                    <span>Dashboard</span>
                    <ArrowUpRight size={13} className="opacity-60" />
                  </button>

                  {/* User Profile Chip */}
                  <div className="flex items-center space-x-2 pl-2 border-l border-slate-200/80">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div className="hidden xl:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[120px]">
                        {user.profile?.organization_name || user.full_name}
                      </span>
                      <RoleBadge role={user.role} size="sm" />
                    </div>

                    <button
                      onClick={logout}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Logout"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onNavigate('login')}
                    className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/60 rounded-xl transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onNavigate('register')}
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs hover:shadow-md transition-all"
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-emerald-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <button
              onClick={() => {
                onNavigate('donate');
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <PlusCircle size={15} />
              <span>Donate Food</span>
            </button>
            <button
              onClick={() => {
                onNavigate('marketplace');
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5"
            >
              <Search size={15} />
              <span>Find Food</span>
            </button>
          </div>

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                currentTab === link.id
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                {link.icon}
                <span>{link.label}</span>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ))}

          {user && (
            <button
              onClick={() => {
                onNavigate(getDashboardId(user.role));
                setMobileMenuOpen(false);
              }}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold bg-slate-900 text-white shadow-sm"
            >
              <Activity size={16} className="text-emerald-400" />
              <span>Go to {user.role.toUpperCase()} Dashboard</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
