'use client';
import React, { useState, useEffect, useRef } from 'react';
import { searchPatientsAction } from '@/app/actions/patient';
import { Search, Loader2, Calendar, ClipboardList, UserCheck, ShieldAlert } from 'lucide-react';

interface PatientRecord {
  id: string;
  profileId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  medicalHistory: string;
  emergencyPhone: string;
  lastVisit: string;
  lastDoctor: string;
  lastDoctorId: string;
}

interface GlobalQuickSearchProps {
  onActionTriggered?: (patient: PatientRecord, action: 'queue' | 'book' | 'history' | 'followup') => void;
  className?: string;
}

export function GlobalQuickSearch({ onActionTriggered, className = '' }: GlobalQuickSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim() === '') {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await searchPatientsAction(query);
      if (res.success && res.patients) {
        setResults(res.patients as PatientRecord[]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative w-full max-w-xl ${className}`}>
      
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-4.5 w-4.5 text-muted-foreground/60" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-2xl border border-border bg-card pl-11 pr-10 py-3 text-sm text-foreground shadow-sm shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/65"
          placeholder="Persistent patient search (Name, Phone, ID)..."
        />
        {loading && (
          <Loader2 className="absolute right-4 h-4 w-4 animate-spin text-primary" />
        )}
      </div>

      {/* Floating Dropdown Results Panel */}
      {open && query.trim() !== '' && (
        <div className="absolute top-14 left-0 right-0 z-50 rounded-2xl border border-border bg-card p-2 shadow-xl animate-in fade-in slide-in-from-top-2 max-h-[420px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-border/60 text-left">
              {results.map((patient) => (
                <div key={patient.id} className="p-3.5 hover:bg-muted/10 rounded-xl space-y-3 transition-colors">
                  
                  {/* Patient Info grid */}
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{patient.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                        Patient ID: {patient.id.slice(0, 8)} • Phone: {patient.phone}
                      </p>
                    </div>
                    <div className="text-right text-[10px] text-muted-foreground">
                      <p>Last Visit: <span className="font-bold text-foreground">{patient.lastVisit}</span></p>
                      <p>Doctor: <span className="font-bold text-primary">{patient.lastDoctor}</span></p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setOpen(false);
                        onActionTriggered?.(patient, 'queue');
                      }}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-primary/5 border border-primary/20 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <UserCheck className="h-3 w-3 shrink-0" />
                      Queue Patient
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        onActionTriggered?.(patient, 'book');
                      }}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg bg-secondary/5 border border-secondary/20 px-2.5 py-1.5 text-[11px] font-bold text-secondary hover:bg-secondary hover:text-white transition-all"
                    >
                      <Calendar className="h-3 w-3 shrink-0" />
                      Book Appt
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        onActionTriggered?.(patient, 'history');
                      }}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-bold text-foreground hover:bg-muted transition-all"
                    >
                      <ClipboardList className="h-3 w-3 shrink-0" />
                      View History
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        onActionTriggered?.(patient, 'followup');
                      }}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/10 bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary/10 transition-all"
                    >
                      📅 Add Follow-Up
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <ShieldAlert className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs font-semibold">No active patient logs found matching "{query}".</p>
              <p className="text-[10px] mt-0.5">Check spelling or create a new walk-in record.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
