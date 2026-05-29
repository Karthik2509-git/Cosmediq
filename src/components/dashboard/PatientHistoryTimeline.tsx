import React from 'react';
import { Calendar, Stethoscope, Clipboard, Pill, Clock } from 'lucide-react';

interface HistoryItem {
  appointmentId: string;
  date: string;
  doctorName: string;
  specialization: string;
  reason: string;
  diagnosis: string;
  notes: string;
  prescription: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  followUpDate: string;
}

interface PatientHistoryTimelineProps {
  history: HistoryItem[];
}

export function PatientHistoryTimeline({ history }: PatientHistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-muted/20">
        <Clipboard className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-semibold text-foreground">No clinical consultations logged</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          This patient is undergoing their initial visit cycle.
        </p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-border pl-6 ml-3 space-y-8">
      {history.map((item, idx) => (
        <div key={item.appointmentId} className="relative text-left">
          
          {/* Timeline Dot Indicator */}
          <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-background">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
          </span>

          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {item.date}
                </span>
                <h4 className="text-base font-bold text-foreground mt-1 flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  {item.doctorName}
                </h4>
                <p className="text-xs text-muted-foreground">{item.specialization}</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-secondary bg-secondary/5 border border-secondary/15 px-2.5 py-1 rounded-md">
                {item.reason}
              </span>
            </div>

            {/* Diagnosis card */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wide">Dermatological Diagnosis</p>
              <p className="text-sm font-medium text-foreground">{item.diagnosis}</p>
              {item.notes && (
                <>
                  <hr className="border-border my-2" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Skincare & Progress Notes</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{item.notes}"
                  </p>
                </>
              )}
            </div>

            {/* Prescription Table details */}
            {item.prescription && item.prescription.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h5 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-primary" />
                  Prescribed Therapy
                </h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold">
                        <th className="pb-2">Medication</th>
                        <th className="pb-2">Dosage</th>
                        <th className="pb-2">Frequency</th>
                        <th className="pb-2">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-foreground/90 font-medium">
                      {item.prescription.map((drug, dIdx) => (
                        <tr key={dIdx}>
                          <td className="py-2.5 font-bold">{drug.name}</td>
                          <td className="py-2.5">{drug.dosage}</td>
                          <td className="py-2.5">
                            <span className="bg-primary/5 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-semibold">
                              {drug.frequency}
                            </span>
                          </td>
                          <td className="py-2.5">{drug.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Follow-up flag */}
            {item.followUpDate && item.followUpDate !== 'None' && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs font-semibold px-2.5 py-1">
                <Clock className="h-3.5 w-3.5" />
                Follow-Up Scheduled: {item.followUpDate}
              </div>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}
