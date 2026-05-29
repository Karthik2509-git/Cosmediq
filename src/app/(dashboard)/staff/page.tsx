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
import { 
  fetchInvoicesAction, 
  createInvoiceAction, 
  recordManualPaymentAction 
} from '@/app/actions/billing';
import { GlobalQuickSearch } from '@/components/dashboard/GlobalQuickSearch';
import { QueueStatusChip } from '@/components/dashboard/QueueStatusChip';
import { PatientHistoryTimeline } from '@/components/dashboard/PatientHistoryTimeline';
import { TreatmentProgressTracker } from '@/components/dashboard/TreatmentProgressTracker';
import { SkeletonLoader } from '@/components/dashboard/SkeletonLoader';
import { PremiumEmptyState } from '@/components/dashboard/PremiumEmptyState';
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
  AlertCircle,
  CreditCard,
  Printer,
  FileText,
  Trash2
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
  // 'walkin' | 'book' | 'history' | 'followup' | 'billing' | null
  const [activeTab, setActiveTab] = useState<'walkin' | 'book' | 'history' | 'followup' | 'billing' | null>(null);

  // Billing ledger states
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [billingFilter, setBillingFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID'>('ALL');
  
  // Custom invoice creator states
  const [invoiceItemName, setInvoiceItemName] = useState('Standard Consultation Fee');
  const [invoiceItemPrice, setInvoiceItemPrice] = useState(700);
  const [invoiceItemsList, setInvoiceItemsList] = useState<Array<{ name: string; price: number }>>([
    { name: 'Standard Consultation Fee', price: 700 }
  ]);

  // Payment Recording State
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(700);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, CARD, UPI

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

  // 2b. Fetch Invoices Ledger
  const loadInvoices = async (profileId?: string) => {
    setLoadingInvoices(true);
    setErrorMsg(null);
    const res = await fetchInvoicesAction(profileId);
    if (res.success && res.invoices) {
      setInvoices(res.invoices);
    } else {
      setErrorMsg(res.error || 'Failed to fetch invoices.');
    }
    setLoadingInvoices(false);
  };

  // 3. Queue Action Triggered from smart search
  const handleSearchAction = async (patient: any, action: 'queue' | 'book' | 'history' | 'followup' | 'billing') => {
    setSelectedPatient(patient);
    
    if (action === 'history') {
      setActiveTab('history');
      await fetchHistory(patient.profileId);
    } else if (action === 'billing') {
      setActiveTab('billing');
      setInvoiceItemsList([{ name: 'Standard Consultation Fee', price: 700 }]);
      await loadInvoices(patient.profileId);
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

  // 3b. Custom Item Helpers
  const handleAddInvoiceItem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!invoiceItemName.trim()) return;
    setInvoiceItemsList(prev => [...prev, { name: invoiceItemName.trim(), price: Number(invoiceItemPrice) }]);
    setInvoiceItemName('');
    setInvoiceItemPrice(0);
  };

  const handleRemoveInvoiceItem = (idx: number) => {
    setInvoiceItemsList(prev => prev.filter((_, i) => i !== idx));
  };

  // 3c. Submit Manual Invoice
  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setErrorMsg('Please select or search a patient record first.');
      return;
    }
    setActionLoading(true);
    setErrorMsg(null);

    const totalAmount = invoiceItemsList.reduce((sum, item) => sum + item.price, 0);

    const res = await createInvoiceAction({
      patientProfileId: selectedPatient.profileId,
      amount: totalAmount,
      items: invoiceItemsList,
      operatorId,
    });

    if (res.success) {
      await loadInvoices(selectedPatient.profileId);
      setInvoiceItemsList([{ name: 'Standard Consultation Fee', price: 700 }]);
    } else {
      setErrorMsg(res.error || 'Failed to create invoice.');
    }
    setActionLoading(false);
  };

  // 3d. Record manual payment log
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment) return;
    setActionLoading(true);
    setErrorMsg(null);

    const res = await recordManualPaymentAction({
      invoiceId: selectedInvoiceForPayment,
      paidAmount: Number(paymentAmount),
      paymentMethod: paymentMethod,
      operatorId,
    });

    if (res.success) {
      await loadInvoices(selectedPatient?.profileId);
      setSelectedInvoiceForPayment(null);
    } else {
      setErrorMsg(res.error || 'Failed to record manual payment.');
    }
    setActionLoading(false);
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
        <button
          onClick={async () => {
            setSelectedPatient(null);
            setActiveTab('billing');
            await loadInvoices();
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-foreground border border-border bg-card px-4 py-2.5 rounded-xl hover:bg-muted transition-colors"
        >
          <CreditCard className="h-4 w-4 text-primary" />
          Billing & Invoices Ledger
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
              <SkeletonLoader variant="list" className="py-2" />
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
              <PremiumEmptyState 
                variant="appointments" 
                title="Your schedule is clear for now" 
                description="No appointments scheduled today. Register walk-in patients or book slots from the persistent header HUD to begin the live queue."
              />
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
                    <SkeletonLoader variant="list" className="py-2" />
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

              {/* TAB 5: BILLING & INVOICES LEDGER */}
              {activeTab === 'billing' && (
                <div className="space-y-6 text-left max-h-[600px] overflow-y-auto pr-2">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Financial & Invoice Ledgers
                    </h3>
                    {selectedPatient ? (
                      <p className="text-xs font-bold text-primary">Patient: {selectedPatient.name}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Global Clinic Ledger Overview</p>
                    )}
                  </div>
                  <hr className="border-border" />

                  {/* Mode 1: Selected Patient Active Billing Console */}
                  {selectedPatient ? (
                    <div className="space-y-6">
                      
                      {/* Sub-section A: Create Manual Invoice */}
                      <form onSubmit={handleCreateInvoiceSubmit} className="rounded-xl border border-border p-4 bg-muted/5 space-y-4">
                        <h4 className="text-xs font-black uppercase text-foreground tracking-wider flex items-center gap-1">
                          <Plus className="h-3.5 w-3.5 text-primary" />
                          Generate Custom Tax Invoice
                        </h4>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={invoiceItemName}
                            onChange={(e) => setInvoiceItemName(e.target.value)}
                            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. Chemical peeling therapy"
                          />
                          <input
                            type="number"
                            value={invoiceItemPrice}
                            onChange={(e) => setInvoiceItemPrice(Number(e.target.value))}
                            className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="₹"
                          />
                          <button
                            type="button"
                            onClick={handleAddInvoiceItem}
                            className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs"
                          >
                            Add
                          </button>
                        </div>

                        {/* List of itemized charges added */}
                        {invoiceItemsList.length > 0 && (
                          <div className="rounded-lg border border-border/80 bg-card divide-y divide-border/60 text-xs">
                            {invoiceItemsList.map((item, idx) => (
                              <div key={idx} className="p-2 flex justify-between items-center">
                                <span className="font-bold text-foreground truncate max-w-[150px]">{item.name}</span>
                                <div className="flex items-center gap-2 font-black">
                                  <span>₹{item.price}</span>
                                  {invoiceItemsList.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveInvoiceItem(idx)}
                                      className="text-destructive hover:text-destructive/85"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="p-2 bg-muted/10 flex justify-between items-center font-black border-t border-border">
                              <span>Total Calculated:</span>
                              <span>₹{invoiceItemsList.reduce((sum, i) => sum + i.price, 0)}</span>
                            </div>
                          </div>
                        )}

                        {/* Presets */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[
                            { name: 'Standard Consultation Fee', price: 700 },
                            { name: 'Laser Skincare Therapy', price: 3500 },
                            { name: 'Chemical Barrier Peel', price: 1800 }
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setInvoiceItemsList(prev => [...prev, preset]);
                              }}
                              className="text-[10px] font-bold text-muted-foreground hover:text-primary border border-border px-2.5 py-1 rounded-lg hover:border-primary/20 transition-all"
                            >
                              + {preset.name.split(' ')[0]} (₹{preset.price})
                            </button>
                          ))}
                        </div>

                        <button
                          disabled={actionLoading}
                          type="submit"
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors"
                        >
                          {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Instantly Save Invoice'}
                        </button>
                      </form>

                      {/* Sub-section B: Record Payment Form (Dynamic inline drawer overlay) */}
                      {selectedInvoiceForPayment && (
                        <form onSubmit={handleRecordPaymentSubmit} className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                              Log Manual Payment Collection
                            </h4>
                            <button 
                              type="button" 
                              onClick={() => setSelectedInvoiceForPayment(null)} 
                              className="text-xs text-muted-foreground hover:text-foreground font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Billed Total Pending</label>
                            <input
                              required
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(Number(e.target.value))}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Collection Method</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option>CASH</option>
                              <option>CARD</option>
                              <option>UPI</option>
                            </select>
                          </div>

                          <button
                            disabled={actionLoading}
                            type="submit"
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-md transition-colors"
                          >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Payment Collected'}
                          </button>
                        </form>
                      )}

                      {/* Sub-section C: Invoices List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase text-foreground tracking-wider">
                          Patient Invoice History
                        </h4>
                        
                        {loadingInvoices ? (
                          <SkeletonLoader variant="invoices" />
                        ) : invoices.length > 0 ? (
                          <div className="space-y-2">
                            {invoices.map((inv) => (
                              <div key={inv.id} className="rounded-xl border border-border bg-card p-3 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-bold text-foreground">Inv #{inv.id.slice(0, 8)}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">{inv.createdAt} • {inv.reason}</p>
                                  <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border mt-1 ${
                                    inv.status === 'PAID'
                                      ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
                                      : 'bg-amber-500/5 text-amber-600 border-amber-500/20'
                                  }`}>
                                    {inv.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <p className="font-black text-foreground">₹{inv.amount}</p>
                                    {inv.status !== 'PAID' && (
                                      <button
                                        onClick={() => {
                                          setSelectedInvoiceForPayment(inv.id);
                                          setPaymentAmount(inv.amount - inv.paidAmount);
                                        }}
                                        className="text-[9px] text-primary font-bold hover:underline block mt-0.5"
                                      >
                                        Log Pay
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setActiveInvoice(inv)}
                                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary"
                                    title="View Printable Receipt"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No invoices exist for this patient.</p>
                        )}
                      </div>

                    </div>
                  ) : (
                    
                    /* Mode 2: Global Clinic Invoices Ledger Overview */
                    <div className="space-y-4">
                      {/* Filter Toggle Chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'ALL', label: 'All Invoices' },
                          { id: 'PAID', label: 'Paid' },
                          { id: 'UNPAID', label: 'Unpaid' },
                          { id: 'PARTIALLY_PAID', label: 'Partial' }
                        ].map((chip) => (
                          <button
                            key={chip.id}
                            onClick={() => setBillingFilter(chip.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              billingFilter === chip.id
                                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                : 'bg-card border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

                      {loadingInvoices ? (
                        <SkeletonLoader variant="invoices" />
                      ) : (
                        <div className="space-y-2">
                          {invoices
                            .filter(inv => billingFilter === 'ALL' || inv.status === billingFilter)
                            .map((inv) => (
                              <div key={inv.id} className="rounded-xl border border-border bg-card p-3.5 flex justify-between items-center text-xs hover:border-primary/20 transition-all duration-300">
                                <div>
                                  <p className="font-extrabold text-foreground">{inv.patientName}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">ID: #{inv.id.slice(0, 8)} • Date: {inv.createdAt}</p>
                                  <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border mt-1.5 ${
                                    inv.status === 'PAID'
                                      ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
                                      : 'bg-amber-500/5 text-amber-600 border-amber-500/20'
                                  }`}>
                                    {inv.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <p className="font-black text-foreground">₹{inv.amount}</p>
                                    <p className="text-[10px] text-muted-foreground">Paid: ₹{inv.paidAmount}</p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedPatient({
                                        profileId: inv.patientProfileId,
                                        name: inv.patientName,
                                        id: inv.patientId,
                                        phone: 'Billed Record'
                                      });
                                      setActiveInvoice(inv);
                                    }}
                                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-primary transition-colors"
                                    title="View Receipt"
                                  >
                                    <Printer className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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

      {/* BRANDED PRINTABLE INVOICE MODAL (PDF-Ready layout!) */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 text-left space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black tracking-tighter">
                  C
                </div>
                <span className="text-lg font-black tracking-tight text-foreground font-sans">Cosmediq</span>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <h4 className="font-bold text-foreground">Cosmediq HSR Layout</h4>
                <p>Sector 3, Bengaluru, KA 560102</p>
                <p>Phone: +91 80 4930 2930</p>
                <p className="font-black text-primary uppercase mt-1">ISO 9001 Certified</p>
              </div>
            </div>

            <hr className="border-border/80" />

            <div className="text-center">
              <h2 className="text-xl font-extrabold tracking-tight text-foreground uppercase">CLINIC TAX INVOICE</h2>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Invoice ID: #{activeInvoice.id}</p>
            </div>

            {/* Patient & Doctor metadata grid */}
            <div className="grid grid-cols-2 gap-6 text-xs border border-border rounded-xl p-4 bg-muted/10">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Billed To (Patient)</p>
                <p className="font-bold text-foreground">{selectedPatient?.name || activeInvoice.patientName}</p>
                <p className="text-muted-foreground">Phone: {selectedPatient?.phone || 'Billed Profile'}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Consulting specialist</p>
                <p className="font-bold text-primary">{activeInvoice.doctorName}</p>
                <p className="text-muted-foreground">Target: {activeInvoice.reason}</p>
                <p className="text-muted-foreground">Date: {activeInvoice.createdAt}</p>
              </div>
            </div>

            {/* Branded Itemized table breakdown */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground font-bold">
                    <th className="p-3">Dermatological Treatment / Procedure Service</th>
                    <th className="p-3 text-right">Total Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-foreground font-medium">
                  {activeInvoice.items && activeInvoice.items.length > 0 ? (
                    activeInvoice.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold">{item.name}</td>
                        <td className="p-3 text-right font-bold">₹{item.price}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-semibold">Standard Dermatology Consultation Fee</td>
                      <td className="p-3 text-right font-bold">₹{activeInvoice.amount}</td>
                    </tr>
                  )}
                  <tr className="bg-muted/30 border-t border-border font-bold">
                    <td className="p-3 text-right text-muted-foreground uppercase font-black tracking-wide">Invoice Total</td>
                    <td className="p-3 text-right text-foreground font-black text-sm">₹{activeInvoice.amount}</td>
                  </tr>
                  <tr className="bg-emerald-500/5 text-emerald-600 font-bold">
                    <td className="p-3 text-right text-emerald-600 uppercase font-black tracking-wide">Paid Amount manually</td>
                    <td className="p-3 text-right font-black">₹{activeInvoice.paidAmount}</td>
                  </tr>
                  <tr className="bg-muted/10 font-bold">
                    <td className="p-3 text-right text-muted-foreground uppercase font-black tracking-wide">Payment Status</td>
                    <td className="p-3 text-right text-foreground uppercase tracking-wider font-extrabold">{activeInvoice.status}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom info & close */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>This document is digitally signed by Cosmediq EHR systems.</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  type="button"
                  className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </button>
                <button
                  onClick={() => {
                    setActiveInvoice(null);
                    setSelectedInvoiceForPayment(null);
                  }}
                  type="button"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
