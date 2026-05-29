'use server';
import { db } from '@/lib/db';
import { InvoiceStatus } from '@prisma/client';

export async function fetchInvoicesAction(patientProfileId?: string) {
  try {
    const invoices = await db.invoice.findMany({
      where: patientProfileId ? { patientId: patientProfileId } : undefined,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        appointment: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = invoices.map((inv) => ({
      id: inv.id,
      patientName: inv.patient.user.name,
      patientId: inv.patient.user.id,
      patientProfileId: inv.patientId,
      amount: inv.amount,
      paidAmount: inv.paidAmount,
      status: inv.status,
      paymentMethod: inv.paymentMethod || 'None',
      paidDate: inv.paidDate ? inv.paidDate.toISOString().split('T')[0] : 'Unpaid',
      createdAt: inv.createdAt.toISOString().split('T')[0],
      items: inv.items ? (inv.items as any[]) : [],
      doctorName: inv.appointment?.doctor.user.name || 'Clinical Staff',
      reason: inv.appointment?.reason || 'Walk-In Skincare Treatment',
    }));

    return { success: true, invoices: parsed };
  } catch (error) {
    console.error('❌ Fetch invoices action error:', error);
    return { success: false, error: 'Database invoice query failure.' };
  }
}

export async function createInvoiceAction(data: {
  patientProfileId: string;
  appointmentId?: string;
  amount: number;
  items: Array<{ name: string; price: number }>;
  operatorId?: string;
}) {
  try {
    const invoice = await db.invoice.create({
      data: {
        patientId: data.patientProfileId,
        appointmentId: data.appointmentId || null,
        amount: data.amount,
        paidAmount: 0.0,
        status: InvoiceStatus.UNPAID,
        items: data.items as any,
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
        action: 'INVOICE_CREATE',
        entityType: 'Invoice',
        entityId: invoice.id,
        newValue: { amount: data.amount, patientName: invoice.patient.user.name },
      },
    });

    return { success: true, invoice };
  } catch (error) {
    console.error('❌ Create invoice action error:', error);
    return { success: false, error: 'Database invoice creation failure.' };
  }
}

export async function recordManualPaymentAction(data: {
  invoiceId: string;
  paidAmount: number;
  paymentMethod: string; // CASH, CARD, UPI
  operatorId?: string;
}) {
  try {
    const currentInvoice = await db.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!currentInvoice) {
      return { success: false, error: 'Invoice not found.' };
    }

    const updatedPaidAmount = currentInvoice.paidAmount + data.paidAmount;
    let status: InvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
    let paidDate = null;

    if (updatedPaidAmount >= currentInvoice.amount) {
      status = InvoiceStatus.PAID;
      paidDate = new Date();
    }

    const invoice = await db.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          paidAmount: updatedPaidAmount,
          status,
          paymentMethod: data.paymentMethod,
          paidDate,
        },
      });

      // Write Audit Log
      await tx.auditLog.create({
        data: {
          userId: data.operatorId || null,
          action: 'BILLING_PAYMENT_RECORD',
          entityType: 'Invoice',
          entityId: data.invoiceId,
          oldValue: { paidAmount: currentInvoice.paidAmount, status: currentInvoice.status },
          newValue: { paidAmount: updatedPaidAmount, status },
        },
      });

      return updated;
    });

    return { success: true, invoice };
  } catch (error) {
    console.error('❌ Record payment action error:', error);
    return { success: false, error: 'Database payment log failure.' };
  }
}
