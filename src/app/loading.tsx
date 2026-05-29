import React from 'react';
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-300">
      <div className="flex flex-col items-center space-y-4">
        {/* Soft rotating clinical loader */}
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-sm font-bold tracking-wide text-foreground">
            Synchronizing Clinical Data...
          </p>
          <p className="text-xs text-muted-foreground">
            Cosmediq is securing and optimizing your connection.
          </p>
        </div>
      </div>
    </div>
  );
}
