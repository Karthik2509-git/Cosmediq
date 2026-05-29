'use server';
import { db } from '@/lib/db';
import { AppointmentStatus, QueueStatus } from '@prisma/client';

export async function submitConsultationAction(data: {
  appointmentId: string;
  diagnosis: string;
  notes?: string;
  prescription: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  followUpDate?: string;
  operatorId?: string; // Doctor User ID
}) {
  try {
    const appointment = await db.appointment.findUnique({
      where: { id: data.appointmentId },
      include: {
        patient: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found.' };
    }

    const followUpParsed = data.followUpDate ? new Date(data.followUpDate) : null;

    // Run transaction to ensure atomicity
    const consultation = await db.$transaction(async (tx) => {
      // 1. Create Consultation
      const consult = await tx.consultation.create({
        data: {
          appointmentId: data.appointmentId,
          diagnosis: data.diagnosis,
          notes: data.notes || null,
          prescription: data.prescription as any,
          followUpDate: followUpParsed,
        },
      });

      // 2. Update Appointment to completed
      await tx.appointment.update({
        where: { id: data.appointmentId },
        data: {
          status: AppointmentStatus.COMPLETED,
          queueStatus: QueueStatus.DONE,
        },
      });

      // 3. Update Patient medical history notes
      const existingHistory = appointment.patient.medicalHistory || '';
      const dateString = new Date().toISOString().split('T')[0];
      const newHistoryEntry = `\n[${dateString} - Consult by ${appointment.doctor.user.name}]:\n- Diagnosis: ${data.diagnosis}\n- Skincare notes: ${data.notes || 'None'}\n`;
      
      await tx.patientProfile.update({
        where: { id: appointment.patientId },
        data: {
          medicalHistory: existingHistory + newHistoryEntry,
        },
      });

      // 4. Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: data.operatorId || appointment.doctor.userId,
          action: 'CONSULTATION_SUBMIT',
          entityType: 'Consultation',
          entityId: consult.id,
          newValue: {
            diagnosis: data.diagnosis,
            hasPrescription: data.prescription.length > 0,
            followUpDate: data.followUpDate || 'None',
          },
        },
      });

      return consult;
    });

    return { success: true, consultation };
  } catch (error) {
    console.error('❌ Submit consultation action error:', error);
    return { success: false, error: 'Failed to record clinical consultation.' };
  }
}

export async function fetchPatientHistoryAction(patientProfileId: string) {
  try {
    const appointments = await db.appointment.findMany({
      where: {
        patientId: patientProfileId,
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
        consultation: true,
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    const history = appointments.map((appt) => {
      const consult = appt.consultation;
      return {
        appointmentId: appt.id,
        date: appt.dateTime.toISOString().split('T')[0],
        doctorName: appt.doctor.user.name,
        specialization: appt.doctor.specialization,
        reason: appt.reason,
        diagnosis: consult ? consult.diagnosis : 'No clinical diagnosis recorded',
        notes: consult ? consult.notes : '',
        prescription: consult ? (consult.prescription as any[]) : [],
        followUpDate: consult && consult.followUpDate ? consult.followUpDate.toISOString().split('T')[0] : 'None',
      };
    });

    return { success: true, history };
  } catch (error) {
    console.error('❌ Fetch patient history action error:', error);
    return { success: false, error: 'Failed to query historical patient timelines.' };
  }
}
