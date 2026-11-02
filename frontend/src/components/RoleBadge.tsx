import React from 'react';
import { UserRole } from '../types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const styles: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
    donor: {
      label: 'Food Donor',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
    },
    ngo: {
      label: 'NGO / Recipient',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    volunteer: {
      label: 'Delivery Volunteer',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    admin: {
      label: 'Administrator',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
  };

  const current = styles[role] || styles.donor;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
      {current.label}
    </span>
  );
};

