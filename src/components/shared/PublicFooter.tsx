import React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-border bg-card text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Vision Column */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Delivering premium dermatological therapies and aesthetic treatments with clinical precision and compassionate medical care.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Clinic Portal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Legacy & Legacy
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Dermatology Services
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="text-muted-foreground hover:text-primary transition-colors">
                  Medical Specialists
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-muted-foreground hover:text-primary transition-colors">
                  Success Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">Operational Hours</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex justify-between">
                <span>Mon – Fri:</span>
                <span className="font-semibold text-foreground">9:00 AM – 7:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="font-semibold text-foreground">9:00 AM – 4:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-primary font-semibold">Closed</span>
              </li>
            </ul>
          </div>

          {/* Branch Contact Details Column */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">HSR Layout Branch</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>Sector 3, HSR Layout, Bengaluru, KA 560102</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+91 80 4930 2930</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>care@cosmediq.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-border my-8" />

        {/* Footer Bottom Credentials */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Cosmediq Clinic. All rights reserved.</p>
          <div className="flex items-center gap-2 text-primary font-medium">
            <Shield className="h-3.5 w-3.5" />
            <span>ISO 9001:2015 Certified Healthcare Facility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
