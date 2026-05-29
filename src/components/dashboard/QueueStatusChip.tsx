import React from 'react';
import { QueueStatus } from '@prisma/client';
import { Clock, Stethoscope, CheckCircle2 } from 'lucide-react';

interface QueueStatusChipProps {
  status: QueueStatus;
  className?: string;
}

export function QueueStatusChip({ status, className = '' }: QueueStatusChipProps) {
  const configs = {
    WAITING: {
      bg: 'bg-amber-500/5 dark:bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20 dark:border-amber-500/30',
      label: 'Waiting in Queue',
      icon: Clock,
    },
    CONSULTING: {
      bg: 'bg-primary/5 dark:bg-primary/10',
      text: 'text-primary dark:text-primary',
      border: 'border-primary/20 dark:border-primary/30',
      label: 'In Consultation',
      icon: Stethoscope,
    },
    DONE: {
      bg: 'bg-emerald-500/5 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20 dark:border-emerald-500/30',
      label: 'Finished Visit',
      icon: CheckCircle2,
    },
  };

  const config = configs[status] || configs.WAITING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </span>
  );
}
