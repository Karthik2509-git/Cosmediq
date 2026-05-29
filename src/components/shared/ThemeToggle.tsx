'use client';
import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-all duration-300 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
      aria-label="Toggle visual theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-secondary transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Sun className="h-5 w-5 text-primary transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  );
}
