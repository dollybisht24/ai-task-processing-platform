import React from 'react';
import { Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const statusConfig = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock,
    animate: false
  },
  running: {
    label: 'Running',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: Loader2,
    animate: true
  },
  success: {
    label: 'Success',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
    animate: false
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: AlertCircle,
    animate: false
  }
};

export const StatusBadge = ({ status = 'pending', size = 'sm' }) => {
  const current = statusConfig[status.toLowerCase()] || statusConfig.pending;
  const Icon = current.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2'
  }[size] || 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      <Icon
        className={`w-3.5 h-3.5 ${current.animate ? 'animate-spin' : ''}`}
      />
      <span>{current.label}</span>
    </span>
  );
};

export default StatusBadge;
