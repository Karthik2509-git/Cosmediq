'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  fetchDoctorProfileByUserId, 
  toggleDoctorAvailabilityAction 
} from '@/app/actions/doctor';
import { 
  fetchTodayQueueAction, 
  updateQueueStatusAction 
} from '@/app/actions/appointment';
import { 
  fetchPatientHistoryAction, 
  submitConsultationAction 
} from '@/app/actions/consultation';
import { QueueStatusChip } from '@/components/dashboard/QueueStatusChip';
import { PatientHistoryTimeline } from '@/components/dashboard/PatientHistoryTimeline';
import { PrescriptionBuilder } from '@/components/dashboard/PrescriptionBuilder';
import { TreatmentProgressTracker } from '@/components/dashboard/TreatmentProgressTracker';
import { MotivationalQuote } from '@/components/shared/MotivationalQuote';
import { 
  Stethoscope, 
  Users, 
  ClipboardList, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Loader2, 
  AlertCircle,
  FileText,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ShieldAlert,
  History as HistoryIcon
} from 'lucide-react';
import { QueueStatus } from '@prisma/client';

export default function DoctorDashboard() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Active state management
  const [profile, setProfile] = useState<any | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Consultation Patient file loaded
  const [activeAppt, setActiveAppt] = useState<any | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Clinical Consultation Form Inputs
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionsList, setPrescriptionsList] = useState<any[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');

  // Linear progress step index (0: History, 1: Note Pad, 2: Prescribe, 3: Finalize)
  const [activeStep, setActiveStep] = useState(0);

  // 1. Initial Doctor profile and Queue load
  useEffect(() => {
    async function loadData() {
      if (!userId) {
        return;
      }
      setLoading(true);
      const pRes = await fetchDoctorProfileByUserId(userId);
      const qRes = await fetchTodayQueueAction();
      
      if (pRes.success && pRes.profile) {
        setProfile(pRes.profile);
      }
      if (qRes.success && qRes.queue) {
        // Filter queue specifically for this doctor
        const docProfileId = pRes.profile?.id;
        const filtered = qRes.queue.filter(a => a.doctorId === docProfileId);
        setQueue(filtered);
      }
      setLoading(false);
    }
    loadData();
  }, [userId]);

  // 2. Load Patient History & Active Files
  const handleLoadPatientFile = async (appt: any) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setActiveAppt(appt);
    setActiveStep(0); // Reset linear step to History review
    
    // Clear clinical forms
    setDiagnosis('');
    setNotes('');
    setPrescriptionsList([]);
    setFollowUpDate('');

    // Advance queueStatus to CONSULTING automatically when doctor opens file (Staff console speed rule!)
    if (appt.queueStatus === QueueStatus.WAITING) {
      const uRes = await updateQueueStatusAction(appt.id, QueueStatus.CONSULTING, userId);
      if (uRes.success) {
        appt.queueStatus = QueueStatus.CONSULTING;
        // Reload local queue
        const qRes = await fetchTodayQueueAction();
        if (qRes.success && qRes.queue && profile) {
          setQueue(qRes.queue.filter(a => a.doctorId === profile.id));
        }
      }
    }

    setLoadingHistory(true);
    const hRes = await fetchPatientHistoryAction(appt.patientId);
    if (hRes.success && hRes.history) {
      setPatientHistory(hRes.history);
    }
    setLoadingHistory(false);
  };

  // 3. Toggle Schedule availability
  const handleToggleAvailability = async () => {
    if (!profile) {
      return;
    }
    setActionLoading(true);
    const newAvailable = !profile.available;
    const res = await toggleDoctorAvailabilityAction(profile.id, newAvailable, userId);
    
    if (res.success) {
      setProfile((prev: any) => ({ ...prev, available: newAvailable }));
    } else {
      setErrorMsg('Failed to update availability status.');
    }
    setActionLoading(false);
  };

  // 4. Submit Consultation File
  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAppt || !diagnosis) {
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);

    const res = await submitConsultationAction({
      appointmentId: activeAppt.id,
      diagnosis,
      notes,
      prescription: prescriptionsList,
      followUpDate: followUpDate || undefined,
      operatorId: userId,
    });

    if (res.success) {
      setSuccessMsg(`Consultation file for ${activeAppt.patient.user.name} successfully submitted & archived.`);
      setActiveAppt(null); // Return workspace to calm empty state
      
      // Reload active queue
      const qRes = await fetchTodayQueueAction();
      if (qRes.success && qRes.queue && profile) {
        setQueue(qRes.queue.filter(a => a.doctorId === profile.id));
      }
    } else {
      setErrorMsg(res.error || 'Failed to submit consultation parameters.');
    }
    setActionLoading(false);
  };

  // Metric counts
  const totalLoadCount = queue.length;
  const waitingCount = queue.filter(a => a.queueStatus === QueueStatus.WAITING).length;
  const completedCount = queue.filter(a => a.queueStatus === QueueStatus.DONE || a.status === 'COMPLETED').length;

  return (
    <div className="space-y-8 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-sans">
            Clinician Workspace
          </h1>
          <p className="text-sm text-muted-foreground">
            Diagnose skin conditions, prescribe therapies, and review historical care timelines.
          </p>
        </div>

        {/* Schedule availability toggle widget */}
        {profile && (
          <button
            onClick={handleToggleAvailability}
            disabled={actionLoading}
            type="button"
            className={`flex items-center gap-2 text-xs font-bold border px-4 py-2 rounded-xl transition-all ${
              profile.available
                ? 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'
                : 'bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10'
            }`}
          >
            {profile.available ? (
              <>
                <ToggleRight className="h-5 w-5 shrink-0" />
                Receiving Patients (Online)
              </>
            ) : (
              <>
                <ToggleLeft className="h-5 w-5 shrink-0" />
                Busy / Personal Leave (Offline)
              </>
            )}
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-destructive/10 bg-destructive/5 p-4 flex gap-3 text-sm text-destructive items-center">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex gap-3 text-sm text-emerald-600 dark:text-emerald-400 items-center">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* PRIMARY CLINICAL HUB LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR QUEUE TIMELINE PANEL (One-fourth width) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Daily Clinic metrics */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Load</h4>
            <div className="space-y-3 text-sm font-semibold">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Scheduled:</span>
                <span className="text-foreground">{totalLoadCount} Patients</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Waiting:</span>
                <span className="text-amber-500">{waitingCount} Patients</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consulted:</span>
                <span className="text-emerald-500">{completedCount} Completed</span>
              </div>
            </div>
          </div>

          {/* Queued patients list */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-left">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <Users className="h-4 w-4 text-primary" />
              Patient Wait Queue
            </h3>

            {loading ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : queue.length > 0 ? (
              <div className="space-y-3">
                {queue.map((appt) => {
                  const isActive = activeAppt?.id === appt.id;
                  const isCompleted = appt.queueStatus === QueueStatus.DONE || appt.status === 'COMPLETED';

                  return (
                    <button
                      key={appt.id}
                      onClick={() => handleLoadPatientFile(appt)}
                      type="button"
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center gap-2 ${
                        isActive
                          ? 'bg-primary/5 border-primary/45 shadow-sm shadow-primary/5'
                          : 'bg-card border-border hover:bg-muted/10'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded">
                            {appt.tokenNumber || 'T-00'}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground truncate">{appt.patient.user.name}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{appt.reason}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {isCompleted ? (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/5 border border-emerald-500/15 px-1.5 py-0.5 rounded">
                            Done
                          </span>
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                No active patients queued.
              </div>
            )}
          </div>

        </div>

        {/* CENTRAL WORKSPACE CONSOLE (Three-fourths width) */}
        <div className="lg:col-span-3">
          {activeAppt ? (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl shadow-primary/5 space-y-6 text-left">
              
              {/* Active patient header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-black text-primary uppercase tracking-wide">Active Clinical consultation</span>
                  <h2 className="text-xl font-bold text-foreground">{activeAppt.patient.user.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    Patient ID: {activeAppt.patient.user.id.slice(0, 8)} • Phone: {activeAppt.patient.user.phone || 'No phone'}
                  </p>
                </div>
                <QueueStatusChip status={activeAppt.queueStatus} />
              </div>

              {/* Strict Linear Clinical Steps layout navigation */}
              <div className="flex border-b border-border pb-3 gap-2 overflow-x-auto">
                {[
                  { label: '1. Review History', icon: HistoryIcon },
                  { label: '2. Clinical Note Pad', icon: FileText },
                  { label: '3. Digital Prescription', icon: ClipboardList },
                  { label: '4. Finalize', icon: CheckCircle2 }
                ].map((step, sIdx) => {
                  const isActive = activeStep === sIdx;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => setActiveStep(sIdx)}
                      type="button"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/10'
                          : 'bg-card text-muted-foreground hover:bg-muted/10 hover:text-foreground'
                      }`}
                    >
                      <step.icon className="h-3.5 w-3.5" />
                      {step.label}
                    </button>
                  );
                })}
              </div>

              {/* STEP 1: REVIEW PATIENT TIMELINE */}
              {activeStep === 0 && (
                <div className="space-y-6">
                  {/* Visual care progress timeline */}
                  <TreatmentProgressTracker 
                    queueStatus={activeAppt.queueStatus} 
                    status={activeAppt.status} 
                  />
                  <hr className="border-border" />
                  
                  {loadingHistory ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="max-h-[380px] overflow-y-auto pr-2">
                      <PatientHistoryTimeline history={patientHistory} />
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-4 border-t border-border/60">
                    <button
                      onClick={() => setActiveStep(1)}
                      type="button"
                      className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
                    >
                      Advance to Note Pad →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ADD CLINICAL NOTE PAD */}
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                        Dermatological Diagnosis (Required)
                      </label>
                      <input
                        required
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Moderate Acne Vulgaris (Grade III)"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                        Skincare & Lasers comment notes
                      </label>
                      <textarea
                        rows={6}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g. Skin barrier shows dehydration. Instructed to apply hyaluronic acid before bedtime, avoid scrubbing, and follow mild chemical peel course next week."
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border/60">
                    <button
                      onClick={() => setActiveStep(0)}
                      type="button"
                      className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      ← Back to History
                    </button>
                    <button
                      onClick={() => setActiveStep(2)}
                      disabled={!diagnosis.trim()}
                      type="button"
                      className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors disabled:opacity-50"
                    >
                      Add Prescription Items →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DIGITAL PRESCRIPTION BUILDER */}
              {activeStep === 2 && (
                <div className="space-y-6">
                  <PrescriptionBuilder 
                    prescriptions={prescriptionsList} 
                    onChange={setPrescriptionsList} 
                  />

                  <div className="flex justify-between pt-4 border-t border-border/60">
                    <button
                      onClick={() => setActiveStep(1)}
                      type="button"
                      className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      ← Back to Notes
                    </button>
                    <button
                      onClick={() => setActiveStep(3)}
                      type="button"
                      className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
                    >
                      Review & Finalize →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: FINAL PLANS & COMPLETE */}
              {activeStep === 3 && (
                <form onSubmit={handleConsultationSubmit} className="space-y-6">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                    Recommended Follow-Up & Close File
                  </h3>

                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                        Schedule next visit (Optional)
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-4 flex gap-3 text-xs text-amber-600 dark:text-amber-400">
                      <ShieldAlert className="h-5 w-5 shrink-0" />
                      <span>Completing the consultation will immediately archive these notes, issue prescriptions, advance queue parameters, and redirect this workspace.</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-border/60">
                    <button
                      onClick={() => setActiveStep(2)}
                      type="button"
                      className="rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground hover:bg-muted"
                    >
                      ← Back to Prescriptions
                    </button>
                    <button
                      disabled={actionLoading || !diagnosis}
                      type="submit"
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/95 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Finalize & Close Patient File'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          ) : (
            /* Calm Clinical workspace empty state */
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border bg-card shadow-sm h-full max-w-4xl mx-auto space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Stethoscope className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Clinical Care Workspace</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Select a waiting patient from the queue sidebar timeline to load their digital medical history, diagnosic scanners, and active treatment plan.
                </p>
              </div>
              
              {/* Encouragement care quote */}
              <MotivationalQuote role="DOCTOR" className="w-full max-w-lg mt-4 border-primary/10" />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
