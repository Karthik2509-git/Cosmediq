'use client';
import React, { useEffect, useState } from 'react';
import { quotesMap, QuoteRole, Quote } from '@/lib/quotes';
import { Quote as QuoteIcon } from 'lucide-react';

interface MotivationalQuoteProps {
  role?: QuoteRole;
  className?: string;
}

export function MotivationalQuote({ role = 'GENERAL', className = '' }: MotivationalQuoteProps) {
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const list = quotesMap[role] || quotesMap.GENERAL;
    // Pick quote of the day based on current date to keep it consistent and professional (not flickering)
    const day = new Date().getDate();
    const index = day % list.length;
    setActiveQuote(list[index]);
  }, [role]);

  if (!activeQuote) {
    return null;
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm ${className}`}>
      {/* Decorative calm background glow */}
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
      
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
          <QuoteIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-base font-medium leading-relaxed text-foreground/90 font-sans italic">
            "{activeQuote.text}"
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            — {activeQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
