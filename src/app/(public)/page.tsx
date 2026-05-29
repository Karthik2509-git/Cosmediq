'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Stethoscope, 
  Clock, 
  ChevronRight, 
  HelpCircle, 
  Phone,
  MessageSquare,
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { MotivationalQuote } from '@/components/shared/MotivationalQuote';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden">
        {/* Soft therapeutic medical backdrop radial glows */}
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-secondary/5 blur-3xl -z-10" />

        <div className="flex-1 space-y-6 text-left max-w-2xl">
          {/* Subtle Trust badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            ISO 9001:2015 Certified Clinical Scopes
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground font-sans">
            Science-Led Dermatology. <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Care Rooted in Empathy.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Welcome to Cosmediq. We combine certified medical expertise, therapeutic laser technologies, and gentle healing protocols to restore your skin health with clean clinical precision.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-primary-foreground shadow-md shadow-primary/15 transition-all duration-300 hover:bg-primary/95"
            >
              Consult Reception
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/services"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-bold text-foreground transition-all duration-300 hover:bg-muted"
            >
              Explore Treatments
            </Link>
          </div>
        </div>

        {/* Hero Interactive Frame */}
        <div className="flex-1 w-full max-w-md md:max-w-lg">
          <div className="relative rounded-3xl border border-border bg-card p-4 shadow-xl shadow-primary/5">
            <div className="overflow-hidden rounded-2xl bg-muted h-[320px] relative flex flex-col justify-between p-6">
              {/* Abstract medical aesthetic artwork */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-secondary/15 to-transparent" />
              
              <div className="relative flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-primary border border-primary/20 bg-card/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  Clinical Vision
                </span>
                <span className="text-xs font-medium text-muted-foreground bg-card/85 px-2.5 py-1 rounded-lg">
                  Branch Code: HSR-01
                </span>
              </div>

              <div className="relative bg-card/90 backdrop-blur-md p-4 rounded-xl border border-border/50 space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-wide">Daily Care Principle</p>
                <p className="text-sm font-semibold text-foreground">
                  "Healing is not about rushing the skin, but creating the precise physiological conditions for it to restore itself."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC MOTIVATIONAL EXPERIENCE */}
      <section className="w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MotivationalQuote role="GENERAL" className="max-w-3xl mx-auto border-primary/10" />
      </section>

      {/* 3. WHY CHOOSE CLINIC */}
      <section className="w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A Higher Standard of Medical Care
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Cosmediq is founded on principles of integrity, transparency, and scientific verification. We do not support aggressive marketing hype—only tested, evidence-based dermatological practices.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-8 text-left space-y-3 transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Certified Medical Expertise</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All therapeutic protocols are supervised by board-certified clinical dermatologists with extensive hospital experience.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 text-left space-y-3 transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Therapeutic Lasers</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our clinic utilizes gold-standard medical grade lasers approved for dermatological safety and highly controlled therapies.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 text-left space-y-3 transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Personalized Protocols</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every skin cycle is unique. We customize each therapy cycle based on detailed physiological and dietary analysis.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SERVICES HIGHLIGHT */}
      <section className="w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Specialized Domains</span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Advanced Clinical Skin Programs
            </h2>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline self-start md:self-end"
          >
            View all services
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Clinical Acne Therapy",
              desc: "Medical grade comedone extractions, chemical peels, and prescription management for structural acne control.",
              icon: Stethoscope
            },
            {
              title: "Aesthetic Skin lasers",
              desc: "Controlled skin resurfacing, pigment adjustments, and vascular treatments driven by safe laser parameters.",
              icon: Sparkles
            },
            {
              title: "Anti-Aging & Injectables",
              desc: "Rejuvenation therapies designed to promote natural dermal cellular repair and collagen synthesize.",
              icon: ShieldCheck
            },
            {
              title: "Routine Analysis & Peels",
              desc: "Advanced diagnostic skin scanners and customized hydration chemical procedures for daily maintenance.",
              icon: HeartHandshake
            }
          ].map((srv, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/10 transition-colors">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <srv.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{srv.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{srv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CLINICIAN SPOTLIGHT */}
      <section className="w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-muted/30 rounded-3xl border border-border/50">
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto">
          {/* Clinician Card */}
          <div className="flex-1 w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 shadow-lg shadow-primary/5">
            <div className="aspect-square w-full rounded-xl bg-muted relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10" />
              <Stethoscope className="h-16 w-16 text-primary/30" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground">Dr. Evelyn Carter</h4>
              <p className="text-xs text-primary font-bold">Chief Clinical Dermatologist</p>
              <p className="text-xs text-muted-foreground mt-1">Reg: KMC-84920 • 12+ Yrs Experience</p>
            </div>
          </div>

          <div className="flex-1 space-y-6 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Certified Faculty</span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Meet Dr. Evelyn Carter
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              "My practice is driven by the conviction that skin wellness is closely connected to physiological health. We focus on diagnosing underlying systemic contributors rather than masking external symptoms."
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dr. Carter has presented award-winning clinical papers on laser resurfacing variables and holds global board certifications in cosmetic dermatology and non-surgical anti-aging.
            </p>
            <div className="pt-2">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-5 py-3 text-sm font-semibold hover:bg-muted transition-all duration-300"
              >
                Learn More About Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIAL SUMMARY */}
      <section className="w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-12">
        <div className="space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Patient Stories</span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Trusted by Individuals Seeking True Skin Health
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl mx-auto text-left">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm leading-relaxed text-foreground/80 italic">
              "Dr. Evelyn designed a modular acne therapy plan for me over 3 months. She explained the clinical reason behind every single topical and chemical peel she used. Today my skin is entirely clean and healthy."
            </p>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">Sophia R. • Bengaluru</span>
              <span className="text-primary font-semibold">Verified Clinical Patient</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <p className="text-sm leading-relaxed text-foreground/80 italic">
              "Cosmediq is unlike standard aesthetic spas. It feels like a premium medical clinic. The receptionist Sarah organized my schedule perfectly, and the pricing was completely transparent. Outstanding experience."
            </p>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground">Marcus T. • HSR Layout</span>
              <span className="text-primary font-semibold">Verified Laser Patient</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-8 text-left">
        <h2 className="text-2xl font-bold text-foreground text-center">Frequently Answered Queries</h2>
        
        <div className="space-y-4">
          {[
            {
              q: "Can I book a confirmed appointment directly online?",
              a: "To ensure proper medical triaging and prevent calendar scheduling errors, patients cannot directly book confirmed slots. You submit an appointment request, and our clinical coordinator calls you to confirm the exact specialist slot."
            },
            {
              q: "What should I prepare for my first clinical consultation?",
              a: "Please bring a record of all current skincare topicals, active oral prescriptions, and any past clinical allergy records. Arrive 10 minutes early to fill out your medical health history file."
            },
            {
              q: "Are clinical treatment fees transparent?",
              a: "Yes. Every consultation fee, laser setup charge, and chemical peel procedure fee is fully logged and provided prior to starting any clinical session. We do not have any hidden service charges."
            }
          ].map((item, idx) => (
            <details key={idx} className="group rounded-xl border border-border bg-card p-4 transition-colors duration-200 open:border-primary/20">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-foreground focus:outline-none">
                <span className="text-sm sm:text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                  {item.q}
                </span>
                <span className="ml-1.5 shrink-0 transition-transform duration-200 group-open:-rotate-180 text-muted-foreground">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground pl-6">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 8. BEGIN JOURNEY CTA */}
      <section className="w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-tr from-primary to-secondary p-8 sm:p-12 text-primary-foreground max-w-5xl mx-auto shadow-xl shadow-primary/10 relative overflow-hidden">
          {/* Subtle circles */}
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Begin Your Skin Wellness Journey
            </h2>
            <p className="text-base text-primary-foreground/90 leading-relaxed">
              Have clinical skincare questions or wish to request an initial consultation slot with Dr. Evelyn Carter? Contact our reception at HSR Layout directly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-xl bg-background text-foreground px-6 py-3 font-bold shadow-md hover:bg-background/95 transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                Request Callback
              </Link>
              <Link
                href="mailto:care@cosmediq.com"
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold hover:bg-white/15 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Email Reception
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
