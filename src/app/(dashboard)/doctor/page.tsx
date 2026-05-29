'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { MotivationalQuote } from '@/components/shared/MotivationalQuote';
import { ClipboardList, Stethoscope, Clock, ShieldCheck } from 'lucide-react';

export default function DoctorDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-sans">
          Dermatology Clinician Console
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, <span className="font-semibold text-primary">{session?.user?.name || 'Dr. Carter'}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-2 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Stethoscope className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Today's Consultations</p>
          <p className="text-2xl font-black text-foreground">0 Patients</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-2 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Average Consultation Time</p>
          <p className="text-2xl font-black text-foreground">15 Mins</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-2 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Completed Care Cycles</p>
          <p className="text-2xl font-black text-foreground">0 Completed</p>
        </div>
      </div>

      {/* Motivational Quote banner */}
      <MotivationalQuote role="DOCTOR" className="border-primary/10 max-w-3xl" />

      {/* Phase Info Box */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 max-w-3xl">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Clinical Consultation Panel (Upcoming Scopes)
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          In Phase 2, this console will provide complete medical management interfaces: allowing you to view the queue of waiting patients, read comprehensive historical timelines, log clinical consultation notes, generate structured digital drug prescriptions, update healing treatment statuses, and manage your daily availability schedule.
        </p>
      </div>
    </div>
  );
}
