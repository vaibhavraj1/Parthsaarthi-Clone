import React from 'react';
import { ReleaseStatus } from '@/models/types';
import { getStatusDisplay } from '@/lib/release-utils';

interface StatusBadgeProps {
  status: ReleaseStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const info = getStatusDisplay(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm tracking-wide ${info.badgeClass} ${sizeClasses} ${className}`}
    >
      <span className={`rounded-full ${info.dotClass} ${dotSize} ${status === 'open' ? 'animate-pulse' : ''}`} />
      <span>{info.label}</span>
    </span>
  );
};
