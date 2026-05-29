import React from 'react';
import { Stethoscope, Sparkles, HeartHandshake, CheckCircle2, Circle } from 'lucide-react';
import { QueueStatus } from '@prisma/client';

interface TreatmentProgressTrackerProps {
  queueStatus: QueueStatus;
  status: string; // CONFIRMED, COMPLETED, etc.
  className?: string;
}

export function TreatmentProgressTracker({ queueStatus, status, className = '' }: TreatmentProgressTrackerProps) {
  // Determine active step index
  // Step 1: WAITING (Scheduled/Arrived)
  // Step 2: CONSULTING (Clinical Diagnostics)
  // Step 3: DONE & status !== COMPLETED (Verification / Transition)
  // Step 4: status === COMPLETED (Finished care cycle)
  let activeIndex = 0;
  if (status === 'COMPLETED') {
    activeIndex = 3;
  } else if (queueStatus === QueueStatus.DONE) {
    activeIndex = 2;
  } else if (queueStatus === QueueStatus.CONSULTING) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  const steps = [
    {
      title: 'Scheduled / Arrived',
      desc: 'Receptionist registered, daily queue token allocated.',
      icon: Circle,
    },
    {
      title: 'Clinical Diagnostics',
      desc: 'Skin scanner analysis, chief complaint evaluation.',
      icon: Stethoscope,
    },
    {
      title: 'Therapy & Peels',
      desc: 'Laser wavelengths set, chemical peel procedures complete.',
      icon: Sparkles,
    },
    {
      title: 'Resolution Cycle',
      desc: 'Prescriptions issued, follow-up parameters verified.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className={`space-y-6 text-left ${className}`}>
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
        Active Treatment Care Cycle Progress
      </h4>

      {/* Visual Timeline Track */}
      <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-4 pl-4 md:pl-0">
        
        {/* Vertical line for mobile, horizontal for desktop */}
        <div className="absolute left-[23px] md:left-6 top-8 bottom-8 md:bottom-auto md:right-6 md:h-0.5 w-0.5 md:w-auto md:flex-1 bg-border -z-10" />

        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const StepIcon = step.icon;

          return (
            <div key={idx} className="flex md:flex-col items-start gap-4 md:gap-3 md:flex-1 relative">
              {/* Dot Icon Indicator */}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : isActive
                    ? 'bg-primary border-primary text-white shadow-md shadow-primary/10 ring-4 ring-primary/10'
                    : 'bg-card border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? '✓' : idx + 1}
              </div>

              {/* Text content details */}
              <div className="space-y-1">
                <h5
                  className={`text-sm font-bold tracking-tight ${
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground/90' : 'text-muted-foreground'
                  }`}
                >
                  {step.title}
                </h5>
                <p className="text-[11px] leading-relaxed text-muted-foreground max-w-[200px]">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
