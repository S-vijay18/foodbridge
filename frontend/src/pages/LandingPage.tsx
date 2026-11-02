import React, { useState, useEffect } from 'react';
import {
  HeartHandshake, ArrowRight, ShieldCheck, Sparkles,
  Truck, Users, Utensils, Award, Clock, ChevronDown, CheckCircle2
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

  const faqs = [
    {
      q: 'How does FoodBridge guarantee food safety?',
      a: 'FoodBridge enforces strict safety protocols: all hot food must be maintained above 60°C, cold food below 4°C, and perishable items must be collected within the safe consumption window. Donors sign a food hygiene declaration and only verified organizations can receive donations.',
    },
    {
      q: 'Can individual households or only businesses donate?',
      a: 'Both! We support restaurants, hotels, bakeries, supermarkets, corporate cafeterias, and wedding caterers, as well as community groups and individuals with unexpired, sealed surplus food.',
    },
    {
      q: 'How do volunteers transport the food safely?',
      a: 'Volunteers utilize thermal insulated carrier bags and sealed food-grade containers. Deliveries are dispatched for immediate transit to eliminate temperature abuse and maintain nutrition.',
    },
    {
      q: 'Are donations free of charge for NGOs?',
      a: 'Yes, 100% free. FoodBridge is a non-profit technology bridge. Neither donors nor recipient NGOs or orphanages ever pay for surplus food listings or deliveries.',
    },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 rounded-b-[3rem] shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles size={14} className="text-amber-400" />
            <span>AI-Driven Food Rescue & Zero Waste Initiative</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Don't Waste Food. <br />
            <span className="text-emerald-300">Share Hope.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-emerald-100 font-normal leading-relaxed">
            Connecting surplus food from restaurants, hotels, and supermarkets with verified orphanages, shelters, and communities in need. Together, we can build a world where good food never goes to waste.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('donate')}
              className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-2xl font-bold text-sm shadow-lg hover:shadow-amber-400/20 transition-all flex items-center justify-center space-x-2"
            >
              <Utensils size={18} />
              <span>Donate Food Now</span>
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm border border-emerald-500/40 backdrop-blur-xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Find Food Marketplace</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-emerald-700/60 text-left">
            <div className="bg-emerald-800/40 border border-emerald-600/30 p-4 rounded-2xl backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {impact.meals_provided.toLocaleString()}+
              </p>
              <p className="text-xs text-emerald-200 mt-1">Meals Delivered</p>
            </div>
            <div className="bg-emerald-800/40 border border-emerald-600/30 p-4 rounded-2xl backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {impact.food_saved_kg.toLocaleString()} kg
              </p>
              <p className="text-xs text-emerald-200 mt-1">Food Rescued</p>
            </div>
            <div className="bg-emerald-800/40 border border-emerald-600/30 p-4 rounded-2xl backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                {impact.co2_reduced_kg.toLocaleString()} kg
              </p>
              <p className="text-xs text-emerald-200 mt-1">CO₂ Emissions Averted</p>
            </div>
            <div className="bg-emerald-800/40 border border-emerald-600/30 p-4 rounded-2xl backdrop-blur-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                {impact.active_organizations}+
              </p>
              <p className="text-xs text-emerald-200 mt-1">Verified Organizations</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
            Simple 4-Step Ecosystem
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How FoodBridge Works</h2>
          <p className="text-slate-500 text-sm mt-3">
            Real-time logistics connecting donors, recipients, and delivery volunteers seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Donors Publish Food',
              desc: 'Hotels, caterers, or bakeries list surplus food with safety guidelines, photos, and expiry deadlines.',
              icon: <Utensils className="text-emerald-600" size={24} />,
            },
            {
              step: '02',
              title: 'AI Smart Match & Alert',
              desc: 'Our engine matches food with nearby verified shelters based on travel distance and dietary needs.',
              icon: <Sparkles className="text-amber-500" size={24} />,
            },
            {
              step: '03',
              title: 'Volunteers Dispatch',
              desc: 'Delivery volunteers claim the pickup assignment and transport food in thermal containers.',
              icon: <Truck className="text-blue-600" size={24} />,
            },
            {
              step: '04',
              title: 'Dignified Nutrition',
              desc: 'NGOs confirm receipt, nourish their residents, and provide verified impact ratings.',
              icon: <HeartHandshake className="text-rose-600" size={24} />,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-4xl font-black text-slate-100 mb-4">{item.step}</div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. RECENT AVAILABLE DONATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
              Live Feed
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Active Surplus Food Listings
            </h2>
          </div>
          <button
            onClick={() => onNavigate('marketplace')}
            className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            <span>View All in Marketplace</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentDonations.map((don) => (
            <div
              key={don.id}
              className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={don.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                  alt={don.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full text-xs font-bold text-emerald-800 shadow-xs">
                  {don.category}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-700 text-white rounded-full text-[11px] font-semibold">
                  ~{don.estimated_meals} Meals
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{don.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{don.description}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium">
                      Available: <strong className="text-slate-900">{don.remaining_quantity} {don.quantity_unit}</strong>
                    </span>
                    <span className="flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                      <Clock size={12} className="mr-1" />
                      Safe until {new Date(don.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={() => onNavigate('marketplace')}
                    className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Request This Donation</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MISSION & TRUST */}
      <section className="bg-emerald-950 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs font-semibold">
              <ShieldCheck size={16} />
              <span>United Nations SDG 2 & 12 Alignment</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              One-Third of Global Food Is Wasted While Millions Go Hungry.
            </h2>
            <p className="text-sm text-emerald-200 leading-relaxed">
              FoodBridge exists to solve this logistical mismatch. By harnessing fast real-time notifications, route tracking, and AI-driven portion matching, surplus food from high-volume catering is routed to verified shelters in under 2 hours.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-800">
                <CheckCircle2 className="text-amber-400 mb-2" size={20} />
                <h4 className="font-bold text-sm">Verified Organizations</h4>
                <p className="text-xs text-emerald-300 mt-1">Every recipient NGO is vetted for safety compliance.</p>
              </div>
              <div className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-800">
                <CheckCircle2 className="text-emerald-400 mb-2" size={20} />
                <h4 className="font-bold text-sm">Zero Food Landfill</h4>
                <p className="text-xs text-emerald-300 mt-1">Prevents methane release from decomposing food.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80"
              alt="Community food distribution"
              className="rounded-3xl shadow-2xl border-4 border-emerald-800/60 object-cover w-full h-[400px]"
            />
            <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-5 rounded-3xl shadow-xl max-w-xs border border-slate-100 hidden sm:block">
              <p className="text-xs font-bold text-emerald-800">Verified Impact</p>
              <p className="text-sm font-extrabold mt-1">"The biryani from Grand Plaza fed all 45 children at our shelter hot and fresh."</p>
              <p className="text-[11px] text-slate-500 mt-2">— Sister Mary, Hope Haven Shelter</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
            Voices of FoodBridge
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Partner Testimonials</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "As an executive chef, seeing banquet buffet trays go to trash broke my heart. With FoodBridge, our excess meals are collected in under 45 minutes.",
              author: "Chef Marco Rossi",
              role: "Head Chef, Grand Plaza Hotel",
              avatar: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80",
            },
            {
              quote: "FoodBridge has drastically lowered our monthly food procurement budget. The food is always well-packaged, fresh, and deeply appreciated by the children.",
              author: "Sister Mary D'Souza",
              role: "Director, Hope Haven Children Home",
              avatar: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=200&q=80",
            },
            {
              quote: "Volunteering as a food courier gives my evenings purpose. The live tracking and automated pickup routes make deliveries completely smooth.",
              author: "Alex Rivera",
              role: "Volunteer Courier (Completed 42 Drops)",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            },
          ].map((t, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed italic">"{t.quote}"</p>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-slate-100">
                <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{t.author}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
            Clear Answers
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-800 text-sm hover:text-emerald-700 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-3xl p-10 sm:p-16 text-center text-white space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Ready to Rescue Surplus Food?</h2>
          <p className="max-w-xl mx-auto text-emerald-100 text-sm">
            Whether you have surplus banquet trays, run an orphanage feeding children, or have a bike to transport meals—you have a place on FoodBridge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('register')}
              className="px-8 py-3.5 bg-white text-emerald-900 font-bold rounded-2xl text-xs hover:bg-emerald-50 shadow-md transition-colors"
            >
              Register Organization or Volunteer
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-8 py-3.5 bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold rounded-2xl text-xs border border-emerald-500/40 transition-colors"
            >
              Explore Live Marketplace
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

