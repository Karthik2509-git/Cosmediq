'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { fetchPatientProfileByUserId } from '@/app/actions/patient';
import { bookAppointmentAction } from '@/app/actions/appointment';
import { fetchPatientHistoryAction } from '@/app/actions/consultation';
import { fetchInvoicesAction } from '@/app/actions/billing';
import { fetchPatientRecordsAction, uploadMedicalRecordAction } from '@/app/actions/records';
import { fetchDoctorsAction } from '@/app/actions/doctor';
import { PatientHistoryTimeline } from '@/components/dashboard/PatientHistoryTimeline';
import { TreatmentProgressTracker } from '@/components/dashboard/TreatmentProgressTracker';
import { SkeletonLoader } from '@/components/dashboard/SkeletonLoader';
import { PremiumEmptyState } from '@/components/dashboard/PremiumEmptyState';
import { 
  Logo 
} from '@/components/shared/Logo';
import { 
  Heart, 
  Calendar, 
  ClipboardList, 
  Pill, 
  CreditCard, 
  UploadCloud, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { AppointmentStatus } from '@prisma/client';

export default function PatientPortal() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Active state management
  const [profile, setProfile] = useState<any | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Chat / contact clinic state (persisted in localStorage)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'patient' | 'staff' | 'doctor'; text: string; time: string }>>([
    { sender: 'staff', text: "Hello! Sarah here from the HSR Layout Reception Desk. Let me know if you have questions about your skincare recovery or scheduled visits.", time: "10:30 AM" }
  ]);
  const [newChatText, setNewChatText] = useState('');

  // Active console tab
  // 'overview' | 'appointments' | 'medical' | 'billing'
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'medical' | 'billing'>('overview');

  // Form states
  const [requestForm, setRequestForm] = useState({
    doctorId: '',
    dateTime: '',
    reason: 'Routine skin analysis check',
  });

  const [uploadForm, setUploadForm] = useState({
    fileName: '',
    fileType: 'PDF',
    description: '',
    fileUrl: '/mock/scans/skin_barrier_test.pdf',
    fileSize: 1024 * 1024 * 2, // 2MB mock
  });

  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setUploadForm(prev => ({
        ...prev,
        fileName: prev.fileName || file.name.replace(/\.[^/.]+$/, ""),
        fileSize: file.size,
        fileUrl: `/mock/scans/${file.name}`
      }));
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') {
        setUploadForm(prev => ({ ...prev, fileType: 'PDF' }));
      } else if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
        setUploadForm(prev => ({ ...prev, fileType: 'IMAGE' }));
      }
    }
  };


  // Invoice visual Modal
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);

  // 1. Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      setLoading(true);
      
      const pRes = await fetchPatientProfileByUserId(userId);
      const dRes = await fetchDoctorsAction();
      
      if (pRes.success && pRes.profile) {
        const prof = pRes.profile;
        setProfile(prof);
        
        // Fetch histories, invoices, and uploads
        const hRes = await fetchPatientHistoryAction(prof.id);
        const iRes = await fetchInvoicesAction(prof.id);
        const rRes = await fetchPatientRecordsAction(prof.id);
        
        if (hRes.success && hRes.history) setPatientHistory(hRes.history);
        if (iRes.success && iRes.invoices) setInvoices(iRes.invoices);
        if (rRes.success && rRes.records) setRecords(rRes.records);

        // Load chat history from localStorage if exists
        const cachedChat = localStorage.getItem(`cosmediq_chat_${userId}`);
        if (cachedChat) {
          try {
            setChatMessages(JSON.parse(cachedChat));
          } catch (e) {
            console.error('Failed to parse cached chat', e);
          }
        }
      }
      
      if (dRes.success && dRes.doctors) {
        setDoctors(dRes.doctors);
        if (dRes.doctors.length > 0) {
          setRequestForm(prev => ({ ...prev, doctorId: dRes.doctors[0].profileId }));
        }
      }
      setLoading(false);
    }
    loadData();
  }, [userId]);

  // 2. Submit Callback / Visit slot request
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Save appointment request (sends with REQUESTED status which matches receptionist triage rule!)
    const res = await bookAppointmentAction({
      patientProfileId: profile.id,
      doctorProfileId: requestForm.doctorId,
      dateTime: requestForm.dateTime,
      reason: `[Patient requested via Portal]: ${requestForm.reason}`,
      operatorId: userId,
    });

    if (res.success) {
      setSuccessMsg('Appointment callback request successfully submitted. Sarah the receptionist will call you within 2 hours to confirm your scheduled slot.');
      setRequestForm({
        doctorId: doctors[0]?.profileId || '',
        dateTime: '',
        reason: 'Routine skin analysis check',
      });
      // Set appointment status to requested locally
      if (res.appointment) {
        const updatedAppt = {
          id: res.appointment.id,
          dateTime: res.appointment.dateTime,
          status: AppointmentStatus.REQUESTED,
          reason: res.appointment.reason,
          doctor: { user: { name: doctors.find(d => d.profileId === requestForm.doctorId)?.name || 'Dermatologist' } }
        };
      }
      // Optimistic queue reload (simulated inside profile load)
      const hRes = await fetchPatientHistoryAction(profile.id);
      if (hRes.success && hRes.history) {
        setPatientHistory(hRes.history);
      }
    } else {
      setErrorMsg(res.error || 'Failed to submit request.');
    }
    setActionLoading(false);
  };

  // 3. Submit Medical scan upload locally (MVP sandbox!)
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFileName) {
      setErrorMsg('Please select a scan or PDF file first.');
      setActionLoading(false);
      return;
    }

    const res = await uploadMedicalRecordAction({
      patientProfileId: profile.id,
      fileName: uploadForm.fileName,
      fileUrl: uploadForm.fileUrl,
      fileType: uploadForm.fileType,
      fileSize: uploadForm.fileSize,
      description: uploadForm.description,
      operatorId: userId,
    });

    if (res.success) {
      setSuccessMsg(`Medical record "${uploadForm.fileName}" successfully uploaded & indexed to your chart.`);
      setUploadForm({
        fileName: '',
        fileType: 'PDF',
        description: '',
        fileUrl: '/mock/scans/skin_barrier_test.pdf',
        fileSize: 1024 * 1024 * 2,
      });
      setSelectedFileName('');
      // Reload uploads list
      const rRes = await fetchPatientRecordsAction(profile.id);
      if (rRes.success && rRes.records) {
        setRecords(rRes.records);
      }
    } else {
      setErrorMsg(res.error || 'Failed to upload report.');
    }
    setActionLoading(false);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !userId) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'patient' as const, text: newChatText.trim(), time: timeStr };
    
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    localStorage.setItem(`cosmediq_chat_${userId}`, JSON.stringify(updated));
    setNewChatText('');

    // Simulate comforting response
    setTimeout(() => {
      const responseMsg = {
        sender: 'staff' as const,
        text: "Thank you for reaching out. We have logged your clinical query in our patient dashboard. Sarah the receptionist or your consulting doctor will message or call you back shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const finalChat = [...updated, responseMsg];
      setChatMessages(finalChat);
      localStorage.setItem(`cosmediq_chat_${userId}`, JSON.stringify(finalChat));
    }, 1200);
  };


  // Calculations
  const invoicesPaid = invoices.filter(i => i.status === 'PAID');
  const invoicesPending = invoices.filter(i => i.status === 'UNPAID' || i.status === 'PARTIALLY_PAID');
  
  const totalPaidSum = invoicesPaid.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const totalPendingSum = invoicesPending.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. HEALTH HUB WELCOME BANNER (Visual WOW premium quotes!) */}
      <section className="rounded-3xl bg-gradient-to-tr from-primary/10 via-secondary/15 to-transparent border border-primary/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 flex-1 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Heart className="h-4 w-4 fill-current text-primary animate-pulse" />
            Empowering Your Healing Progress
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-sans">
            Welcome Back, {session?.user?.name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl italic">
            "Your progress matters. Stay consistent with your treatment, apply your lipid barriers carefully, and remember that every step forward counts."
          </p>
        </div>
        
        {/* Vital stats badges */}
        {profile && (
          <div className="flex gap-4 shrink-0 bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-xs">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Physiology</p>
              <p className="font-bold text-foreground mt-0.5">Blood: {profile.bloodGroup || 'Unspecified'}</p>
              <p className="text-muted-foreground mt-0.5">Gender: {profile.gender}</p>
            </div>
            <div className="h-10 w-[1px] bg-border" />
            <div className="text-xs">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Care Facility</p>
              <p className="font-bold text-primary mt-0.5">HSR Layout Branch</p>
              <p className="text-muted-foreground mt-0.5">ISO 9001 Facility</p>
            </div>
          </div>
        )}
      </section>

      {errorMsg && (
        <div className="rounded-xl border border-destructive/10 bg-destructive/5 p-4 flex gap-3 text-sm text-destructive items-center">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex gap-3 text-sm text-emerald-600 dark:text-emerald-400 items-center animate-bounce">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. PORTAL TABS SELECTION */}
      <section className="flex flex-wrap gap-2 border-b border-border pb-4">
        {[
          { id: 'overview', label: '1. Health Overview', icon: Heart },
          { id: 'appointments', label: '2. Visist & Requests', icon: Calendar },
          { id: 'medical', label: '3. Prescriptions & Scans', icon: Pill },
          { id: 'billing', label: '4. Financial & Invoices', icon: CreditCard }
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

      {/* 3. DYNAMIC CONTENT SURFACE */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT TWO-THIRDS CONTAINER */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <SkeletonLoader variant="card" />
                <SkeletonLoader variant="card" />
              </div>
              <SkeletonLoader variant="chart" />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW PANEL */}
              {activeTab === 'overview' && (
                <div className="space-y-6 text-left">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Therapies Completed</p>
                      <p className="text-2xl font-black text-foreground">{patientHistory.length} Care Visits</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wide">Medical Scans</p>
                      <p className="text-2xl font-black text-foreground">{records.length} Reports</p>
                    </div>
                  </div>

                  {/* Active treatment checklist timeline */}
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-foreground">Active Dermatology Care Track</h3>
                    <hr className="border-border/60" />
                    <TreatmentProgressTracker 
                      queueStatus="WAITING" 
                      status={patientHistory.length > 0 ? 'COMPLETED' : 'CONFIRMED'} 
                    />
                  </div>

                  {/* Encouraging advice block */}
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6 space-y-2">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                      <ShieldCheck className="h-5 w-5" />
                      Patient Compliance Guidelines
                    </h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Our clinical records indicate you are following active acne and barrier restoration treatments. Apply sun protection (SPF 50) every 4 hours, drink at least 3 liters of water daily, and avoid structural exfoliation chemical scrubbing.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: VISIT DETAILS & REQUEST FORM */}
              {activeTab === 'appointments' && (
                <div className="space-y-6 text-left">
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-5 w-5 text-primary" />
                      Active Visits & Scheduled Callback Statuses
                    </h3>
                    
                    {patientHistory.length === 0 ? (
                      <PremiumEmptyState variant="appointments" title="Your schedule is clear for now" description="No upcoming clinical visits scheduled yet. Request a callback on the right sidebar." />
                    ) : (
                      <div className="space-y-3">
                        {patientHistory.map((appt, idx) => (
                          <div key={idx} className="rounded-xl border border-border p-4 flex justify-between items-center bg-muted/10">
                            <div>
                              <p className="text-xs font-bold text-foreground">Dermatology Care Session</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Date: {appt.date} • Speciality: {appt.specialization}</p>
                              <p className="text-[10px] text-primary font-bold mt-1">Diagnosis: {appt.diagnosis}</p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/5 border border-emerald-500/15 px-2 py-0.5 rounded uppercase">
                              Completed
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MEDICAL HISTORY TIMELINE & SCAN REVIEWS */}
              {activeTab === 'medical' && (
                <div className="space-y-6 text-left">
                  {/* Patient History Timeline */}
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <Pill className="h-5 w-5 text-primary" />
                      Your Chronological Skincare Timeline
                    </h3>
                    <hr className="border-border/60" />
                    <PatientHistoryTimeline history={patientHistory} />
                  </div>
                  
                  {/* Uploaded Scans review */}
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <UploadCloud className="h-5 w-5 text-primary" />
                      Physiology Scans & Uploaded PDF Reports
                    </h3>
                    
                    {records.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {records.map((rec) => (
                          <div key={rec.id} className="rounded-xl border border-border bg-muted/10 p-4 space-y-2 hover:border-primary/20 transition-colors">
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-black text-foreground truncate max-w-[150px]">{rec.fileName}</h4>
                              <span className="text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase">
                                {rec.fileType}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{rec.description}</p>
                            <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t border-border/50 pt-2">
                              <span>Uploaded: {rec.uploadedAt}</span>
                              <span className="font-bold text-foreground">Size: 2.1MB</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <PremiumEmptyState variant="reports" />
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: BILLING HISTORY & MANUAL INVOICES */}
              {activeTab === 'billing' && (
                <div className="space-y-6 text-left">
                  <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <CreditCard className="h-5 w-5 text-primary" />
                      Financial & Invoice Ledgers
                    </h3>
                    <hr className="border-border/60" />

                    {invoices.length > 0 ? (
                      <div className="divide-y divide-border/60">
                        {invoices.map((inv) => (
                          <div key={inv.id} className="py-3.5 flex justify-between items-center gap-4 hover:bg-muted/10 px-2 rounded-xl transition-colors">
                            <div>
                              <p className="text-xs font-bold text-foreground">Invoice #{inv.id.slice(0, 8)}</p>
                              <p className="text-[10px] text-muted-foreground">Date: {inv.createdAt} • Target: {inv.reason}</p>
                              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">Method: {inv.paymentMethod}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right text-xs">
                                <p className="font-black text-foreground">₹{inv.amount}</p>
                                <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded border mt-1 ${
                                  inv.status === 'PAID'
                                    ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20'
                                    : 'bg-amber-500/5 text-amber-600 border-amber-500/20'
                                }`}>
                                  {inv.status}
                                </span>
                              </div>
                              <button
                                onClick={() => setActiveInvoice(inv)}
                                type="button"
                                className="rounded-lg border border-border bg-card p-2 text-muted-foreground hover:text-primary transition-colors"
                                title="Print Invoice"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <PremiumEmptyState variant="general" title="No billing ledgers found" description="No generated invoices or itemized transaction details found today." />
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR PANEL */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* REQUEST CALLBACK FORM PANEL */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-md text-left space-y-4">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              Request Visit Callback
            </h3>
            
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Preferred Specialist</label>
                <select
                  value={requestForm.doctorId}
                  onChange={(e) => setRequestForm({ ...requestForm, doctorId: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {doctors.map(d => (
                    <option key={d.profileId} value={d.profileId}>{d.name} ({d.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Preferred Date & Time</label>
                <input
                  required
                  type="datetime-local"
                  value={requestForm.dateTime}
                  onChange={(e) => setRequestForm({ ...requestForm, dateTime: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Reason for request</label>
                <input
                  required
                  type="text"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Flare acne check"
                />
              </div>

              <button
                disabled={actionLoading}
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Callback Request'}
              </button>
            </form>
          </div>

          {/* SECURE MEDICAL SCAN UPLOAD PANEL */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-md text-left space-y-4">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <UploadCloud className="h-4.5 w-4.5 text-primary" />
              Upload Medical scan / PDF
            </h3>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* FILE SELECTOR BOX */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Select File</label>
                <div 
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                  className="w-full border-2 border-dashed border-border/85 rounded-2xl bg-muted/20 p-4 text-center cursor-pointer hover:bg-muted/40 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-1.5"
                >
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[11px] text-foreground font-semibold truncate max-w-full px-2">
                    {selectedFileName || 'Click to select report or scan'}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    PDF, JPEG, or PNG up to 10MB
                  </span>
                </div>
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Document Title</label>
                <input
                  required
                  type="text"
                  value={uploadForm.fileName}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Skin scan barrier test"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Document Category</label>
                <select
                  value={uploadForm.fileType}
                  onChange={(e) => setUploadForm({ ...uploadForm, fileType: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>PDF</option>
                  <option>SCAN</option>
                  <option>IMAGE</option>
                  <option>PRESCRIPTION</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-foreground uppercase tracking-wider block">Short Description</label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Skincare notes about the report..."
                />
              </div>


              <button
                disabled={actionLoading}
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary py-2.5 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Record Upload'}
              </button>
            </form>
          </div>

          {/* SECURE CLINIC CHAT / CONTACT PANEL */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-md text-left space-y-4">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
              <Heart className="h-4.5 w-4.5 text-primary" />
              Chat / Contact Clinic
            </h3>

            {/* Message History Logs */}
            <div className="rounded-2xl border border-border bg-muted/5 p-3 space-y-3 h-[180px] overflow-y-auto pr-1 flex flex-col justify-start">
              {chatMessages.map((msg, idx) => {
                const isPatient = msg.sender === 'patient';
                return (
                  <div key={idx} className={`max-w-[85%] rounded-2xl p-2.5 text-xs space-y-1 ${
                    isPatient 
                      ? 'bg-primary text-primary-foreground self-end rounded-tr-none' 
                      : 'bg-muted/10 border border-border text-foreground self-start rounded-tl-none'
                  }`}>
                    <p className="leading-relaxed font-semibold">{msg.text}</p>
                    <div className="flex justify-between items-center text-[8px] opacity-75 font-bold">
                      <span className="capitalize">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Send Form */}
            <form onSubmit={handleSendChatMessage} className="flex gap-1.5">
              <input
                required
                type="text"
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Ask Sarah or doctor a query..."
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/95 transition-all cursor-pointer animate-pulse"
              >
                Send
              </button>
            </form>
          </div>

        </div>

      </section>

      {/* BRANDED PRINTABLE INVOICE MODAL (PDF-Ready layout!) */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 text-left space-y-6">
            
            {/* Header info */}
            <div className="flex justify-between items-start gap-4">
              <Logo />
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
                <p className="font-bold text-foreground">{activeInvoice.patientName}</p>
                <p className="text-muted-foreground">ID: {activeInvoice.patientId.slice(0, 8)}</p>
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
                  {activeInvoice.items.length > 0 ? (
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
                  onClick={() => setActiveInvoice(null)}
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
