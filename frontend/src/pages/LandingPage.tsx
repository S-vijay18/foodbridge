import React, { useState, useEffect } from 'react';
import {
  HeartHandshake, ArrowRight, ShieldCheck, Sparkles,
  Truck, Utensils, Clock, ChevronDown, CheckCircle2,
  TrendingUp, Leaf, Droplets, MapPin, Star, Building2, Flame, Award
} from 'lucide-react';
import { api } from '../services/api';
import { Donation, ImpactMetrics } from '../types';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [impact, setImpact] = useState<ImpactMetrics>({
    meals_provided: 4750,
    food_saved_kg: 1590,
    co2_reduced_kg: 3975,
    active_organizations: 32,
    volunteer_hours_logged: 465,
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Impact Calculator State
  const [calcQuantity, setCalcQuantity] = useState<number>(35);

  useEffect(() => {
    const loadData = async () => {
      try {
        const donations = await api.getDonations();
        setRecentDonations(donations.slice(0, 3));
        const impactData = await api.getImpactMetrics();
        setImpact(impactData);
      } catch (e) {
        console.error('Failed to load landing data', e);
      }
    };
    loadData();
  }, []);

  const calculatedMeals = Math.round(calcQuantity * 3);
  const calculatedCo2 = Math.round(calcQuantity * 2.5);
  const calculatedWater = Math.round(calcQuantity * 680);

  const faqs = [
    {
      q: 'How does FoodBridge guarantee food safety and hygiene?',
      a: 'FoodBridge enforces strict safety protocols: all hot cooked meals must be maintained above 60°C, chilled items below 4°C, and perishable items must be collected within the safe consumption window. Donors sign a digital food hygiene declaration and only verified organizations can receive donations.',
    },
    {
      q: 'Can individual households or only catering businesses donate?',
      a: 'Both! We support high-volume kitchens (hotels, wedding caterers, supermarkets, bakeries, corporate cafeterias) as well as individuals with untouched, sealed, or hygienically packed surplus food.',
    },
    {
      q: 'How do volunteers transport the food safely?',
      a: 'Registered delivery volunteers use thermal insulated carrier bags and sealed food-grade containers. Assignments are dispatched on rapid routes to ensure transit takes under 45 minutes.',
    },
    {
      q: 'Are donations 100% free of charge for NGOs and shelters?',
      a: 'Yes, 100% free forever. FoodBridge is a zero-fee social impact technology bridge. Neither donors nor recipient orphanages and elderly shelters ever pay for food listings or deliveries.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION WITH AURORA GLOW & BENTO PREVIEWS */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-emerald-950 text-white pt-16 sm:pt-24 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-emerald-800/30">
        {/* Glow Blobs & Dot Pattern */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-12 right-10 w-72 h-72 bg-amber-400/10 rounded-full blur-[90px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Dynamic Announcement Pill */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <Sparkles size={13} className="text-amber-400" />
                <span>AI-Powered Surplus Food Rescue Network</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]">
                Don't Waste Food. <br />
                <span className="text-gradient-hero">Share Hope.</span>
              </h1>

              {/* Subheading */}
              <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                Connecting surplus food from hotels, restaurants, and catering services with verified orphanages, shelters, and communities in need. Together, good food never goes to waste.
              </p>

              {/* Dual Action CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('donate')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 rounded-2xl font-bold text-sm shadow-lg shadow-amber-400/20 hover:shadow-xl hover:shadow-amber-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  <Utensils size={17} className="text-slate-900" />
                  <span>Donate Food Now</span>
                </button>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-emerald-800/60 hover:bg-emerald-800/90 text-white rounded-2xl font-bold text-sm border border-emerald-500/30 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                >
                  <span>Browse Available Food</span>
                  <ArrowRight size={17} className="text-emerald-300" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-medium">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>100% Free & Non-Profit</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 size={16} className="text-amber-400" />
                  <span>Verified Recipient NGOs</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Flame size={16} className="text-rose-400" />
                  <span>Strict Food Hygiene Declarations</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Bento Cards */}
            <div className="lg:col-span-5 relative space-y-4">
              {/* Card 1: Active Surplus Food Card */}
              <div className="glass-card bg-white/90 p-5 rounded-3xl text-slate-900 shadow-2xl border border-emerald-500/20 transform hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase">Live Donation Available</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🌱 Pure Veg
                  </span>
                </div>

                <div className="flex items-center space-x-4 mt-3">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80"
                    alt="Paneer Butter Masala"
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Paneer Tikka & Jeera Rice</h4>
                    <p className="text-xs text-slate-500 flex items-center mt-0.5">
                      <Building2 size={12} className="mr-1 text-slate-400" />
                      Grand Regency Banquets (1.8 km away)
                    </p>
                    <div className="flex items-center space-x-3 mt-1.5 text-[11px] font-bold text-emerald-700">
                      <span>45 Portions</span>
                      <span>•</span>
                      <span className="text-amber-700 flex items-center">
                        <Clock size={11} className="mr-1" />
                        Safe for 2 hrs
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('marketplace')}
                  className="w-full mt-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1"
                >
                  <span>Request Food for Shelter</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Card 2: Live Delivery Tracking Micro-Widget */}
              <div className="glass-card bg-slate-900/90 text-white p-4 rounded-3xl shadow-xl border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                    <Truck size={18} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-100">Volunteer Courier In Transit</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>
                    <p className="text-[11px] text-slate-400">Delivering to Grace Orphanage • ETA 11m</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('tracking')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-emerald-300 transition-colors"
                >
                  Track Map
                </button>
              </div>

              {/* Card 3: Environmental Achievement Ribbon */}
              <div className="bg-gradient-to-r from-emerald-900/70 to-teal-900/70 p-3.5 rounded-2xl border border-emerald-600/30 flex items-center justify-between text-xs backdrop-blur-md">
                <div className="flex items-center space-x-2 text-emerald-200">
                  <Leaf size={16} className="text-emerald-400" />
                  <span><strong>3,975 kg CO₂</strong> emissions avoided</span>
                </div>
                <span className="text-amber-300 font-bold text-[11px]">~190 Trees Equivalent</span>
              </div>
            </div>

          </div>

          {/* Quick Stats Bento Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 pt-8 border-t border-emerald-800/40">
            <div className="glass-dark p-5 rounded-3xl text-left hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-emerald-200 font-medium">Total Meals Served</span>
                <Utensils size={16} className="text-amber-400" />
              </div>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-amber-300">
                {impact.meals_provided.toLocaleString()}+
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-1 flex items-center">
                <TrendingUp size={12} className="mr-1 text-emerald-400" />
                Dignified fresh nutrition
              </p>
            </div>

            <div className="glass-dark p-5 rounded-3xl text-left hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-emerald-200 font-medium">Food Rescued</span>
                <HeartHandshake size={16} className="text-emerald-400" />
              </div>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-300">
                {impact.food_saved_kg.toLocaleString()} kg
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-1">
                Zero food to landfills
              </p>
            </div>

            <div className="glass-dark p-5 rounded-3xl text-left hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-emerald-200 font-medium">CO₂ Emissions Averted</span>
                <Leaf size={16} className="text-teal-400" />
              </div>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-amber-300">
                {impact.co2_reduced_kg.toLocaleString()} kg
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-1">
                Net-Zero Waste Impact
              </p>
            </div>

            <div className="glass-dark p-5 rounded-3xl text-left hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-emerald-200 font-medium">Partner Organizations</span>
                <Building2 size={16} className="text-emerald-400" />
              </div>
              <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-300">
                {impact.active_organizations}+
              </p>
              <p className="text-[11px] text-emerald-300/80 mt-1">
                Orphanages & verified NGOs
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE FOOD WASTE & CARBON IMPACT CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl border border-emerald-700/50 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-400/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-amber-300 text-xs font-bold">
                <Sparkles size={13} />
                <span>Interactive Impact Simulator</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white leading-tight">
                Calculate Your Kitchen's Surplus Impact
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
                Whether you run a hotel banquet, wedding hall, or bakery, every kilogram of good surplus food you donate directly nourishes individuals and keeps greenhouse gases out of the atmosphere.
              </p>

              {/* Slider Controls */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                  <span>Surplus Food Quantity</span>
                  <span className="text-xl font-extrabold text-amber-300">{calcQuantity} kg</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  className="w-full h-3 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                
                {/* Preset Chips */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[11px] text-emerald-300">Presets:</span>
                  {[15, 35, 75, 150].map((val) => (
                    <button
                      key={val}
                      onClick={() => setCalcQuantity(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        calcQuantity === val
                          ? 'bg-amber-400 text-emerald-950 font-black'
                          : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-700/50'
                      }`}
                    >
                      {val} kg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Bento Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-950/70 border border-emerald-600/40 p-5 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-4">
                  <Utensils size={20} />
                </div>
                <div>
                  <p className="text-xs text-emerald-300 font-semibold">Meals Provided</p>
                  <p className="text-3xl font-black text-amber-300 mt-1">~{calculatedMeals}</p>
                  <p className="text-[11px] text-emerald-200 mt-2">Feeds hungry families & children</p>
                </div>
              </div>

              <div className="bg-emerald-950/70 border border-emerald-600/40 p-5 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-4">
                  <Leaf size={20} />
                </div>
                <div>
                  <p className="text-xs text-emerald-300 font-semibold">CO₂e Averted</p>
                  <p className="text-3xl font-black text-emerald-300 mt-1">~{calculatedCo2} kg</p>
                  <p className="text-[11px] text-emerald-200 mt-2">Zero landfill methane released</p>
                </div>
              </div>

              <div className="bg-emerald-950/70 border border-emerald-600/40 p-5 rounded-3xl backdrop-blur-md flex flex-col justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-400/20 text-blue-300 flex items-center justify-center mb-4">
                  <Droplets size={20} />
                </div>
                <div>
                  <p className="text-xs text-emerald-300 font-semibold">Water Saved</p>
                  <p className="text-3xl font-black text-blue-300 mt-1">~{(calculatedWater).toLocaleString()} L</p>
                  <p className="text-[11px] text-emerald-200 mt-2">Agricultural virtual water protected</p>
                </div>
              </div>

              {/* Action Button inside calculator */}
              <div className="sm:col-span-3 pt-2">
                <button
                  onClick={() => onNavigate('donate')}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-emerald-950 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Utensils size={15} />
                  <span>Donate {calcQuantity} kg of Surplus Food Now</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS – 4 STEP ECOSYSTEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={12} className="text-emerald-600" />
            <span>Seamless Workflow</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
            How FoodBridge Operates
          </h2>
          <p className="text-slate-600 text-sm mt-3">
            Real-time surplus food matching connecting donors, verified NGOs, and delivery couriers in under 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Donors List Food',
              desc: 'Hotels, caterers, or bakeries post surplus portions with safety guidelines, photos, and expiry countdowns.',
              icon: <Utensils className="text-emerald-600" size={24} />,
              badge: 'Fast 2-Min Listing',
              color: 'from-emerald-500/20 to-teal-500/10'
            },
            {
              step: '02',
              title: 'AI Smart Matching',
              desc: 'Our engine pairs donations with nearby verified orphanages based on travel distance and dietary needs.',
              icon: <Sparkles className="text-amber-500" size={24} />,
              badge: 'Zero Food Waste',
              color: 'from-amber-500/20 to-yellow-500/10'
            },
            {
              step: '03',
              title: 'Volunteer Dispatch',
              desc: 'Courier volunteers accept pickup assignments, carrying thermal containers on optimized quick routes.',
              icon: <Truck className="text-blue-600" size={24} />,
              badge: 'Live GPS Tracking',
              color: 'from-blue-500/20 to-cyan-500/10'
            },
            {
              step: '04',
              title: 'Dignified Nutrition',
              desc: 'NGOs confirm receipt, feed residents wholesome meals, and record verified impact ratings.',
              icon: <HeartHandshake className="text-rose-600" size={24} />,
              badge: 'Audited Transparency',
              color: 'from-rose-500/20 to-orange-500/10'
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-card glass-card-hover p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${item.color} rounded-bl-full pointer-events-none`}></div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shadow-xs">
                    {item.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-200">
                    {item.step}
                  </span>
                </div>

                <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase mb-2">
                  {item.badge}
                </span>

                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
                <span>Learn more</span>
                <ArrowRight size={13} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LIVE SURPLUS FOOD LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
              <span>Live Marketplace</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold text-slate-900">
              Active Surplus Food Available Now
            </h2>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
          >
            <span>Explore All in Marketplace</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentDonations.map((don) => (
            <div
              key={don.id}
              className="glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={don.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                  alt={don.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

                <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 shadow-sm">
                  {don.category}
                </span>
                
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-[11px] font-bold shadow-sm">
                  ~{don.estimated_meals} Meals
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between text-xs">
                  <span className="flex items-center font-medium drop-shadow-sm">
                    <MapPin size={12} className="mr-1 text-emerald-300" />
                    {don.pickup_address.split(',')[0]}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/90 text-slate-950 font-black text-[10px]">
                    {don.diet_type === 'Vegetarian' ? '🌱 Pure Veg' : don.diet_type}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {don.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {don.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Available Quantity</span>
                      <strong className="text-slate-900 font-extrabold text-sm">
                        {don.remaining_quantity} {don.quantity_unit}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Consumption Window</span>
                      <span className="inline-flex items-center text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                        <Clock size={11} className="mr-1" />
                        Until {new Date(don.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => onNavigate('marketplace')}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <span>Request Food for Shelter</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FOOD SAFETY & HYGIENE PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck size={14} />
                <span>Zero Compromise Food Hygiene</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Safety First in Every Delivery
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                FoodBridge maintains rigorous food safety criteria aligned with FSSAI and international hygiene regulations. Every donor digitally declares proper storage, preparation timing, and handling before publishing.
              </p>
              <button
                onClick={() => onNavigate('safety')}
                className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors inline-flex items-center space-x-2"
              >
                <span>Read Full Safety Manual</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Flame className="text-amber-400 mb-2" size={22} />
                <h4 className="font-bold text-sm text-white">Temperature Compliance</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Hot food kept strictly above 60°C; chilled dairy and salad items stored below 4°C.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Clock className="text-emerald-400 mb-2" size={22} />
                <h4 className="font-bold text-sm text-white">2-Hour Rapid Transit</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Couriers are auto-matched nearby so pickup and delivery occur within safe biological windows.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <Award className="text-teal-400 mb-2" size={22} />
                <h4 className="font-bold text-sm text-white">Sealed Food-Grade Containers</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Thermal insulated carrier bags prevent cross-contamination and preserve freshness.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700">
                <CheckCircle2 className="text-blue-400 mb-2" size={22} />
                <h4 className="font-bold text-sm text-white">Verified NGO Vetting</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  100% of shelters and orphanages undergo manual admin document verification before receiving food.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span>Community Stories</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-slate-900">
            Voices of Hope on FoodBridge
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "As an executive banquet chef, seeing fresh buffet trays dumped broke my heart. With FoodBridge, our excess meals are collected in under 45 minutes by trusted volunteers.",
              author: "Chef Marco Rossi",
              role: "Head Chef, Grand Regency Hotel",
              avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80",
              rating: 5,
            },
            {
              quote: "FoodBridge has drastically lowered our monthly food procurement expenses. The food is always well-packaged, hot, and deeply cherished by all 45 children in our care.",
              author: "Sister Mary D'Souza",
              role: "Director, Grace Children Home",
              avatar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=200&q=80",
              rating: 5,
            },
            {
              quote: "Volunteering as a food courier gives my evenings purpose. The live GPS route tracking and quick verification make pickups and drop-offs completely effortless.",
              author: "Alex Rivera",
              role: "Volunteer Courier (Completed 42 Deliveries)",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
              rating: 5,
            },
          ].map((t, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center space-x-1 mb-4 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
                <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{t.author}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Help Center</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 text-sm hover:text-emerald-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === index ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. BOTTOM HIGH-CONVERTING CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] p-10 sm:p-16 text-center text-white overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 border border-emerald-700/50 shadow-2xl">
          <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-500/30 text-amber-300 text-xs font-bold">
              <Sparkles size={14} />
              <span>Join the Zero-Waste Revolution</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight">
              Ready to Turn Surplus Food Into Hope?
            </h2>

            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Whether you have 20 banquet meals, run an orphanage, or have a bike to transport food—you have a vital role on FoodBridge.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <button
                onClick={() => onNavigate('register')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold rounded-2xl text-xs shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Register as Donor or NGO
              </button>
              <button
                onClick={() => onNavigate('marketplace')}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs border border-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Browse Live Food Listings
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
