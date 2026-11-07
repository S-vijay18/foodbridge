import React from 'react';
import { HeartHandshake, ShieldCheck, Mail, Phone, MapPin, Heart, Sparkles, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800/80 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Mission (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake size={22} />
              </div>
              <span className="font-display font-black text-2xl tracking-tight text-white">
                Food<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Bridge</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Turning surplus food into someone's hope. Connecting hotels, banquet caterers, restaurants, and supermarkets with verified orphanages, shelters, and communities in need.
            </p>

            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold pt-1">
              <ShieldCheck size={16} />
              <span>FSSAI Compliant • 100% Free Social Impact Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold text-white mb-4 tracking-wide uppercase text-xs text-emerald-400">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('marketplace')} className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>Find Food Marketplace</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('donate')} className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>List Surplus Food</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>Live Courier GPS</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('analytics')} className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>CO₂ & Meal Metrics</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Guidelines & Safety */}
          <div>
            <h4 className="font-display text-sm font-bold text-white mb-4 tracking-wide uppercase text-xs text-emerald-400">
              Hygiene & Rules
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  Food Safety Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  Temperature Protocols
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  Good Samaritan Legal Protection
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('safety')} className="hover:text-emerald-400 transition-colors">
                  NGO Vetting Process
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-display text-sm font-bold text-white mb-4 tracking-wide uppercase text-xs text-emerald-400">
              Leadership & Emergency
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase block">
                  Lead Administrator
                </span>
                <p className="font-bold text-white text-xs">Sivaraj (Admin)</p>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Mail size={13} className="text-emerald-400 shrink-0" />
                  <a href="mailto:sivaraj82006@gmail.com" className="hover:text-emerald-300 transition-colors truncate">
                    sivaraj82006@gmail.com
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Phone size={13} className="text-emerald-400 shrink-0" />
                  <a href="tel:+919976273763" className="hover:text-emerald-300 transition-colors font-bold">
                    +91 99762 73763
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} FoodBridge Platform. All rights reserved. Zero waste • Zero hunger.
          </p>
          <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
            <span>Crafted with</span>
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span>for communities in need</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
