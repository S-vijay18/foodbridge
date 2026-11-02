import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface SafetyBannerProps {
  type?: 'info' | 'warning';
  title?: string;
  message?: string;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({
  type = 'info',
  title,
  message,
}) => {
  const isWarning = type === 'warning';

  return (
    <div
      className={`p-4 rounded-xl border flex items-start space-x-3 text-sm ${
        isWarning
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isWarning ? (
          <AlertTriangle className="text-amber-600" size={20} />
        ) : (
          <ShieldCheck className="text-emerald-600" size={20} />
        )}
      </div>
      <div>
        <h4 className="font-semibold mb-0.5">
          {title || (isWarning ? 'Food Safety Priority' : 'FoodBridge Safety & Trust Standard')}
        </h4>
        <p className="text-xs leading-relaxed opacity-90">
          {message ||
            'Every food listing requires adherence to hygienic handling standards, clear allergen disclosure, temperature control (Hot >60°C or Cold <4°C), and non-expired safe consumption deadlines. FoodBridge verifies organizations to ensure dignified, safe nutrition for all.'}
        </p>
      </div>
    </div>
  );
};

