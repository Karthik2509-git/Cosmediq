'use client';
import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { LogOut, UserCheck, ShieldCheck, Activity } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { NotificationBell } from '@/components/dashboard/NotificationBell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      {/* Dashboard Top bar */}
      <header className="sticky top-0 z-40 w-full glass border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo iconOnly className="hidden sm:flex" />
              <div className="h-6 w-[1px] bg-border hidden sm:flex" />
              <span className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                Clinic Console
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                type="button"
                className="flex items-center gap-2 text-xs font-bold text-destructive border border-destructive/20 bg-destructive/5 px-3.5 py-2 rounded-xl transition-all duration-300 hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panel Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
