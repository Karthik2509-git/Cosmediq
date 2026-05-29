'use server';
import { db } from '@/lib/db';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Constant for default branch setup
const DEFAULT_BRANCH_ID = 'default-branch-hsr-layout';

export async function registerPatientAction(data: {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  medicalHistory?: string;
  emergencyPhone?: string;
  operatorId?: string; // Admin or Staff who did the registration
}) {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: 'A clinical record already exists for this email.' };
    }

    // Default hashed password for patient portal access
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('patient123', salt);

    // Create User & Patient Profile in a secure transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          role: Role.PATIENT,
          phone: data.phone,
          branchId: DEFAULT_BRANCH_ID,
        },
      });

      await tx.patientProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: new Date(data.dateOfBirth),
          gender: data.gender,
          bloodGroup: data.bloodGroup || null,
          address: data.address || null,
          medicalHistory: data.medicalHistory || null,
          emergencyPhone: data.emergencyPhone || null,
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: data.operatorId || null,
          action: 'PATIENT_REGISTER',
          entityType: 'User',
          entityId: user.id,
          newValue: { name: user.name, email: user.email, phone: user.phone },
        },
      });

      return user;
    });

    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  } catch (error) {
    console.error('❌ Patient registration action error:', error);
    return { success: false, error: 'Failed to create patient record. Please check database connectivity.' };
  }
}

export async function searchPatientsAction(query: string) {
  try {
    if (!query || query.trim() === '') {
      return { success: true, patients: [] };
    }

    const cleanQuery = query.trim();

    // Query matching by name, phone, or ID in PostgreSQL
    const users = await db.user.findMany({
      where: {
        role: Role.PATIENT,
        OR: [
          { name: { contains: cleanQuery, mode: 'insensitive' } },
          { phone: { contains: cleanQuery } },
          { id: { contains: cleanQuery } },
          { email: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        patientProfile: {
          include: {
            appointments: {
              orderBy: { dateTime: 'desc' },
              take: 1,
              include: {
                doctor: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 10,
    });

    const patients = users.map((user) => {
      const profile = user.patientProfile;
      const lastAppt = profile?.appointments[0];
      return {
        id: user.id,
        profileId: profile?.id || '',
        name: user.name,
        email: user.email,
        phone: user.phone || 'No phone',
        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : '',
        gender: profile?.gender || 'Unspecified',
        bloodGroup: profile?.bloodGroup || '',
        address: profile?.address || '',
        medicalHistory: profile?.medicalHistory || '',
        emergencyPhone: profile?.emergencyPhone || '',
        lastVisit: lastAppt ? lastAppt.dateTime.toISOString().split('T')[0] : 'None',
        lastDoctor: lastAppt ? lastAppt.doctor.user.name : 'None',
        lastDoctorId: lastAppt ? lastAppt.doctor.id : '',
      };
    });

    return { success: true, patients };
  } catch (error) {
    console.error('❌ Search patients action error:', error);
    return { success: false, error: 'Database search failure.' };
  }
}
