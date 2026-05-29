'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { MotivationalQuote } from '@/components/shared/MotivationalQuote';
import { ClipboardList, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

export default function PatientDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-sans">
          Patient Health Portal
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, <span className="font-semibold text-primary">{session?.user?.name || 'David'}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-2 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Active Appointments</p>
          <p className="text-2xl font-black text-foreground">0 Scheduled</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-2 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Medical Prescriptions</p>
          <p className="text-2xl font-black text-foreground">0 Downloadable</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-2 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <CreditCard className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Invoice Payments</p>
          <p className="text-2xl font-black text-foreground">₹0.0 Paid</p>
        </div>
      </div>

      {/* Motivational Quote banner */}
      <MotivationalQuote role="PATIENT" className="border-primary/10 max-w-3xl" />

      {/* Phase Info Box */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-3xl">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Patient Medical Hub (Upcoming Scopes)
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          In Phase 3, this secure portal will empower your personal skin care management: enabling you to view upcoming appointments, send direct callback consultation requests to reception (remember, online direct bookings are restricted for safety), download digital medical prescriptions, securely upload medical scans/PDFs/skin images, and track your invoice payment history.
        </p>
      </div>
    </div>
  );
}
