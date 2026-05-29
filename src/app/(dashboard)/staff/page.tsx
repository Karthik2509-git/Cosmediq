'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  registerPatientAction, 
  searchPatientsAction 
} from '@/app/actions/patient';
import { 
  bookAppointmentAction, 
  updateQueueStatusAction, 
  fetchTodayQueueAction 
} from '@/app/actions/appointment';
import { fetchDoctorsAction } from '@/app/actions/doctor';
import { fetchPatientHistoryAction } from '@/app/actions/consultation';
import { GlobalQuickSearch } from '@/components/dashboard/GlobalQuickSearch';
import { QueueStatusChip } from '@/components/dashboard/QueueStatusChip';
import { PatientHistoryTimeline } from '@/components/dashboard/PatientHistoryTimeline';
import { TreatmentProgressTracker } from '@/components/dashboard/TreatmentProgressTracker';
import { 
  Calendar, 
  Users, 
  ClipboardList, 
  ShieldCheck, 
  UserPlus, 
  UserCheck, 
  Plus, 
  Loader2, 
  Stethoscope, 
  History, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { QueueStatus } from '@prisma/client';

export default function StaffDashboard() {
  const { data: session } = useSession();
  const operatorId = session?.user?.id;

  // Active state management
  const [queue, setQueue] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected Patient for history/followup drawer details
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Active Right Side Console Drawer Tab (or None)
  // 'walkin' | 'book' | 'history' | 'followup' | null
  const [activeTab, setActiveTab] = useState<'walkin' | 'book' | 'history' | 'followup' | null>(null);

  // Form states
  const [walkinForm, setWalkinForm] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '1995-01-01',
    gender: 'Female',
    reason: 'Clinical Skin Consultation',
    doctorId: '',
  });

  const [bookForm, setBookForm] = useState({
    patientId: '', // Selected existing patient ID
    doctorId: '',
    dateTime: '',
    reason: 'Clinical Skin Consultation',
    notes: '',
  });

  const [followupForm, setFollowupForm] = useState({
    patientId: '',
    doctorId: '',
    dateTime: '',
    notes: '',
  });

  // 1. Initial Data Fetching
  useEffect(() => {
    async function loadData() {
      setLoadingQueue(true);
      const qRes = await fetchTodayQueueAction();
      const dRes = await fetchDoctorsAction();
      
      if (qRes.success && qRes.queue) {
        setQueue(qRes.queue);
      }
      if (dRes.success && dRes.doctors) {
        setDoctors(dRes.doctors);
        if (dRes.doctors.length > 0) {
          setWalkinForm(prev => ({ ...prev, doctorId: dRes.doctors[0].profileId }));
          setBookForm(prev => ({ ...prev, doctorId: dRes.doctors[0].profileId }));
          setFollowupForm(prev => ({ ...prev, doctorId: dRes.doctors[0].profileId }));
        }
      }
      setLoadingQueue(false);
    }
    loadData();
  }, []);

  // 2. Fetch Selected Patient History
  const fetchHistory = async (profileId: string) => {
    setLoadingHistory(true);
    const res = await fetchPatientHistoryAction(profileId);
    if (res.success && res.history) {
      setPatientHistory(res.history);
    }
    setLoadingHistory(false);
  };

  // 3. Queue Action Triggered from smart search
  const handleSearchAction = async (patient: any, action: 'queue' | 'book' | 'history' | 'followup') => {
    setSelectedPatient(patient);
    
    if (action === 'history') {
      setActiveTab('history');
      await fetchHistory(patient.profileId);
    } else if (action === 'queue') {
      // Auto queue existing patient immediately for today
      setActionLoading(true);
      setErrorMsg(null);
      const todayString = new Date().toISOString();
      const defaultDoc = doctors[0]?.profileId;
      
      if (!defaultDoc) {
        setErrorMsg('No doctor is currently configured to receive patients.');
        setActionLoading(false);
        return;
      }

      // Book appointment and queue in a single flow
      const bRes = await bookAppointmentAction({
        patientProfileId: patient.profileId,
        doctorProfileId: defaultDoc,
        dateTime: todayString,
        reason: 'Walk-In Consultation',
        operatorId,
      });

      if (bRes.success) {
        const qRes = await fetchTodayQueueAction();
        if (qRes.success && qRes.queue) {
          setQueue(qRes.queue);
        }
        setActiveTab(null);
      } else {
        setErrorMsg(bRes.error || 'Failed to queue patient.');
      }
      setActionLoading(false);
    } else if (action === 'book') {
      setBookForm(prev => ({ ...prev, patientId: patient.profileId }));
      setActiveTab('book');
    } else if (action === 'followup') {
      setFollowupForm(prev => ({ ...prev, patientId: patient.profileId }));
      setActiveTab('followup');
    }
  };

  // 4. One-click queue state modifiers (WAITING -> CONSULTING -> DONE)
  const handleAdvanceQueue = async (appointmentId: string, currentQueueStatus: QueueStatus) => {
    setActionLoading(true);
    let nextStatus: QueueStatus = QueueStatus.CONSULTING;
    if (currentQueueStatus === QueueStatus.CONSULTING) {
      nextStatus = QueueStatus.DONE;
    }

    const res = await updateQueueStatusAction(appointmentId, nextStatus, operatorId);
    if (res.success) {
      const qRes = await fetchTodayQueueAction();
      if (qRes.success && qRes.queue) {
        setQueue(qRes.queue);
      }
    } else {
      setErrorMsg(res.error || 'Failed to modify queue status.');
    }
    setActionLoading(false);
  };

  // 5. Submit Walk-In Patient & Auto-Queue (minimal click rule!)
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);

    // Register User first
    const rRes = await registerPatientAction({
      name: walkinForm.name,
      email: walkinForm.email || `${walkinForm.phone}@cosmediq.com`, // Auto-generate if empty
      phone: walkinForm.phone,
      dateOfBirth: walkinForm.dob,
      gender: walkinForm.gender,
      operatorId,
    });

    if (!rRes.success) {
      setErrorMsg(rRes.error || 'Failed to register walk-in.');
      setActionLoading(false);
      return;
    }

    // Auto Book Appointment Slot & Queue Immediately (Walk-in workflow!)
    const patientProfileId = await dbSearchPatientProfileId(walkinForm.email || `${walkinForm.phone}@cosmediq.com`);
    
    if (!patientProfileId) {
      setErrorMsg('Internal link error. Patient registered but profile not resolved.');
      setActionLoading(false);
      return;
    }

    const todayString = new Date().toISOString();
    const bRes = await bookAppointmentAction({
      patientProfileId,
      doctorProfileId: walkinForm.doctorId,
      dateTime: todayString,
      reason: walkinForm.reason,
      operatorId,
    });

    if (bRes.success) {
      // Reload queue and clear inputs
      const qRes = await fetchTodayQueueAction();
      if (qRes.success && qRes.queue) {
        setQueue(qRes.queue);
      }
      setWalkinForm({
        name: '',
        phone: '',
        email: '',
        dob: '1995-01-01',
        gender: 'Female',
        reason: 'Clinical Skin Consultation',
        doctorId: doctors[0]?.profileId || '',
      });
      setActiveTab(null);
    } else {
      setErrorMsg(bRes.error || 'Failed to book slot.');
    }
    setActionLoading(false);
  };

  // Helper helper to lookup profile ID after registration
  const dbSearchPatientProfileId = async (email: string) => {
    const list = await searchPatientsAction(email);
    if (list.success && list.patients && list.patients.length > 0) {
      return list.patients[0].profileId;
    }
    return null;
  };

  // 6. Submit Appointment Booking
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);

    const res = await bookAppointmentAction({
      patientProfileId: bookForm.patientId,
      doctorProfileId: bookForm.doctorId,
      dateTime: bookForm.dateTime,
      reason: bookForm.reason,
      notes: bookForm.notes,
      operatorId,
    });

    if (res.success) {
      const qRes = await fetchTodayQueueAction();
      if (qRes.success && qRes.queue) {
        setQueue(qRes.queue);
      }
      setBookForm({
        patientId: '',
        doctorId: doctors[0]?.profileId || '',
        dateTime: '',
        reason: 'Clinical Skin Consultation',
        notes: '',
      });
      setActiveTab(null);
    } else {
      setErrorMsg(res.error || 'Failed to book appointment.');
    }
    setActionLoading(false);
  };

  // 7. Submit Follow-Up Booking
  const handleFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setErrorMsg(null);

    const res = await bookAppointmentAction({
      patientProfileId: followupForm.patientId,
      doctorProfileId: followupForm.doctorId,
      dateTime: followupForm.dateTime,
      reason: 'Follow-Up Treatment check',
      notes: followupForm.notes,
      operatorId,
    });

    if (res.success) {
      const qRes = await fetchTodayQueueAction();
      if (qRes.success && qRes.queue) {
        setQueue(qRes.queue);
      }
      setFollowupForm({
        patientId: '',
        doctorId: doctors[0]?.profileId || '',
        dateTime: '',
        notes: '',
      });
      setActiveTab(null);
    } else {
      setErrorMsg(res.error || 'Failed to book follow-up.');
    }
    setActionLoading(false);
  };

  // Calculations for Today's Overview cards
  const scheduledCount = queue.length;
  const waitingCount = queue.filter(a => a.queueStatus === QueueStatus.WAITING).length;
  const completedCount = queue.filter(a => a.queueStatus === QueueStatus.DONE || a.status === 'COMPLETED').length;
  const followUpPendingCount = queue.filter(a => a.reason.toLowerCase().includes('follow')).length;

  return (
    <div className="space-y-8 text-left">
      
      {/* PERSISTENT HEADER HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-sans">
            Operations Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage live walk-ins, calendar bookings, and patient queues.
          </p>
        </div>
        <GlobalQuickSearch onActionTriggered={handleSearchAction} />
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-destructive/10 bg-destructive/5 p-4 flex gap-3 text-sm text-destructive items-center">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. OPERATIONS METRIC HUD */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Today's Scheduled", val: scheduledCount, icon: Calendar, color: 'text-primary' },
          { label: "Patients Waiting", val: waitingCount, icon: Clock, color: 'text-amber-500' },
          { label: "Finished Visits", val: completedCount, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: "Follow-Ups Active", val: followUpPendingCount, icon: ClipboardList, color: 'text-secondary' }
        ].map((c, idx) => (
          <div key={idx} className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold">
                {c.label}
              </span>
              <c.icon className={`h-4.5 w-4.5 ${c.color}`} />
            </div>
            <p className="text-xl sm:text-2xl font-black text-foreground">{c.val}</p>
          </div>
        ))}
      </div>

      {/* QUICK QUICK-ACTION LAUNCH BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            setActiveTab('walkin');
            setSelectedPatient(null);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/20 bg-primary/5 px-4 py-2.5 rounded-xl hover:bg-primary/10 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Register Walk-In Patient
        </button>
        <button
          onClick={() => {
            setActiveTab('book');
            setSelectedPatient(null);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-foreground border border-border bg-card px-4 py-2.5 rounded-xl hover:bg-muted transition-colors"
        >
          <Plus className="h-4 w-4 text-primary" />
          Book Slot (Existing)
        </button>
      </div>

      {/* PRIMARY CONSOLE SPLIT SCREEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: LIVE PATIENT QUEUE (Two-thirds width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Live Clinic Patient Queue
            </h3>

            {loadingQueue ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : queue.length > 0 ? (
              <div className="relative border-l border-border pl-6 ml-3 space-y-6 text-left">
                {queue.map((appt) => {
                  const isWaiting = appt.queueStatus === QueueStatus.WAITING;
                  const isConsulting = appt.queueStatus === QueueStatus.CONSULTING;
                  const isCompleted = appt.queueStatus === QueueStatus.DONE || appt.status === 'COMPLETED';

                  return (
                    <div key={appt.id} className="relative group">
                      
                      {/* Timeline Dot Indicator */}
                      <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background ${
                        isCompleted ? 'bg-emerald-500' : isConsulting ? 'bg-primary' : 'bg-amber-500'
                      }`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>

                      <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 hover:border-primary/20">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                              Token: {appt.tokenNumber || 'T-00'}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {new Date(appt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-foreground">{appt.patient.user.name}</h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Stethoscope className="h-3.5 w-3.5 text-primary" />
                            Doctor: {appt.doctor.user.name} • Target: {appt.reason}
                          </p>
                        </div>

                        {/* Status chip & Quick Actions */}
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                          <QueueStatusChip status={appt.queueStatus} />
                          
                          {/* One-click queue state modifications (Staff Console speed rule!) */}
                          {!isCompleted && (
                            <button
                              onClick={() => handleAdvanceQueue(appt.id, appt.queueStatus)}
                              disabled={actionLoading}
                              type="button"
                              className="text-xs font-bold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/95 transition-colors disabled:opacity-50"
                            >
                              {isWaiting ? 'Call to Consult' : 'Complete Visit'}
                            </button>
                          )}

                          {/* Inspect Patient History timeline button */}
                          <button
                            onClick={() => handleSearchAction({ 
                              profileId: appt.patientId, 
                              name: appt.patient.user.name,
                              id: appt.patient.user.id,
                              phone: appt.patient.user.phone || 'No phone',
                              medicalHistory: appt.patient.medicalHistory || ''
                            }, 'history')}
                            type="button"
                            className="p-1.5 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                            title="Inspect History"
                          >
                            <History className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-muted/10">
                <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-bold text-foreground">No appointments scheduled today.</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Register walk-in patients or book a slot from the persistent quick action HUD to begin the live queue.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DYNAMIC SLIDE CONSOLE PANEL (One-third width) */}
        <div className="lg:col-span-1">
          {activeTab ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg relative animate-in fade-in slide-in-from-right-5">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveTab(null)}
                className="absolute top-4 right-4 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </button>

              {/* TAB 1: REGISTER WALK-IN */}
              {activeTab === 'walkin' && (
                <form onSubmit={handleWalkinSubmit} className="space-y-4 text-left">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Register Walk-In Patient
                  </h3>
                  <hr className="border-border" />
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Patient Name</label>
                    <input
                      required
                      type="text"
                      value={walkinForm.name}
                      onChange={(e) => setWalkinForm({ ...walkinForm, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Sarah Connor"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Mobile Phone</label>
                    <input
                      required
                      type="tel"
                      value={walkinForm.phone}
                      onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="+91 99000 00000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Date of Birth</label>
                    <input
                      required
                      type="date"
                      value={walkinForm.dob}
                      onChange={(e) => setWalkinForm({ ...walkinForm, dob: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Target Doctor</label>
                    <select
                      value={walkinForm.doctorId}
                      onChange={(e) => setWalkinForm({ ...walkinForm, doctorId: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {doctors.map(d => (
                        <option key={d.profileId} value={d.profileId}>{d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Chief Complaint</label>
                    <input
                      required
                      type="text"
                      value={walkinForm.reason}
                      onChange={(e) => setWalkinForm({ ...walkinForm, reason: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. Flare acne check"
                    />
                  </div>

                  <button
                    disabled={actionLoading}
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register & Queue Token'}
                  </button>
                </form>
              )}

              {/* TAB 2: BOOK SLOT */}
              {activeTab === 'book' && (
                <form onSubmit={handleBookSubmit} className="space-y-4 text-left">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-5 w-5 text-primary" />
                    Book Calendar Appointment
                  </h3>
                  <hr className="border-border" />

                  {selectedPatient && (
                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 space-y-1 text-xs">
                      <p className="font-bold text-foreground">Target Patient:</p>
                      <p className="text-muted-foreground">{selectedPatient.name} • {selectedPatient.phone}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Target Doctor</label>
                    <select
                      value={bookForm.doctorId}
                      onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {doctors.map(d => (
                        <option key={d.profileId} value={d.profileId}>{d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Date & Time</label>
                    <input
                      required
                      type="datetime-local"
                      value={bookForm.dateTime}
                      onChange={(e) => setBookForm({ ...bookForm, dateTime: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Reason for Visit</label>
                    <input
                      required
                      type="text"
                      value={bookForm.reason}
                      onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g. Active Acne diagnostics"
                    />
                  </div>

                  <button
                    disabled={actionLoading || !bookForm.patientId}
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Booking'}
                  </button>
                  {!bookForm.patientId && (
                    <p className="text-[10px] text-destructive text-center font-semibold">
                      Please search and select a patient from the HUD header first.
                    </p>
                  )}
                </form>
              )}

              {/* TAB 3: CLINICAL HISTORY TIMELINE */}
              {activeTab === 'history' && selectedPatient && (
                <div className="space-y-6 text-left max-h-[500px] overflow-y-auto pr-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <History className="h-5 w-5 text-primary" />
                      Dermatological Timeline
                    </h3>
                    <p className="text-xs font-bold text-primary">{selectedPatient.name}</p>
                    <p className="text-[10px] text-muted-foreground">ID: {selectedPatient.id.slice(0, 8)}</p>
                  </div>
                  <hr className="border-border" />

                  {loadingHistory ? (
                    <div className="py-8 flex justify-center items-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <TreatmentProgressTracker 
                        queueStatus={QueueStatus.WAITING} 
                        status="CONFIRMED" 
                        className="pb-4"
                      />
                      <hr className="border-border" />
                      <PatientHistoryTimeline history={patientHistory} />
                    </>
                  )}
                </div>
              )}

              {/* TAB 4: ADD FOLLOW-UP */}
              {activeTab === 'followup' && (
                <form onSubmit={handleFollowupSubmit} className="space-y-4 text-left">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                    📅 Schedule Follow-Up Check
                  </h3>
                  <hr className="border-border" />

                  {selectedPatient && (
                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 space-y-1 text-xs">
                      <p className="font-bold text-foreground">Target Patient:</p>
                      <p className="text-muted-foreground">{selectedPatient.name} • {selectedPatient.phone}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Target Doctor</label>
                    <select
                      value={followupForm.doctorId}
                      onChange={(e) => setFollowupForm({ ...followupForm, doctorId: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {doctors.map(d => (
                        <option key={d.profileId} value={d.profileId}>{d.name} ({d.specialization})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-foreground uppercase tracking-wider">Follow-Up Date</label>
                    <input
                      required
                      type="datetime-local"
                      value={followupForm.dateTime}
                      onChange={(e) => setFollowupForm({ ...followupForm, dateTime: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <button
                    disabled={actionLoading || !followupForm.patientId}
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Follow-Up'}
                  </button>
                  {!followupForm.patientId && (
                    <p className="text-[10px] text-destructive text-center font-semibold">
                      Please search and select a patient from the HUD header first.
                    </p>
                  )}
                </form>
              )}

            </div>
          ) : (
            /* Encouraging clinic placeholder */
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground space-y-4">
              <ShieldCheck className="h-10 w-10 text-primary mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Clinic Coordination Panel</h4>
                <p className="text-xs leading-relaxed max-w-xs mx-auto">
                  Click quick actions or search a patient record in the persistent HUD to populate active scheduling, follow-ups, and diagnostic medical histories in this console drawer.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
