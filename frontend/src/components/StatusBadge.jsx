import React from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Pending',
    dotBg: 'bg-amber-400',
    container: 'bg-amber-50/80 text-amber-800 border-amber-200/80',
    icon: Clock,
    animate: false
  },
  running: {
    label: 'Running',
    dotBg: 'bg-blue-500 animate-ping',
    container: 'bg-blue-50/90 text-blue-800 border-blue-200/80',
    icon: Loader2,
    animate: true
  },
  success: {
    label: 'Success',
    dotBg: 'bg-emerald-500',
    container: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80',
    icon: CheckCircle2,
    animate: false
  },
  failed: {
    label: 'Failed',
    dotBg: 'bg-rose-500',
    container: 'bg-rose-50/80 text-rose-800 border-rose-200/80',
    icon: AlertCircle,
    animate: false
  }
};

export const StatusBadge = ({ status = 'pending', size = 'sm', showDot = true }) => {
  const current = statusConfig[status.toLowerCase()] || statusConfig.pending;
  const Icon = current.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2'
  }[size] || 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs backdrop-blur-xs transition-all ${current.container} ${sizeClasses}`}
    >
      {showDot ? (
        <span className="relative flex h-2 w-2">
          {current.animate && (
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dotBg}`} />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${current.animate ? 'bg-blue-600' : current.dotBg}`} />
        </span>
      ) : (
        <Icon className={`w-3.5 h-3.5 ${current.animate ? 'animate-spin' : ''}`} />
      )}
      <span className="font-semibold tracking-wide">{current.label}</span>
    </span>
  );
};

export default StatusBadge;
