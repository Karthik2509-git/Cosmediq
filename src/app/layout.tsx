import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cosmediq | Premium Aesthetic & Clinical Dermatology',
  description: 'Experience professional clinical care, aesthetic dermatology, and advanced skin rejuvenation therapies at Cosmediq. Premium, trust-centered medical services in Bengaluru.',
  keywords: 'dermatology clinic, cosmetic skin care, acne treatment, aesthetic lasers, Bangalore, HSR Layout, Cosmediq',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased font-sans flex flex-col`}>
        <SessionProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
