'use server';
import { db } from '@/lib/db';
import { NotificationChannel } from '@prisma/client';

export async function fetchNotificationsAction(userId?: string) {
  try {
    if (!userId) return { success: true, notifications: [] };

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      category: n.category,
      channel: n.channel,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));

    return { success: true, notifications: parsed };
  } catch (error) {
    console.error('❌ Fetch notifications action error:', error);
    return { success: false, error: 'Database notifications query failure.' };
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const notification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return { success: true, notification };
  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    return { success: false, error: 'Failed to update notification status.' };
  }
}

export async function markAllNotificationsReadAction(userId: string) {
  try {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Mark all notifications read error:', error);
    return { success: false, error: 'Failed to update notifications ledger.' };
  }
}

export async function createNotificationAction(data: {
  userId: string;
  title: string;
  message: string;
  category: string; // "appointment", "follow-up", "payment", "doctor-leave", "announcement"
  channel?: NotificationChannel;
  entityId?: string;
  dateKey?: string;
}) {
  try {
    const category = data.category || 'announcement';
    const channel = data.channel || NotificationChannel.IN_APP;

    // 1. Strict Duplicate Prevention Logic
    if (data.entityId) {
      const existing = await db.notification.findFirst({
        where: {
          userId: data.userId,
          category,
          entityId: data.entityId,
          dateKey: data.dateKey || null,
        },
      });

      if (existing) {
        // Avoid duplicate spam
        return { success: true, duplicate: true, notification: existing };
      }
    }

    // Mock Future-ready channels dispatches!
    if (channel === NotificationChannel.EMAIL) {
      console.log(`✉️ [SMTP Dispatch Queue] To: ${data.userId} | ${data.title} - ${data.message}`);
    } else if (channel === NotificationChannel.SMS) {
      console.log(`📱 [SMS Gateway Dispatch] To: ${data.userId} | ${data.title} - ${data.message}`);
    } else if (channel === NotificationChannel.WHATSAPP) {
      console.log(`🟢 [WhatsApp Business Dispatch] To: ${data.userId} | ${data.title} - ${data.message}`);
    }

    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        category,
        channel,
        entityId: data.entityId || null,
        dateKey: data.dateKey || null,
      },
    });

    return { success: true, notification };
  } catch (error) {
    console.error('❌ Create notification error:', error);
    return { success: false, error: 'Database notification creation failure.' };
  }
}

export async function triggerSmartRemindersAction(userId: string) {
  try {
    // Fetch user context first
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
      },
    });

    if (!user) return { success: false, error: 'User not found.' };

    const todayStr = new Date().toISOString().split('T')[0];
    const createdCount = { count: 0 };

    // Mode A: Smart Reminders for patients
    if (user.role === 'PATIENT' && user.patientProfile) {
      const profile = user.patientProfile;

      // 1. Check upcoming appointments tomorrow (DateTime range tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const upcomingAppts = await db.appointment.findMany({
        where: {
          patientId: profile.id,
          dateTime: {
            gte: new Date(tomorrowStr + 'T00:00:00.000Z'),
            lt: new Date(tomorrowStr + 'T23:59:59.999Z'),
          },
        },
        include: {
          doctor: {
            include: { user: true },
          },
        },
      });

      for (const appt of upcomingAppts) {
        const time = appt.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const res = await createNotificationAction({
          userId,
          title: 'Upcoming Appointment Tomorrow',
          message: `Your dermatological care check is scheduled tomorrow at ${time} with ${appt.doctor.user.name}.`,
          category: 'appointment',
          channel: NotificationChannel.IN_APP,
          entityId: appt.id,
          dateKey: tomorrowStr,
        });
        if (res.success && !res.duplicate) createdCount.count++;
      }

      // 2. Check follow-ups in 2 days
      const inTwoDays = new Date();
      inTwoDays.setDate(inTwoDays.getDate() + 2);
      const inTwoDaysStr = inTwoDays.toISOString().split('T')[0];

      const dueFollowUps = await db.consultation.findMany({
        where: {
          appointment: { patientId: profile.id },
          followUpDate: {
            gte: new Date(inTwoDaysStr + 'T00:00:00.000Z'),
            lt: new Date(inTwoDaysStr + 'T23:59:59.999Z'),
          },
        },
        include: {
          appointment: {
            include: {
              doctor: { include: { user: true } },
            },
          },
        },
      });

      for (const consult of dueFollowUps) {
        const res = await createNotificationAction({
          userId,
          title: 'Follow-Up Skincare Due soon',
          message: `Your critical follow-up check is due in 2 days on ${inTwoDaysStr}. Please contact reception if you need to adjust this.`,
          category: 'follow-up',
          channel: NotificationChannel.IN_APP,
          entityId: consult.id,
          dateKey: inTwoDaysStr,
        });
        if (res.success && !res.duplicate) createdCount.count++;
      }

      // 3. Check pending invoices
      const pendingInvoices = await db.invoice.findMany({
        where: {
          patientId: profile.id,
          status: { not: 'PAID' },
        },
      });

      for (const inv of pendingInvoices) {
        const balance = inv.amount - inv.paidAmount;
        const res = await createNotificationAction({
          userId,
          title: 'Outstanding Invoice Balance',
          message: `Pending balance of ₹${balance} is outstanding for Invoice #${inv.id.slice(0, 8)}. Payments are loggable at the HSR desk.`,
          category: 'payment',
          channel: NotificationChannel.IN_APP,
          entityId: inv.id,
          dateKey: 'pending',
        });
        if (res.success && !res.duplicate) createdCount.count++;
      }
    }

    // Mode B: Smart Reminders for staff (e.g. Doctor Leave alerts)
    if (user.role === 'STAFF') {
      const unavailableDocs = await db.doctorProfile.findMany({
        where: { available: false },
        include: { user: true },
      });

      for (const doc of unavailableDocs) {
        const res = await createNotificationAction({
          userId,
          title: 'Doctor Status: Unavailable Today',
          message: `${doc.user.name} has toggled their availability status to OFF. Avoid scheduling walk-ins for this slot.`,
          category: 'doctor-leave',
          channel: NotificationChannel.IN_APP,
          entityId: doc.id,
          dateKey: todayStr,
        });
        if (res.success && !res.duplicate) createdCount.count++;
      }
    }

    // Mode C: Constant wellness guideline announcement (adds beautiful wow factor)
    await createNotificationAction({
      userId,
      title: 'Dermal Moisture Wellness Guide',
      message: 'Restore skincare radiance: apply lipid-rich barrier creams every 4 hours, and stay hydrated with 3L of water.',
      category: 'announcement',
      channel: NotificationChannel.IN_APP,
      entityId: 'wellness-remind',
      dateKey: todayStr,
    });

    return { success: true, triggeredCount: createdCount.count };
  } catch (error) {
    console.error('❌ Trigger smart reminders error:', error);
    return { success: false, error: 'Failed to process smart reminders.' };
  }
}
