'use client';
import React from 'react';
import { ShieldCheck, Calendar, FileText, Bell, ClipboardList } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'appointments' | 'reports' | 'notifications' | 'followups' | 'general';
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

export function PremiumEmptyState({ 
  variant = 'general', 
  title, 
  description, 
  actionButton,
  className = '' 
}: EmptyStateProps) {
  
  const getIcon = () => {
    switch (variant) {
      case 'appointments':
        return <Calendar className="h-6 w-6 text-primary" />;
      case 'reports':
        return <FileText className="h-6 w-6 text-teal-500" />;
      case 'notifications':
        return <Bell className="h-6 w-6 text-secondary" />;
      case 'followups':
        return <ClipboardList className="h-6 w-6 text-amber-500" />;
      default:
        return <ShieldCheck className="h-6 w-6 text-primary" />;
    }
  };

  const getDefaults = () => {
    switch (variant) {
      case 'appointments':
        return {
          t: "Your schedule is clear for now",
          d: "No clinical checkups or skincare slots scheduled. Register walk-ins to start the queue."
        };
      case 'reports':
        return {
          t: "Medical reports will appear here once uploaded",
          d: "All indexed skin scans, lab diagnostics, and dermatologist sheets are compiled here."
        };
      case 'notifications':
        return {
          t: "You're all caught up",
          d: "Dermal compliance checks show zero unread clinical advisories or leave alerts today."
        };
      case 'followups':
        return {
          t: "No follow-ups pending today",
          d: "All follow-up skincare reminders for existing patients have been completed or rescheduled."
        };
      default:
        return {
          t: "Record collection is quiet",
          d: "Select a patient profile or initiate search queries to display operations data."
        };
    }
  };

  const defaults = getDefaults();
  const displayTitle = title || defaults.t;
  const displayDescription = description || defaults.d;

  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-border bg-muted/10 space-y-4 max-w-lg mx-auto ${className}`}>
      
      {/* Soft rounded icon ring */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border/80 shadow-sm">
        {getIcon()}
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-foreground tracking-tight">{displayTitle}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {displayDescription}
        </p>
      </div>

      {actionButton && (
        <div className="pt-1">
          {actionButton}
        </div>
      )}

    </div>
  );
}
