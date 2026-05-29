'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, Calendar, UserCheck } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Treatments' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/testimonials', label: 'Reviews' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact & Location' },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-200 hover:text-primary ${
                    isActive ? 'text-primary font-bold' : 'text-foreground/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/contact"
              className="flex items-center gap-2 text-sm font-semibold text-primary border border-primary/20 bg-primary/5 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-primary/10"
            >
              <Calendar className="h-4 w-4" />
              Request Visit
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground bg-primary px-4 py-2 rounded-xl transition-all duration-300 hover:bg-primary/95 shadow-md shadow-primary/10"
            >
              <UserCheck className="h-4 w-4" />
              Portal Login
            </Link>
          </div>

          {/* Mobile Hamburguer Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              type="button"
              className="p-2 text-foreground/80 hover:text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-card p-4 shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-5">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`text-base font-semibold transition-colors py-1 ${
                    isActive ? 'text-primary' : 'text-foreground/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="border-border my-2" />
            <div className="flex flex-col gap-3">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 text-sm font-bold text-primary border border-primary/25 bg-primary/5 py-3 rounded-xl hover:bg-primary/10"
              >
                <Calendar className="h-4 w-4" />
                Request Appointment
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 text-sm font-bold text-primary-foreground bg-primary py-3 rounded-xl hover:bg-primary/95"
              >
                <UserCheck className="h-4 w-4" />
                Portal Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
