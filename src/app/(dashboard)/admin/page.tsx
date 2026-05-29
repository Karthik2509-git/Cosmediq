'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { fetchClinicAnalyticsAction } from '@/app/actions/analytics';
import { 
  Users, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Loader2, 
  Activity, 
  TrendingUp, 
  UserCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [metrics, setMetrics] = useState<any>({ patientCount: 0, totalRevenue: 0, appointmentsCount: 0 });
  const [charts, setCharts] = useState<any>({ dailyPatients: [], monthlyRevenue: [], doctorLoad: [], patientSplit: [] });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // 1. SSR Protection
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Fetch data
  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const res = await fetchClinicAnalyticsAction();
      if (res.success) {
        if (res.metrics) setMetrics(res.metrics);
        if (res.charts) setCharts(res.charts);
        if (res.recentLogs) setRecentLogs(res.recentLogs);
      }
      setLoading(false);
    }
    loadAnalytics();
  }, []);

  const COLORS = ['#0d9488', '#0f766e', '#14b8a6', '#5eead4'];

  return (
    <div className="space-y-8 text-left">
      
      {/* HEADER HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-sans">
            Executive Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time operations, analytical growth charts, and clinical compliance records.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
          <ShieldCheck className="h-4.5 w-4.5" />
          <span>ISO 9001 Audited</span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col justify-center items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-semibold">Consolidating real-time clinic ledgers...</p>
        </div>
      ) : (
        <>
          {/* 1. CORE CLIENT METRICS HUD */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* New Patient Count */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  New Patient Count
                </span>
                <Users className="h-4.5 w-4.5 text-primary" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-foreground">{metrics.patientCount} Registered</p>
            </div>

            {/* Revenue Generated */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Revenue Generated
                </span>
                <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-foreground">₹{metrics.totalRevenue.toLocaleString()}</p>
            </div>

            {/* Clinic Appointments */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Total Appointments
                </span>
                <Calendar className="h-4.5 w-4.5 text-secondary" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-foreground">{metrics.appointmentsCount} Total</p>
            </div>

            {/* Follow-up Rate */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-2 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  Compliance Rate
                </span>
                <UserCheck className="h-4.5 w-4.5 text-teal-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-foreground">84% Follow-Up</p>
            </div>
          </div>

          {/* 2. RECHARTS CLINICAL CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Monthly Clinic Revenue (Area Chart with clean teals gradient) */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm text-left">
              <div>
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Monthly Clinic Growth
                </h3>
                <p className="text-[11px] text-muted-foreground">Cumulative billed items and manual collection totals.</p>
              </div>
              <div className="h-64 w-full">
                {!isMounted ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Initializing graphics engine...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                        labelStyle={{ fontSize: 11, fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                        itemStyle={{ fontSize: 11, color: '#0d9488' }}
                      />
                      <Area type="monotone" dataKey="amount" name="Revenue (₹)" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Daily Patient Load (Clean Bar Chart) */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm text-left">
              <div>
                <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" />
                  Daily Patient Count
                </h3>
                <p className="text-[11px] text-muted-foreground">Dermatology clinical walk-ins and slot appointments.</p>
              </div>
              <div className="h-64 w-full">
                {!isMounted ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Initializing graphics engine...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.dailyPatients} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                        labelStyle={{ fontSize: 11, fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                        itemStyle={{ fontSize: 11, color: '#0f766e' }}
                      />
                      <Bar dataKey="count" name="Patients" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Returning Patients (Donut Chart) */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm text-left">
              <div>
                <h4 className="text-sm font-black text-foreground">Demographic Splits</h4>
                <p className="text-[11px] text-muted-foreground">New vs. Returning skincare patient ratios.</p>
              </div>
              <div className="h-56 w-full flex items-center justify-center">
                {!isMounted ? (
                  <div className="text-xs text-muted-foreground">Initializing donut split...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.patientSplit}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {charts.patientSplit.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                        itemStyle={{ fontSize: 11 }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Doctor Load Split (Pie Chart) */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm text-left">
              <div>
                <h4 className="text-sm font-black text-foreground">Doctor-wise Appointments</h4>
                <p className="text-[11px] text-muted-foreground">Live clinical consultation loads distributed per specialist.</p>
              </div>
              <div className="h-56 w-full flex items-center justify-center">
                {!isMounted ? (
                  <div className="text-xs text-muted-foreground">Initializing load split...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.doctorLoad}
                        innerRadius={0}
                        outerRadius={70}
                        dataKey="load"
                        nameKey="name"
                        labelLine={false}
                        label={({ name, percent }) => `${((name as string) || '').split(' ')[1] || 'Doctor'} ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {charts.doctorLoad.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px' }}
                        itemStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* 3. HUMAN READABLE COMPLIANCE AUDIT TIMELINE */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm text-left">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Live System Audit Trail
              </h3>
              <p className="text-xs text-muted-foreground">
                Verified compliance logs recording user creations, billing updates, and digital health file indexing.
              </p>
            </div>
            
            {recentLogs.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                      <th className="p-3">Logged Date/Time</th>
                      <th className="p-3">Authorized operator</th>
                      <th className="p-3">Clinic action</th>
                      <th className="p-3">Patient / details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs text-foreground font-medium">
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 text-muted-foreground font-bold whitespace-nowrap">{log.timeString}</td>
                        <td className="p-3 font-extrabold text-foreground whitespace-nowrap">{log.operatorName}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground font-bold truncate max-w-[250px]" title={log.details}>
                          {log.details || 'System Core Update'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No administrative activity logs captured today.
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
