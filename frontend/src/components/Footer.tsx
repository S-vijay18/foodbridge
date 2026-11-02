import React from 'react';
import { HeartHandshake, ShieldCheck, Mail, Phone, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2.5 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <HeartHandshake size={20} />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                FOOD<span className="text-emerald-400">BRIDGE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Turning surplus food into someone's hope. Connecting hotels, restaurants, supermarkets, and catering services with verified orphanages, shelters, and communities in need.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck size={16} />
              <span>Safe & Verified Food Rescue</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Find Food Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('donate')} className="hover:text-emerald-400 transition-colors">
                  Donate Surplus Food
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-emerald-400 transition-colors">
                  Live Dispatch Tracking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-emerald-400 transition-colors">
                  Carbon & Meal Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Guidelines & Safety */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Trust & Safety</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  Food Safety Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  Temperature Danger Zones
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  Good Samaritan Act & Legal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  NGO Verification Process
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Emergency Dispatch</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center space-x-2.5">
                <Mail size={15} className="text-emerald-400" />
                <a href="mailto:sivaraj82006@gmail.com" className="hover:text-emerald-300 transition-colors">
                  sivaraj82006@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone size={15} className="text-emerald-400" />
                <a href="tel:+919976273763" className="hover:text-emerald-300 transition-colors">
                  +91 99762 73763
                </a>
              </div>
              <div className="flex items-center space-x-2.5">
                <MapPin size={15} className="text-emerald-400" />
                <span>FoodBridge Headquarters, Bangalore, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} FoodBridge Foundation. All rights reserved. Built with pride for zero hunger & sustainable cities.
          </p>
          <div className="flex items-center space-x-1 text-slate-400">
            <span>Powered by</span>
            <span className="text-emerald-400 font-semibold">FastAPI + React + AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

