# Clinic Operations Console: Staff, Doctor & Admin Guide

This guide details the day-to-day clinical operations and administrative protocols of the Cosmediq platform. It is structured by user role to ensure rapid staff onboarding and strict workflow compliance.

---

## 1. Receptionist & Clinic Staff Workflows

Receptionists are the primary operational drivers. Their interface is optimized to minimize clicks and expedite walk-in patient flow.

### A. Walk-in Registration & Search
1. **Quick Search:** Use the persistent search bar in the top-bar header. Type the patient's name, phone number, or Unique ID. Search returns instantly.
2. **New Patient Registration:** If no match is found, click **Register Walk-in**. Fill in basic demographics (Name, Phone, DOB, Gender). Upon saving, a profile is generated instantly.

### B. Booking & Token Queue Management
1. **Scheduling an Appointment:** From a patient's profile card, click **Book Appointment**.
2. **Assign Specialist & Reason:** Select the preferred doctor and enter the reason for the visit (e.g., *Inflammatory acne consultation*).
3. **Queue Token Assignment:** Upon booking a confirmed appointment for today, the system automatically assigns the next sequential daily queue token (e.g., `C-01`, `C-02`) and sets the queue status to `WAITING`.
4. **Portal Callback Requests:** When a patient requests an appointment through their portal, it registers as `REQUESTED` in the staff dashboard drawer. Click the entry, call the patient, confirm the time slot, and click **Confirm Booking** to add them to the active queue.

### C. Invoicing and Payments
1. **Generating an Invoice:** From the appointment profile page, click **Create Invoice**. The system automatically loads preset item charges (e.g., *Specialist Consultation Fee*).
2. **Log Payment Methods:** Select the payment status:
   * **Paid:** Log full cash, card, or UPI collections.
   * **Partially Paid:** If a patient makes a partial deposit, enter the paid amount. The outstanding balance is recorded automatically.
   * **Unpaid:** Registers the full amount as an outstanding ledger balance.
3. **Receipt Generation:** Click **Finalize Billing** to print or export tax-compliant itemized receipts.

---

## 2. Dermatologist & Specialist Workflows

Dermatologists require a distraction-free, linear consulting workspace.

### A. Sticky Patient Context Header
When a doctor opens a patient from the queue, a compact, premium context card remains docked at the top of the viewport during scrolling:
* **Patient Name & ID**
* **Age, Gender & Blood Group**
* **Active Queue Token (e.g., Token C-02)**
* **Today's Chief Complaint**
* **Last Completed Visit Date**

This card prevents clinical confusion and ensures key patient vitals remain visible.

### B. Consultation & Prescription Builder
1. **Diagnosis Entry:** Enter clinical diagnostic terms (e.g., *Moderate Inflammatory Acne Vulgaris (Grade II)* or *Epidermal Moisture Impairment*).
2. **Autosave Drafts:** The consultation notes editor saves drafts automatically every few seconds to prevent data loss.
3. **Prescription Builder:** Click **Add Medication** to build structured prescriptions. Specify:
   * *Medication Name* (e.g., *Adapalene 0.1% Gel*)
   * *Frequency* (e.g., *Once daily*)
   * *Timing* (e.g., *Night application after wash*)
   * *Duration* (e.g., *15 Days*)
4. **Finalizing Consultation:** Click **Finalize & Sign**. This action locks the medical record, updates the queue status to `DONE`, logs the action in the compliance trail, and triggers invoice compilation for the reception desk.

---

## 3. Executive Owner & Admin Controls

Clinic owners can monitor clinical throughput, financial analytics, and operational security logs.

### A. Dashboard Analytics
The admin dashboard integrates **Recharts interactive visualizations** to display clinic performance:
* **Revenue Metrics:** Month-on-month paid, pending, and partially paid ledger cash flows.
* **Volume Metrics:** Total registered patients and appointment booking categories.
* **Doctor Throughput:** Volume of consultations completed per specialist.

### B. Compliance Audit Logs
All critical database modifications are tracked in a secure ledger:
* **Recorded Parameters:** Action category (e.g., `CONSULTATION_FINALIZE`, `BILLING_PAYMENT_RECORD`), modified table entity, timestamp, IP address, and raw before/after state snapshots.
* **Access Control:** Audit logs are strictly viewable only by users with the `ADMIN` role. Staff and doctors have no read permissions.
