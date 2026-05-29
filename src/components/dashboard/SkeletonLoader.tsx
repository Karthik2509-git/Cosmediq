'use client';
import React from 'react';

interface SkeletonProps {
  variant?: 'card' | 'list' | 'chart' | 'header' | 'invoices' | 'notifications';
  className?: string;
}

export function SkeletonLoader({ variant = 'card', className = '' }: SkeletonProps) {
  const baseClass = "animate-pulse bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 bg-[length:200%_100%] transition-all duration-1000";

  switch (variant) {
    case 'header':
      return (
        <div className={`space-y-3 ${className}`}>
          <div className={`h-8 w-1/3 rounded-xl ${baseClass}`} />
          <div className={`h-4 w-1/2 rounded-lg ${baseClass}`} />
        </div>
      );

    case 'chart':
      return (
        <div className={`rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm ${className}`}>
          <div className="space-y-2">
            <div className={`h-5 w-1/4 rounded-lg ${baseClass}`} />
            <div className={`h-3.5 w-1/3 rounded-md ${baseClass}`} />
          </div>
          <div className="h-64 flex items-end gap-3 pt-6">
            <div className={`h-1/3 flex-1 rounded-t-lg ${baseClass}`} />
            <div className={`h-2/3 flex-1 rounded-t-lg ${baseClass}`} />
            <div className={`h-1/2 flex-1 rounded-t-lg ${baseClass}`} />
            <div className={`h-5/6 flex-1 rounded-t-lg ${baseClass}`} />
            <div className={`h-3/4 flex-1 rounded-t-lg ${baseClass}`} />
            <div className={`h-2/5 flex-1 rounded-t-lg ${baseClass}`} />
          </div>
        </div>
      );

    case 'list':
      return (
        <div className={`space-y-4 ${className}`}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 flex justify-between items-center gap-4">
              <div className="space-y-2 flex-1">
                <div className={`h-4 w-1/4 rounded-md ${baseClass}`} />
                <div className={`h-3.5 w-1/2 rounded-md ${baseClass}`} />
              </div>
              <div className={`h-8 w-20 rounded-xl ${baseClass}`} />
            </div>
          ))}
        </div>
      );

    case 'invoices':
      return (
        <div className={`space-y-3 ${className}`}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 flex justify-between items-center text-xs">
              <div className="space-y-2 flex-1">
                <div className={`h-4 w-28 rounded-md ${baseClass}`} />
                <div className={`h-3 w-40 rounded-md ${baseClass}`} />
                <div className={`h-4.5 w-12 rounded-md ${baseClass}`} />
              </div>
              <div className="flex items-center gap-3">
                <div className="space-y-2 text-right">
                  <div className={`h-4 w-14 rounded-md ml-auto ${baseClass}`} />
                  <div className={`h-3.5 w-16 rounded-md ml-auto ${baseClass}`} />
                </div>
                <div className={`h-8 w-8 rounded-lg ${baseClass}`} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'notifications':
      return (
        <div className={`space-y-3 ${className}`}>
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-3.5 flex gap-3">
              <div className={`h-8 w-8 rounded-full ${baseClass} shrink-0`} />
              <div className="space-y-2 flex-1">
                <div className={`h-4 w-1/3 rounded-md ${baseClass}`} />
                <div className={`h-3.5 w-2/3 rounded-md ${baseClass}`} />
                <div className={`h-3 w-16 rounded-md ${baseClass}`} />
              </div>
            </div>
          ))}
        </div>
      );

    default: // card
      return (
        <div className={`rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm ${className}`}>
          <div className="flex justify-between items-center">
            <div className={`h-4 w-24 rounded-md ${baseClass}`} />
            <div className={`h-5 w-5 rounded-full ${baseClass}`} />
          </div>
          <div className={`h-7 w-16 rounded-lg ${baseClass}`} />
        </div>
      );
  }
}
