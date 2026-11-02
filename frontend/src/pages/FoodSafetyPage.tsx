import React, { useState } from 'react';
import {
  ShieldCheck, AlertTriangle, Thermometer, Clock, CheckCircle2,
  FileText, Send, HeartHandshake, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { SafetyBanner } from '../components/SafetyBanner';

export const FoodSafetyPage: React.FC = () => {
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitComplaint({
        subject: complaintSubject,
        description: complaintDesc,
      });
      setSubmittedMsg('Your report has been submitted directly to the safety oversight team. We investigate all claims within 4 hours.');
      setComplaintSubject('');
      setComplaintDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div>
        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">
          Trust, Hygiene & Legal Protections
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Food Safety Standards & Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Preserving nutrition, dignifying recipients, and maintaining zero health risks across every rescued meal.
        </p>
      </div>

      <SafetyBanner
        type="info"
        title="FoodBridge Safety Assurance"
        message="FoodBridge enforces temperature controls, sealed packaging, allergen disclosures, and time limits to safeguard public health. Donors and NGOs participate under standard Good Samaritan food donation legal exemptions."
      />

      {/* Grid of Core Safety Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Thermometer size={24} />
          </div>
          <h3 className="font-bold text-base text-slate-900">The Temperature Danger Zone</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pathogenic bacteria grow fastest between <strong>4°C (40°F) and 60°C (140°F)</strong>.
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span><strong>Hot Foods:</strong> Kept at &gt;60°C throughout pickup.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
              <span><strong>Chilled Foods:</strong> Maintained at &lt;4°C continuously.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <h3 className="font-bold text-base text-slate-900">The Strict 2-Hour Window</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Cooked surplus meals must be refrigerated, frozen, or dispatched to shelters within <strong>2 hours of preparation</strong>.
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>Immediate volunteer dispatch upon request approval.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span>Listings automatically expire if not claimed in time.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-bold text-base text-slate-900">Hygiene & Allergen Transparency</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Donors must clearly declare all allergens (wheat, gluten, nuts, dairy, seafood, soy, eggs) and package in food-grade materials.
          </p>
          <ul className="text-xs text-slate-600 space-y-2 pt-2 border-t border-slate-100">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span>Untouched kitchen surplus only.</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
              <span>No partially consumed table leftovers.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Eligible vs Ineligible Food Matrix */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-6">
        <h3 className="font-extrabold text-base text-slate-900">
          Surplus Food Eligibility Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
            <h4 className="font-bold text-emerald-950 text-sm flex items-center space-x-2">
              <CheckCircle2 size={18} className="text-emerald-700" />
              <span>Accepted for Donation</span>
            </h4>
            <ul className="text-xs text-emerald-900 space-y-2">
              <li>• Unserved hot banquet trays, rice, gravies, and curries</li>
              <li>• Unsold packaged bakery breads, pastries, and croissants</li>
              <li>• Fresh, unblemished raw whole fruits and vegetables</li>
              <li>• Pasteurized dairy and yogurt within valid expiration dates</li>
              <li>• Sealed canned goods and unopened raw dry grains / pulses</li>
            </ul>
          </div>

          <div className="p-5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
            <h4 className="font-bold text-rose-950 text-sm flex items-center space-x-2">
              <AlertTriangle size={18} className="text-rose-700" />
              <span>Strictly Prohibited</span>
            </h4>
            <ul className="text-xs text-rose-900 space-y-2">
              <li>• Food returned from dining tables or half-eaten plates</li>
              <li>• Perishable cooked foods left at room temp for &gt;2 hours</li>
              <li>• Raw oysters, uninspected seafood, or unpasteurized dairy</li>
              <li>• Swollen, rusted, or leaking canned goods</li>
              <li>• Items with signs of mold, sour odor, or discoloration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal & Good Samaritan Protection */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
          <FileText size={18} />
          <span>Legal Protections (Good Samaritan Act)</span>
        </div>
        <h3 className="text-lg font-bold">Donor Immunity from Civil Liability</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Under national and state Good Samaritan food donation acts, bona fide donors, restaurants, and non-profit distribution organizations are legally protected from civil and criminal liability when donating surplus food in good faith, provided that the donor has not engaged in gross negligence or intentional misconduct.
        </p>
      </div>

      {/* Report a Safety Issue / Complaint Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs space-y-5">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">
            Report a Food Safety or Trust Concern
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            If you received food that violated temperature guidelines or hygiene standards, submit a direct report below.
          </p>
        </div>

        {submittedMsg ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center space-x-2">
            <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
            <span>{submittedMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleComplaintSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                placeholder="e.g. Temperature issue on delivery #12 or missing allergen label"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Details & Observations</label>
              <textarea
                required
                rows={3}
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                placeholder="Describe what occurred, time of arrival, food condition..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Send size={14} />
              <span>{isSubmitting ? 'Logging Concern...' : 'Submit Safety Report'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

