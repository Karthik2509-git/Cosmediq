'use client';
import React from 'react';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: "Why can't I directly book a confirmed appointment online?",
    a: "To protect patients and maintain clinical rigor, we require receptionist triaging before confirming any appointment. This allows our clinical coordinator to ensure you are scheduled with the correct specialist (e.g., laser surgery versus clinical acne diagnostics), saving time and preventing clinic booking errors."
  },
  {
    q: "What does the initial consultation fee cover?",
    a: "Our standard ₹700 consultation fee covers a complete clinical diagnosis by Dr. Evelyn Carter, a structural digital skin analysis using multi-spectral scan technology, and a customized medical treatment cycle sheet detailing topicals and lifestyle changes."
  },
  {
    q: "Is there any recovery downtime associated with aesthetic lasers?",
    a: "Downtime depends on the specific laser therapy calibrated for your skin. Gentle toning lasers have zero downtime, while deeper fractional scar treatments may cause mild redness for 24-48 hours. Dr. Evelyn explains all safety guidelines and recovery instructions prior to beginning your first session."
  },
  {
    q: "What is your clinic cancellation or rescheduling policy?",
    a: "Because we allocate dedicated time for detailed clinical consults, we request a minimum of 24 hours notice for cancellations or rescheduling. Staff can easily help you move your appointment via a phone call or by logging into the patient portal."
  },
  {
    q: "Are the clinical procedures and laser parameters safe for all skin types?",
    a: "Yes. All our clinical tools and laser settings are calibrated specifically for global skin profiles, including Indian Fitzpatrick skin types. We perform small therapeutic spot tests prior to full laser treatment cycles to verify physiological compatibility and maximize patient safety."
  }
];

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 space-y-12 text-left">
      
      {/* Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Patient Assistance</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-sans">
          Frequently Answered Queries
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Explore answers to standard questions regarding clinical skincare diagnostics, appointment request operations, and safety standards at Cosmediq.
        </p>
      </div>

      {/* Accordions */}
      <section className="space-y-4 pt-4">
        {faqs.map((faq, idx) => (
          <details key={idx} className="group rounded-xl border border-border bg-card p-5 transition-colors duration-200 open:border-primary/20 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between font-bold text-foreground focus:outline-none">
              <span className="text-sm sm:text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5 shrink-0 text-primary" />
                {faq.q}
              </span>
              <span className="ml-1.5 shrink-0 transition-transform duration-200 group-open:-rotate-180 text-muted-foreground">
                ▼
              </span>
            </summary>
            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground pl-7">
              {faq.a}
            </p>
          </details>
        ))}
      </section>

    </div>
  );
}
