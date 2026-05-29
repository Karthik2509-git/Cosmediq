'use server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';

export async function fetchDoctorsAction() {
  try {
    const doctors = await db.user.findMany({
      where: {
        role: Role.DOCTOR,
        isActive: true,
      },
      include: {
        doctorProfile: true,
      },
    });

    const parsed = doctors.map((doc) => ({
      id: doc.id,
      profileId: doc.doctorProfile?.id || '',
      name: doc.name,
      specialization: doc.doctorProfile?.specialization || 'Clinical Specialist',
      consultFee: doc.doctorProfile?.consultFee || 500,
      available: doc.doctorProfile?.available ?? true,
    }));

    return { success: true, doctors: parsed };
  } catch (error) {
    console.error('❌ Fetch doctors action error:', error);
    return { success: false, error: 'Database doctor fetch failure.' };
  }
}

export async function toggleDoctorAvailabilityAction(
  doctorProfileId: string,
  available: boolean,
  operatorId?: string
) {
  try {
    const updatedProfile = await db.doctorProfile.update({
      where: { id: doctorProfileId },
      data: { available },
      include: {
        user: true,
      },
    });

    // Write Audit Log
    await db.auditLog.create({
      data: {
        userId: operatorId || updatedProfile.userId,
        action: 'DOCTOR_AVAILABILITY_CHANGE',
        entityType: 'DoctorProfile',
        entityId: doctorProfileId,
        newValue: { available, doctorName: updatedProfile.user.name },
      },
    });

    return { success: true, available: updatedProfile.available };
  } catch (error) {
    console.error('❌ Toggle doctor availability action error:', error);
    return { success: false, error: 'Failed to update schedule status.' };
  }
}

export async function fetchDoctorProfileByUserId(userId: string) {
  try {
    const profile = await db.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });
    return { success: true, profile };
  } catch (error) {
    console.error('❌ Fetch doctor profile error:', error);
    return { success: false, error: 'Database query failure.' };
  }
}
