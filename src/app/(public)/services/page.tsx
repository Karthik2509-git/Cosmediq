'use client';
import React, { useState } from 'react';
import { Stethoscope, Sparkles, ShieldAlert, HeartHandshake, HelpCircle } from 'lucide-react';

const treatmentCategories = [
  {
    id: 'clinical',
    name: 'Clinical Dermatology',
    icon: Stethoscope,
    desc: 'Medical-grade diagnostics and prescription plans focused on chronic skin health conditions.',
    items: [
      { name: 'Active Acne Program', duration: '4-8 Weeks', price: '₹1,500 onwards', detail: 'Includes clinical blackhead extractions, salicylic acid peels, and board-certified topical/oral prescriptions.' },
      { name: 'Structural Scar Correction', duration: '3-6 Sessions', price: '₹4,500 / Session', detail: 'Tackles deep ice-pick and boxcar acne scars via clinical subcision and TCA cross therapies.' },
      { name: 'Eczema & Psoriasis Care', duration: 'Ongoing', price: '₹700 / Consultation', detail: 'Precise immune barrier diagnostics, dietary triggers analysis, and anti-inflammatory prescriptions.' },
      { name: 'Dermal Growth Removal', duration: 'Single Session', price: '₹2,000 onwards', detail: 'Safe clinical removal of benign skin tags, warts, and seborrheic keratosis using advanced radio-cautery.' }
    ]
  },
  {
    id: 'lasers',
    name: 'Aesthetic Laser Therapy',
    icon: Sparkles,
    desc: 'Advanced lightwave therapies calibrated specifically for skin resurfacing and hyper-pigment reduction.',
    items: [
      { name: 'Fractional Skin Resurfacing', duration: '3-5 Sessions', price: '₹6,000 / Session', detail: 'Stimulates structural collagen synthesis to smooth fine lines, wrinkles, and persistent textual damage.' },
      { name: 'Q-Switched Pigment Tuning', duration: '4-6 Sessions', price: '₹5,000 / Session', detail: 'Breaks down cellular melanin deposits to fade melasma, sunspots, and post-inflammatory pigmentation.' },
      { name: 'Vascular Laser Therapy', duration: '2-4 Sessions', price: '₹4,500 / Session', detail: 'Targets broken capillaries, diffuse facial redness, and spider veins with precise hemoglobin absorption wavelengths.' },
      { name: 'Safe Laser Skin Toning', duration: '3-5 Sessions', price: '₹5,500 / Session', detail: 'Gentle, low-downtime thermal laser stimulation to brighten overall skin tone and reduce micro-pores.' }
    ]
  },
  {
    id: 'rejuvenation',
    name: 'Cellular Rejuvenation',
    icon: HeartHandshake,
    desc: 'Soft, restorative therapies designed to maintain skin hydration and speed up natural cell cycle turnover.',
    items: [
      { name: 'Medical Glycolic Peels', duration: 'Single Session', price: '₹2,200', detail: 'Sugarcane-derived fruit acids gently dissolve dead skin cells, restoring a smooth, clean texture.' },
      { name: 'Deep Oxygen Infusion', duration: 'Single Session', price: '₹3,000', detail: 'Delivers pressurized hyperbaric oxygen and customized peptide serums deep into the epidermal layers.' },
      { name: 'Detoxifying Facial Therapy', duration: 'Single Session', price: '₹2,500', detail: 'Incorporates medical charcoal masques and lymphatic drainage massages to reduce clinical face swelling.' }
    ]
  }
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('clinical');

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      
      {/* Services Title */}
      <section className="text-left space-y-4 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Dermatological Offerings</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-sans">
          Therapeutic Treatments & Care Services
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          At Cosmediq, we do not believe in generic skincare menus. Every treatment is custom-calibrated. Explore our science-backed clinical, laser, and rejuvenation programs below.
        </p>
      </section>

      {/* Tabs Selector Navigation */}
      <section className="flex flex-wrap gap-3 border-b border-border pb-4">
        {treatmentCategories.map((category) => {
          const Icon = category.icon;
          const isActive = activeTab === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'bg-card text-foreground border border-border hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </button>
          );
        })}
      </section>

      {/* Tab Contents View */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Description Banner */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-6 h-fit space-y-4">
          {(() => {
            const currentCat = treatmentCategories.find(c => c.id === activeTab)!;
            const Icon = currentCat.icon;
            return (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{currentCat.name}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{currentCat.desc}</p>
                <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 flex gap-3 text-xs text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Clinical consultation is mandatory before booking any medical peels or laser therapy cycles.</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* Treatment Details Items */}
        <div className="lg:col-span-2 space-y-6">
          {treatmentCategories.find(c => c.id === activeTab)!.items.map((item, idx) => (
            <div key={idx} className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-primary/5 border border-primary/20 text-primary px-2.5 py-1 rounded-md font-semibold">
                    ⏱️ {item.duration}
                  </span>
                  <span className="bg-secondary/5 border border-secondary/20 text-secondary px-2.5 py-1 rounded-md font-semibold">
                    {item.price}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
