'use server';
import { db } from '@/lib/db';
import { AppointmentStatus, QueueStatus } from '@prisma/client';

const DEFAULT_BRANCH_ID = 'default-branch-hsr-layout';

export async function bookAppointmentAction(data: {
  patientProfileId: string;
  doctorProfileId: string;
  dateTime: string;
  reason: string;
  notes?: string;
  operatorId?: string;
}) {
  try {
    const apptDate = new Date(data.dateTime);

    // 1. Calculate the daily sequential queue token number for this doctor on this day
    const startOfDay = new Date(apptDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingCount = await db.appointment.count({
      where: {
        doctorId: data.doctorProfileId,
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const tokenNumber = `C-${(existingCount + 1).toString().padStart(2, '0')}`;

    // 2. Create the Appointment
    const appointment = await db.appointment.create({
      data: {
        dateTime: apptDate,
        status: AppointmentStatus.CONFIRMED,
        reason: data.reason,
        notes: data.notes || null,
        tokenNumber,
        queueStatus: QueueStatus.WAITING,
        branchId: DEFAULT_BRANCH_ID,
        patientId: data.patientProfileId,
        doctorId: data.doctorProfileId,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    // Write Audit Log
    await db.auditLog.create({
      data: {
        userId: data.operatorId || null,
        action: 'APPOINTMENT_BOOK',
        entityType: 'Appointment',
        entityId: appointment.id,
        newValue: {
          patientName: appointment.patient.user.name,
          doctorName: appointment.doctor.user.name,
          dateTime: appointment.dateTime.toISOString(),
          token: tokenNumber,
        },
      },
    });

    return { success: true, appointment };
  } catch (error) {
    console.error('❌ Book appointment action error:', error);
    return { success: false, error: 'Database booking failure.' };
  }
}

export async function updateQueueStatusAction(
  appointmentId: string,
  newQueueStatus: QueueStatus,
  operatorId?: string
) {
  try {
    const currentAppointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!currentAppointment) {
      return { success: false, error: 'Appointment not found.' };
    }

    const isCompleting = newQueueStatus === QueueStatus.DONE;

    const appointment = await db.$transaction(async (tx) => {
      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          queueStatus: newQueueStatus,
          status: isCompleting ? AppointmentStatus.COMPLETED : undefined,
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: operatorId || null,
          action: isCompleting ? 'APPOINTMENT_COMPLETE' : 'QUEUE_STATUS_CHANGE',
          entityType: 'Appointment',
          entityId: appointmentId,
          oldValue: { queueStatus: currentAppointment.queueStatus, status: currentAppointment.status },
          newValue: { queueStatus: newQueueStatus, status: updated.status },
        },
      });

      return updated;
    });

    return { success: true, appointment };
  } catch (error) {
    console.error('❌ Update queue status action error:', error);
    return { success: false, error: 'Failed to update clinical queue.' };
  }
}

export async function fetchTodayQueueAction() {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await db.appointment.findMany({
      where: {
        dateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
    });

    return { success: true, queue: appointments };
  } catch (error) {
    console.error('❌ Fetch today queue action error:', error);
    return { success: false, error: 'Database queue fetch failure.' };
  }
}
