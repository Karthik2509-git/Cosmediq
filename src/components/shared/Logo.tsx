import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className = '', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Premium Logo Icon Mark */}
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-primary-foreground shadow-md shadow-primary/10">
        <Sparkles className="h-5 w-5" />
      </div>
      
      {/* Premium Logo Typeface */}
      {!iconOnly && (
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent font-sans">
          Cosmediq<span className="text-primary font-black">.</span>
        </span>
      )}
    </div>
  );
}
