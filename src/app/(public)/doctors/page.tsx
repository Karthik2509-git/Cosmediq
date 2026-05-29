'use client';
import React from 'react';
import { Stethoscope, Award, Calendar, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export default function DoctorsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      
      {/* Title */}
      <section className="text-left space-y-4 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Certified Faculty</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-sans">
          Meet Our Skincare Specialists
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Our clinicians combine high-caliber surgical dermatology training with extensive research in non-invasive skin rejuvenation. Meet the team dedicated to your clinical care.
        </p>
      </section>

      {/* Doctor Extended Showcase */}
      <section className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-lg shadow-primary/5">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Doc Avatar Visual Column */}
          <div className="w-full max-w-sm shrink-0 rounded-2xl border border-border bg-muted p-6 space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10" />
            <div className="aspect-square w-full rounded-xl bg-card relative flex items-center justify-center overflow-hidden border border-border/50">
              <Stethoscope className="h-20 w-20 text-primary/30" />
            </div>
            <div className="relative pt-4 text-left">
              <h3 className="text-xl font-bold text-foreground">Dr. Evelyn Carter</h3>
              <p className="text-sm text-primary font-bold">Chief Clinical Dermatologist</p>
              <p className="text-xs text-muted-foreground mt-1">Registration No: KMC-84920</p>
            </div>
          </div>

          {/* Doc Bio & Merits Column */}
          <div className="flex-1 space-y-6 text-left">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Dr. Evelyn Carter, MD, DNB</h2>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">
                Specialist in Clinical & Cosmetic Dermatology
              </p>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Dr. Evelyn Carter holds a Doctorate in Clinical Dermatology from the National Academy of Medical Sciences. She has spent over 12 years managing chronic inflammatory skin issues, complex acne scars, and conducting advanced laser surgical therapies.
            </p>

            {/* Specialties & Achievements List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3 text-sm">
                <Award className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Post-Graduate MD</h4>
                  <p className="text-xs text-muted-foreground">Board certified clinical dermatology</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Laser Resurfacing Lead</h4>
                  <p className="text-xs text-muted-foreground">12+ years calibrating surgical energy parameters</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Calendar className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Clinic Availability</h4>
                  <p className="text-xs text-muted-foreground">Mon - Sat (By scheduled reception slot request)</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <Heart className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Active Care Principles</h4>
                  <p className="text-xs text-muted-foreground">Committed to ethical, safe, minimal-chemical healing</p>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 border-t border-border flex flex-wrap gap-4 items-center">
              <span className="text-xs text-muted-foreground font-semibold">
                Initial Consult Fee: ₹700.0 (Inclusive of structural skin scan analysis)
              </span>
              <Link
                href="/contact"
                className="ml-auto rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-colors"
              >
                Request Consultation
              </Link>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
