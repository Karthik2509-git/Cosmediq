'use server';
import { db } from '@/lib/db';

export async function uploadMedicalRecordAction(data: {
  patientProfileId: string;
  doctorId?: string;
  fileName: string;
  fileUrl: string;
  fileType: string; // PDF, SCAN, IMAGE, PRESCRIPTION
  fileSize: number;
  description?: string;
  operatorId?: string; // Who uploaded
}) {
  try {
    const record = await db.medicalRecord.create({
      data: {
        patientId: data.patientProfileId,
        doctorId: data.doctorId || null,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        description: data.description || null,
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
    await db.auditLog.create({
      data: {
        userId: data.operatorId || null,
        action: 'MEDICAL_RECORD_UPLOAD',
        entityType: 'MedicalRecord',
        entityId: record.id,
        newValue: { fileName: data.fileName, patientName: record.patient.user.name },
      },
    });

    return { success: true, record };
  } catch (error) {
    console.error('❌ Upload record action error:', error);
    return { success: false, error: 'Database record upload failure.' };
  }
}

export async function fetchPatientRecordsAction(patientProfileId: string) {
  try {
    const records = await db.medicalRecord.findMany({
      where: { patientId: patientProfileId },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    const parsed = records.map((rec) => ({
      id: rec.id,
      fileName: rec.fileName,
      fileUrl: rec.fileUrl,
      fileType: rec.fileType,
      fileSize: rec.fileSize,
      description: rec.description || 'No description provided',
      uploadedAt: rec.uploadedAt.toISOString().split('T')[0],
      doctorName: rec.doctor?.user.name || 'External / Patient Upload',
    }));

    return { success: true, records: parsed };
  } catch (error) {
    console.error('❌ Fetch patient records action error:', error);
    return { success: false, error: 'Database record fetch failure.' };
  }
}
