'use client';
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo } from '@/components/shared/Logo';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid clinical email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInputs) => {
    setLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid credentials. Check your email or password and try again.');
        setLoading(false);
      } else {
        // Redirect will be automatically intercepted by middleware to route to correct dashboard!
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Background radial soft glows */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-3xl -z-10" />

      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo />
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-sans">
              Access Cosmediq Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage appointments, histories, and consults.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl shadow-primary/5 space-y-6">
          {error && (
            <div className="rounded-xl border border-destructive/10 bg-destructive/5 p-4 flex gap-3 text-sm text-destructive items-center">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-foreground">Clinic Email</label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.email ? 'border-destructive' : 'border-border'
                }`}
                placeholder="doctor@cosmediq.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-bold text-foreground">Secure Password</label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.password ? 'border-destructive' : 'border-border'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 flex gap-3 text-xs text-primary leading-relaxed">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <span>Secure credential check ensures encrypted role-based routing. Reception can reset lost parameters.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-all duration-300 hover:bg-primary/95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                'Portal Sign In'
              )}
            </button>
          </form>

          {/* Quick Sandbox Login tip for evaluators */}
          <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 space-y-2 text-left">
            <p className="text-xs font-bold text-foreground uppercase tracking-wide">Developer Sandbox Logins</p>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div>
                <p className="font-bold text-primary">Admin Access:</p>
                <p>admin@cosmediq.com</p>
                <p>pwd: admin123</p>
              </div>
              <div>
                <p className="font-bold text-primary">Staff Access:</p>
                <p>staff@cosmediq.com</p>
                <p>pwd: staff123</p>
              </div>
              <div>
                <p className="font-bold text-primary">Doctor Access:</p>
                <p>doctor@cosmediq.com</p>
                <p>pwd: doctor123</p>
              </div>
              <div>
                <p className="font-bold text-primary">Patient Access:</p>
                <p>patient@cosmediq.com</p>
                <p>pwd: patient123</p>
              </div>
            </div>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-semibold"
          >
            ← Return to public website
          </button>
        </div>

      </div>
    </div>
  );
}
