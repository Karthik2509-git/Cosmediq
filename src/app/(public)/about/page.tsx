'use client';
import React from 'react';
import { ShieldCheck, Stethoscope, HeartHandshake, Eye } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      
      {/* Vision Hero Banner */}
      <section className="text-left space-y-4 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">About Cosmediq</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-sans">
          Redefining Clinical Skincare Standards
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Cosmediq was established to bridge the gap between superficial cosmetic beauty spas and cold, clinical hospitals. We offer a premium, warm environment led by precise, evidence-based dermatological science.
        </p>
      </section>

      {/* Philosophy Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Our Core Medical Philosophy</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We believe that skin conditions are not merely localized aesthetic concerns, but complex physiological expressions of systemic health, diet, genetics, and environment. 
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Unlike commercial spas that promote aggressive treatments or "miracle" quick fixes, our team prioritizes structural skin cellular health. Every chemical peel, laser wavelength, or prescription is guided strictly by medical verification and the Hippocratic oath of care.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 space-y-6 relative overflow-hidden shadow-md shadow-primary/5">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
          
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Rigorous Science First</h3>
              <p className="text-xs leading-relaxed text-muted-foreground mt-1">
                We only utilize therapeutic techniques and medications that are approved by international regulatory boards and backed by peer-reviewed clinical research.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Empathy & Respect</h3>
              <p className="text-xs leading-relaxed text-muted-foreground mt-1">
                Clinical dermatology requires deep listening. We spend time understanding your medical history and lifestyle before designing therapeutic programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Vision */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground text-center">Founding Pillars & Intent</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Scientific Integrity",
              desc: "Zero false advertising. We present honest clinical timelines and outcomes for every aesthetic laser and peel cycle.",
              icon: Stethoscope
            },
            {
              title: "Patient Advocacy",
              desc: "Patients are guided to appropriate specialists. We never upsell unnecessary cosmetic laser sessions or clinical injectables.",
              icon: ShieldCheck
            },
            {
              title: "Clean Technology",
              desc: "All clinical devices are calibrated weekly. We employ EHR security standards to guard your health logs and history data.",
              icon: Eye
            }
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 space-y-4 hover:border-primary/20 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground">{item.title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
