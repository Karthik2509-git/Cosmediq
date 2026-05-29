'use client';
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    reason: 'Clinical Consultation',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API request to saving requested appointment
    setTimeout(() => {
      setSubmitted(true);
    }, 400);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      
      {/* Title */}
      <section className="text-left space-y-4 max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Get In Touch</span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-sans">
          Request Consultation Slot
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Need clinical acne therapy, aesthetic laser consultation, or routine skin diagnostics? Fill in the secure appointment request below or call our HSR Layout receptionist.
        </p>
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Form Column */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-lg shadow-primary/5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <h2 className="text-xl font-bold text-foreground">Secure Consultation Request</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-bold text-foreground">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone" className="text-xs font-bold text-foreground">Mobile Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="+91 99000 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold text-foreground">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="john.doe@gmail.com"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="date" className="text-xs font-bold text-foreground">Preferred Date</label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="reason" className="text-xs font-bold text-foreground">Treatment Target</label>
                <select
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>Clinical Skin Consultation</option>
                  <option>Structural Acne Therapy Plan</option>
                  <option>Aesthetic Laser Resurfacing</option>
                  <option>Skin Resurfacing / Chemical Peels</option>
                  <option>Other Routine Diagnostics</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="notes" className="text-xs font-bold text-foreground">Skincare Notes (Optional)</label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe your skin conditions or medication details..."
                />
              </div>

              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 flex gap-3 text-xs text-primary">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Your information is protected by HIPAA/EHR data security guidelines. Online requests are processed within 2 clinical hours.</span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md shadow-primary/15 transition-all duration-300 hover:bg-primary/95"
              >
                <Calendar className="h-4 w-4" />
                Submit Appointment Request
              </button>

            </form>
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Request Successfully Sent</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you, {formData.name}. Our clinic coordinator Sarah will call you at <span className="font-semibold text-foreground">{formData.phone}</span> within 2 hours to confirm your precise specialist slot.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Submit another request
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Info Column */}
        <div className="space-y-8 text-left">
          
          {/* Branch Location Card */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-md shadow-primary/5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Bengaluru HSR Layout Branch
            </h2>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                Our premium facility is located in Sector 3, HSR Layout, featuring modern diagnostic skin scanners and high-precision energy laser setups.
              </p>
              <hr className="border-border" />
              <div className="space-y-3">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />
                  <span>No 456, 17th Cross, Sector 3, HSR Layout, Bengaluru, KA 560102</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-primary" />
                  <span className="font-semibold text-foreground">+91 80 4930 2930</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <span>care@cosmediq.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Hours Card */}
          <div className="rounded-3xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-md shadow-primary/5">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Clinic Consultation Hours
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Monday – Friday:</span>
                <span className="font-semibold text-foreground">9:00 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Saturday:</span>
                <span className="font-semibold text-foreground">9:00 AM – 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-primary font-semibold">Closed</span>
              </div>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
