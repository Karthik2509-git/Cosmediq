'use client';
import React from 'react';
import { Quote, Sparkles, Stethoscope, Star } from 'lucide-react';

const patientStories = [
  {
    name: 'Sophia R.',
    location: 'Bengaluru',
    program: 'Clinical Acne Therapy',
    duration: '3 Months Program',
    detail: 'Dr. Evelyn Carter designed a detailed, step-by-step clinical acne management protocol for me. She was incredibly thorough, explaining the physiological reason behind every topical prescription and chemical peel. In three months, my severe comedones cleared up completely, leaving my skin smooth and strong.',
    icon: Stethoscope
  },
  {
    name: 'Marcus T.',
    location: 'HSR Layout, Bengaluru',
    program: 'Aesthetic Laser Resurfacing',
    duration: '4 Sessions Cycle',
    detail: 'I completed four laser sessions for persistent rolling acne scars. Dr. Evelyn calibrated the wavelengths carefully to suit my skin. I experienced minimal recovery downtime and today the scar depth is reduced by over 80%. Sarah at the front desk managed my appointments flawlessly.',
    icon: Sparkles
  },
  {
    name: 'Dr. Anita K.',
    location: 'Electronic City, Bengaluru',
    program: 'Eczema & Barrier Management',
    duration: '6 Weeks Treatment',
    detail: 'As a fellow healthcare professional, I appreciate the evidence-based rigor at Cosmediq. Dr. Carter did not suggest aggressive aesthetic packages. She analyzed my dietary triggers, skin barrier indicators, and prescribed precise barrier repair lipids. Highly professional medical care.',
    icon: Stethoscope
  }
];

export default function TestimonialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      
      {/* Title */}
      <section className="text-left space-y-4 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Patient Journeys</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-sans">
          Real Healing Success Stories
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Read transparent, verified reviews from individuals who have undergone acne therapy, laser resurfacing, and skin barrier diagnostics at Cosmediq.
        </p>
      </section>

      {/* Review Stories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {patientStories.map((story, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between space-y-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-primary/5 blur-2xl" />
            
            <div className="space-y-4">
              {/* Clinical Verification Badge */}
              <div className="flex justify-between items-center">
                <span className="bg-primary/5 text-primary text-xs font-bold px-2.5 py-1 rounded-md border border-primary/20 flex items-center gap-1.5">
                  <story.icon className="h-3.5 w-3.5" />
                  {story.program}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{story.duration}</span>
              </div>

              {/* Review Ratings stars */}
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <p className="text-sm leading-relaxed text-foreground/80 italic font-sans">
                "{story.detail}"
              </p>
            </div>

            {/* Author */}
            <div className="border-t border-border/50 pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">{story.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{story.location}</p>
              </div>
              <Quote className="h-6 w-6 text-primary/10 shrink-0" />
            </div>

          </div>
        ))}
      </section>

    </div>
  );
}
