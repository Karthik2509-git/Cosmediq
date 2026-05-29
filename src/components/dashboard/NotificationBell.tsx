'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  fetchNotificationsAction, 
  markNotificationReadAction, 
  markAllNotificationsReadAction, 
  triggerSmartRemindersAction 
} from '@/app/actions/notification';
import { 
  Bell, 
  Calendar, 
  CreditCard, 
  UserX, 
  Volume2, 
  ShieldCheck, 
  Loader2, 
  Smile, 
  CheckCheck,
  CheckCircle2
} from 'lucide-react';

export function NotificationBell() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'appointment' | 'payment' | 'announcement'>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load and trigger notifications
  const loadNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    // 1. Scan and trigger smart reminders dynamically (provides real-time alerts!)
    await triggerSmartRemindersAction(userId);
    // 2. Fetch the newly consolidated alerts
    const res = await fetchNotificationsAction(userId);
    if (res.success && res.notifications) {
      setNotifications(res.notifications);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      loadNotifications();
      // Periodically scan for reminders every 60s
      const timer = setInterval(() => {
        loadNotifications();
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [userId]);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await markNotificationReadAction(id);
    if (res.success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (!userId) return;
    const res = await markAllNotificationsReadAction(userId);
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filter alerts by selected category
  const filteredAlerts = notifications.filter(n => {
    if (activeCategory === 'ALL') return true;
    return n.category === activeCategory || (activeCategory === 'announcement' && n.category === 'doctor-leave');
  });

  // Chronological Grouping: Today vs Earlier
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAlerts = filteredAlerts.filter(n => n.createdAt.split('T')[0] === todayStr);
  const earlierAlerts = filteredAlerts.filter(n => n.createdAt.split('T')[0] !== todayStr);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="h-4 w-4 text-primary shrink-0" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'doctor-leave':
        return <UserX className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'follow-up':
        return <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />;
      default:
        return <Volume2 className="h-4 w-4 text-secondary shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* BELL TRIGGER BUTTON (Accessibility optimized!) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
        aria-label="View In-App Notifications"
        title="Notification Center"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-teal-500 ring-2 ring-background animate-pulse" />
        )}
      </button>

      {/* DISSOLVING DROPDOWN PANEL (Healthcare premium teals aesthetic!) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 z-50 w-80 md:w-96 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="text-sm font-extrabold tracking-tight text-foreground">Notification Center</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread alerts pending` : "You're all caught up."}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                type="button"
                className="text-[10px] font-bold text-primary hover:text-primary/90 flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Quick Category filter chips */}
          <div className="flex gap-1 border-b border-border/40 py-2.5 overflow-x-auto select-none">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'appointment', label: 'Visits' },
              { id: 'payment', label: 'Payments' },
              { id: 'announcement', label: 'Guides' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-card border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notifications Scroll Surface */}
          <div className="max-h-72 overflow-y-auto pr-1 py-2 space-y-4 text-left">
            {loading ? (
              <div className="py-8 flex justify-center items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Checking medical updates...</span>
              </div>
            ) : filteredAlerts.length > 0 ? (
              <>
                {/* 1. TODAY'S ALERTS */}
                {todayAlerts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1">Today</p>
                    {todayAlerts.map(n => (
                      <div 
                        key={n.id} 
                        className={`group relative rounded-xl border p-3 flex gap-3 transition-all ${
                          n.isRead 
                            ? 'border-border bg-card' 
                            : 'border-primary/10 bg-primary/5 shadow-sm'
                        }`}
                      >
                        {getCategoryIcon(n.category)}
                        <div className="space-y-0.5 flex-1">
                          <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{n.message}</p>
                          <span className="text-[8px] text-muted-foreground font-bold block pt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="absolute top-2 right-2 text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 hover:underline transition-opacity"
                            title="Mark as Read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. EARLIER ALERTS */}
                {earlierAlerts.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest pl-1">Earlier</p>
                    {earlierAlerts.map(n => (
                      <div 
                        key={n.id} 
                        className={`group relative rounded-xl border p-3 flex gap-3 transition-all ${
                          n.isRead 
                            ? 'border-border bg-card' 
                            : 'border-primary/10 bg-primary/5 shadow-sm'
                        }`}
                      >
                        {getCategoryIcon(n.category)}
                        <div className="space-y-0.5 flex-1">
                          <h4 className="text-xs font-bold text-foreground">{n.title}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{n.message}</p>
                          <span className="text-[8px] text-muted-foreground font-bold block pt-1">
                            {n.createdAt.split('T')[0]}
                          </span>
                        </div>
                        {!n.isRead && (
                          <button
                            onClick={(e) => handleMarkRead(n.id, e)}
                            className="absolute top-2 right-2 text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 hover:underline transition-opacity"
                            title="Mark as Read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* PREMIUM HEALTHCARE EMPTY STATE */
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/5 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-foreground">You're all caught up</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] mx-auto leading-relaxed">
                    Wellness checks indicate no pending appointments, payment balances, or follow-ups today.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
