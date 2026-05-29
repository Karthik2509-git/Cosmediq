'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive animate-pulse">
        <ShieldAlert className="h-12 w-12" />
      </div>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground font-sans">
        Unauthorized Access
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
        Your clinical account credentials do not have permission parameters to view the requested dashboard folder.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.push('/')}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-colors"
        >
          Return to Website
        </button>
        <button
          onClick={() => {
            // Sign out is implicit on redirecting back to login to clear cookies
            router.push('/login');
          }}
          className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-bold text-foreground hover:bg-muted transition-colors"
        >
          Sign In with Another Account
        </button>
      </div>
    </div>
  );
}
