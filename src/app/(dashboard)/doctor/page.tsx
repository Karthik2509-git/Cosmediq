'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  fetchDoctorProfileByUserId, 
  toggleDoctorAvailabilityAction,
  updateDoctorProfileAction
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
import { SkeletonLoader } from '@/components/dashboard/SkeletonLoader';
import { PremiumEmptyState } from '@/components/dashboard/PremiumEmptyState';
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
  const [activeTab, setActiveTab] = useState<'queue' | 'profile' | 'schedule' | 'leaves'>('queue');
  const [profile, setProfile] = useState<any | null>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile form settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    bio: '',
    consultFee: 500,
    experience: 0,
  });

  // Availability schedule state (stored in localStorage)
  const [weeklySchedule, setWeeklySchedule] = useState<Array<{ day: string; active: boolean; start: string; end: string }>>([
    { day: 'Monday', active: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', active: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', active: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', active: true, start: '09:00', end: '17:00' },
    { day: 'Friday', active: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', active: false, start: '09:00', end: '13:00' },
    { day: 'Sunday', active: false, start: '09:00', end: '13:00' },
  ]);

  // Leaves and holidays state
  const [leavesList, setLeavesList] = useState<Array<{ id: string; date: string; duration: string; reason: string; status: string }>>([]);
  const [newLeave, setNewLeave] = useState({
    date: '',
    duration: 'Full Day',
    reason: '',
  });

  // Active Consultation Patient file loaded
  const [activeAppt, setActiveAppt] = useState<any | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Clinical Consultation Form Inputs
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionsList, setPrescriptionsList] = useState<any[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');

  // Autosave draft status state
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | null>(null);

  // Linear progress step index (0: History, 1: Note Pad, 2: Prescribe, 3: Finalize)
  const [activeStep, setActiveStep] = useState(0);

  // Calculate age helper utility
  const calculateAge = (dobString: string | Date) => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} Yrs`;
  };

  // Debounced Autosave Effect
  useEffect(() => {
    if (!activeAppt) return;
    
    setSaveStatus('Saving...');
    const timer = setTimeout(() => {
      const draft = {
        diagnosis,
        notes,
        prescriptionsList,
        followUpDate
      };
      localStorage.setItem(`cosmediq_draft_${activeAppt.id}`, JSON.stringify(draft));
      setSaveStatus('Saved');
    }, 800);

    return () => clearTimeout(timer);
  }, [diagnosis, notes, prescriptionsList, followUpDate, activeAppt]);

  // Load Autosave draft on Patient File loaded
  useEffect(() => {
    if (!activeAppt) {
      setSaveStatus(null);
      return;
    }
    const savedDraft = localStorage.getItem(`cosmediq_draft_${activeAppt.id}`);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setDiagnosis(parsed.diagnosis || '');
        setNotes(parsed.notes || '');
        setPrescriptionsList(parsed.prescriptionsList || []);
        setFollowUpDate(parsed.followUpDate || '');
        setSaveStatus('Saved');
      } catch (e) {
        console.error('Failed to parse clinical draft');
      }
    }
  }, [activeAppt]);

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
        const prof = pRes.profile;
        setProfile(prof);
        setProfileForm({
          name: prof.user.name || '',
          phone: prof.user.phone || '',
          specialization: prof.specialization || '',
          licenseNumber: prof.licenseNumber || '',
          bio: prof.bio || '',
          consultFee: prof.consultFee || 500,
          experience: prof.experience || 0,
        });

        // Load availability schedule from localStorage if exists
        const cachedSchedule = localStorage.getItem(`cosmediq_schedule_${userId}`);
        if (cachedSchedule) {
          try {
            setWeeklySchedule(JSON.parse(cachedSchedule));
          } catch (e) {
            console.error('Failed to parse cached schedule', e);
          }
        }

        // Load leaves list from localStorage if exists
        const cachedLeaves = localStorage.getItem(`cosmediq_leaves_${userId}`);
        if (cachedLeaves) {
          try {
            setLeavesList(JSON.parse(cachedLeaves));
          } catch (e) {
            console.error('Failed to parse cached leaves', e);
          }
        }
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
      // Clear local storage autosave draft
      localStorage.removeItem(`cosmediq_draft_${activeAppt.id}`);
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

  // 5. Submit Doctor Profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !userId) return;

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await updateDoctorProfileAction({
      profileId: profile.id,
      name: profileForm.name,
      phone: profileForm.phone,
      specialization: profileForm.specialization,
      licenseNumber: profileForm.licenseNumber,
      bio: profileForm.bio,
      consultFee: profileForm.consultFee,
      experience: profileForm.experience,
    }, userId);

    if (res.success && res.profile) {
      setProfile(res.profile);
      setSuccessMsg('Clinician profile settings successfully updated.');
    } else {
      setErrorMsg(res.error || 'Failed to update profile settings.');
    }
    setActionLoading(false);
  };

  // 6. Save Availability Schedule hours
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    localStorage.setItem(`cosmediq_schedule_${userId}`, JSON.stringify(weeklySchedule));
    setSuccessMsg('Clinician availability schedule and hours successfully saved.');
  };

  // 7. Add Leave / Holiday schedule
  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newLeave.date || !newLeave.reason) return;

    const leaveObj = {
      id: crypto.randomUUID(),
      date: newLeave.date,
      duration: newLeave.duration,
      reason: newLeave.reason,
      status: 'Approved',
    };

    const updated = [...leavesList, leaveObj];
    setLeavesList(updated);
    localStorage.setItem(`cosmediq_leaves_${userId}`, JSON.stringify(updated));

    // Reset fields
    setNewLeave({
      date: '',
      duration: 'Full Day',
      reason: '',
    });
    setSuccessMsg('Clinician leave/holiday registered and attendance schedule updated.');
  };

  // 8. Delete Leave day schedule
  const handleDeleteLeave = (id: string) => {
    if (!userId) return;
    const updated = leavesList.filter((l) => l.id !== id);
    setLeavesList(updated);
    localStorage.setItem(`cosmediq_leaves_${userId}`, JSON.stringify(updated));
    setSuccessMsg('Registered leave day removed.');
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

      {/* 2. PORTAL TABS SELECTION */}
      <section className="flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          { id: 'queue', label: '1. Patient Queue & Queue Metrics', icon: Stethoscope },
          { id: 'profile', label: '2. Profile Settings', icon: Users },
          { id: 'schedule', label: '3. Availability Schedule', icon: Clock },
          { id: 'leaves', label: '4. Leaves & Holidays', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                  : 'bg-card text-foreground border border-border hover:bg-muted'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </section>

      {/* TAB 1: PATIENT wait QUEUE */}
      {activeTab === 'queue' && (
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
              <SkeletonLoader variant="list" className="py-2" />
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
              <PremiumEmptyState 
                variant="appointments" 
                title="Queue is clear" 
                description="No patients queued today."
              />
            )}
          </div>

        </div>

        {/* CENTRAL WORKSPACE CONSOLE (Three-fourths width) */}
        <div className="lg:col-span-3">
          {activeAppt ? (
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-xl shadow-primary/5 space-y-6 text-left relative">
              
              {/* STICKY PATIENT CONTEXT HEADER */}
              <div className="sticky top-[64px] z-30 bg-card border border-primary/20 rounded-2xl p-4 shadow-md flex flex-wrap justify-between items-center gap-4 mb-6 transition-all duration-300">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Active Patient</p>
                    <p className="text-sm font-black text-foreground">{activeAppt.patient.user.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Patient ID</p>
                    <p className="font-semibold text-foreground">{activeAppt.patient.user.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Vitals (Age/Gender)</p>
                    <p className="font-semibold text-foreground">
                      {calculateAge(activeAppt.patient.dateOfBirth)} / {activeAppt.patient.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Phone Contact</p>
                    <p className="font-semibold text-foreground">{activeAppt.patient.user.phone || 'No Phone'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Complaint Today</p>
                    <p className="font-semibold text-primary">{activeAppt.reason}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Last Visit</p>
                    <p className="font-semibold text-foreground">
                      {patientHistory[0]?.date || 'First Visit'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Queue Token</p>
                    <p className="font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-md">
                      {activeAppt.tokenNumber || 'T-00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active patient header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/80 pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-black text-primary uppercase tracking-wide">Active Clinical consultation</span>
                  <h2 className="text-xl font-bold text-foreground">{activeAppt.patient.user.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    Patient ID: {activeAppt.patient.user.id.slice(0, 8)} • Phone: {activeAppt.patient.user.phone || 'No phone'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {saveStatus && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted/65 px-2 py-1 rounded-md animate-pulse">
                      {saveStatus === 'Saving...' ? 'Saving...' : 'Draft Saved'}
                    </span>
                  )}
                  <QueueStatusChip status={activeAppt.queueStatus} />
                </div>
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
                    {/* Smart Suggested Follow-Up Intervals */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                        Auto-Suggest Follow-Up Interval
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 7);
                            setFollowUpDate(date.toISOString().split('T')[0]);
                          }}
                          className="rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                        >
                          7 Days (Review Consultation)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 15);
                            setFollowUpDate(date.toISOString().split('T')[0]);
                          }}
                          className="rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                        >
                          15 Days (Acne / Peels)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 30);
                            setFollowUpDate(date.toISOString().split('T')[0]);
                          }}
                          className="rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                        >
                          30 Days (Active Treatment Course)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFollowUpDate('')}
                          className="rounded-lg border border-border bg-muted/20 px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/20 transition-all"
                        >
                          Manual / Clear
                        </button>
                      </div>
                    </div>

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
      )}

      {/* TAB 2: PROFILE SETTINGS */}
      {activeTab === 'profile' && profile && (
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-md text-left space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-border/60 pb-4 space-y-1">
            <h3 className="text-lg font-black text-foreground flex items-center gap-1.5">
              <Users className="h-5 w-5 text-primary" />
              Clinician Profile Settings
            </h3>
            <p className="text-xs text-muted-foreground">
              Update your medical background, specialization detail records, and clinical consult charges.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Full Professional Name</label>
              <input
                required
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Contact Phone Number</label>
              <input
                required
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Dermatology Specialization</label>
              <input
                required
                type="text"
                value={profileForm.specialization}
                onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Medical License Number (KMC/MCI)</label>
              <input
                required
                type="text"
                value={profileForm.licenseNumber}
                onChange={(e) => setProfileForm({ ...profileForm, licenseNumber: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Standard Consultation Fee (₹)</label>
              <input
                required
                type="number"
                value={profileForm.consultFee}
                onChange={(e) => setProfileForm({ ...profileForm, consultFee: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Active Clinical Practice Experience (Years)</label>
              <input
                required
                type="number"
                value={profileForm.experience}
                onChange={(e) => setProfileForm({ ...profileForm, experience: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Professional Clinician Bio</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Brief biography detailing your cosmetic surgery, hair restoration, or dermal therapy practice background..."
              />
            </div>

            <div className="md:col-span-2 flex justify-end border-t border-border/60 pt-4">
              <button
                disabled={actionLoading}
                type="submit"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: AVAILABILITY SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-md text-left space-y-6 max-w-4xl mx-auto">
          <div className="border-b border-border/60 pb-4 space-y-1">
            <h3 className="text-lg font-black text-foreground flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-primary" />
              Clinician Availability Schedule & Hours
            </h3>
            <p className="text-xs text-muted-foreground">
              Define your custom daily shift timings and active consultation days of the week.
            </p>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-6">
            <div className="space-y-4">
              {weeklySchedule.map((item, idx) => (
                <div key={item.day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-border bg-muted/10 gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`day-active-${idx}`}
                      checked={item.active}
                      onChange={(e) => {
                        const updated = [...weeklySchedule];
                        updated[idx].active = e.target.checked;
                        setWeeklySchedule(updated);
                      }}
                      className="rounded border-border text-primary focus:ring-primary/20 h-4.5 w-4.5"
                    />
                    <label htmlFor={`day-active-${idx}`} className="text-xs font-bold text-foreground w-28 uppercase tracking-wide">
                      {item.day}
                    </label>
                  </div>

                  {item.active ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="time"
                        value={item.start}
                        onChange={(e) => {
                          const updated = [...weeklySchedule];
                          updated[idx].start = e.target.value;
                          setWeeklySchedule(updated);
                        }}
                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      <span className="text-xs text-muted-foreground font-semibold">to</span>
                      <input
                        type="time"
                        value={item.end}
                        onChange={(e) => {
                          const updated = [...weeklySchedule];
                          updated[idx].end = e.target.value;
                          setWeeklySchedule(updated);
                        }}
                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold text-muted-foreground italic tracking-wide">
                      Closed / Not Consulting
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-border/60 pt-4">
              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/95 cursor-pointer"
              >
                Save Availability Shifts
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: LEAVES & HOLIDAYS */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in">
          {/* New Leave Form */}
          <div className="md:col-span-1 rounded-3xl border border-border bg-card p-6 shadow-md text-left space-y-4 h-fit">
            <div className="border-b border-border/60 pb-3 space-y-1">
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                Register Leave / Holiday
              </h3>
              <p className="text-[10px] text-muted-foreground">Mark yourself unavailable for diagnostic consultations.</p>
            </div>

            <form onSubmit={handleAddLeave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Leave Date</label>
                <input
                  required
                  type="date"
                  value={newLeave.date}
                  onChange={(e) => setNewLeave({ ...newLeave, date: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Duration</label>
                <select
                  value={newLeave.duration}
                  onChange={(e) => setNewLeave({ ...newLeave, duration: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>Full Day</option>
                  <option>First Half (Morning)</option>
                  <option>Second Half (Evening)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Reason / Conference Name</label>
                <input
                  required
                  type="text"
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Skin Restoration Conference"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/95 cursor-pointer"
              >
                Register Leave Date
              </button>
            </form>
          </div>

          {/* Leaves Calendar List */}
          <div className="md:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-md text-left space-y-4">
            <div className="border-b border-border/60 pb-3 space-y-1">
              <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-primary" />
                Active Leave & Holiday Calendar
              </h3>
              <p className="text-[10px] text-muted-foreground">List of confirmed clinical off-days.</p>
            </div>

            {leavesList.length === 0 ? (
              <PremiumEmptyState
                title="No leaves registered"
                description="Your clinical consultation attendance is fully clear. No scheduled holidays detected."
              />
            ) : (
              <div className="space-y-3">
                {leavesList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/10 gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                          {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-black text-primary uppercase tracking-wide">
                          {item.duration}
                        </span>
                        <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-600 uppercase tracking-wide">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteLeave(item.id)}
                      type="button"
                      className="rounded-lg border border-border bg-muted/20 hover:border-destructive/20 hover:text-destructive px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground transition-all cursor-pointer"
                    >
                      Delete Schedule
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
