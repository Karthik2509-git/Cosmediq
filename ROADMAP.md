# Cosmediq Product Roadmap

This document outlines the high-level roadmap for Cosmediq, a premium, production-quality clinic management platform designed for long-hour staff usability and scalable branch extensions.

---

## 🗺️ Phase Roadmap

### 🏁 Phase 1: Foundation, Public Website & Auth (Current)
* **Goal:** Set up project infrastructure, establish the brand identity, and secure role-based access for later dashboards.
* **Key Scopes:**
  - Next.js 15, React 19, TypeScript setup.
  - PostgreSQL database schema with Prisma ORM.
  - Auth.js v5 (NextAuth) credential authentication with Role-Based Access Control (RBAC).
  - Premium, trust-centered medical styling (calming teal, light/dark themes, high readability).
  - Storytelling clinic public pages (Home, About, Services, Doctors, FAQs, Contact).
  - Appointment request flow (Patients cannot directly book, only request).

### 🩺 Phase 2: Staff & Doctor Management (Upcoming)
* **Goal:** Build the clinical operations dashboard for receptionists/staff and consultation interface for doctors.
* **Key Scopes:**
  - **Staff Dashboard:** Appointment booking calendar, walk-in registrations, rescheduling, patient search, and doctor availability view.
  - **Doctor Dashboard:** Consultation history, digital prescription manager, consultation notes, availability toggle.
  - **Queue/Token Management:** Patient arrival workflow to consultation queue.

### 💳 Phase 3: Patient Portal, Billing & Reports
* **Goal:** Enable medical history uploads, secure invoicing, and detailed administrative reports.
* **Key Scopes:**
  - **Patient Portal:** Custom panels to view active/past appointments, download prescriptions, view invoices, request a visit, and view reports.
  - **Billing Module:** consultation fee logs, manual invoice generation, cash/card/UPI payment tracker.
  - **Medical File Uploads:** Patient scan upload portal (PDFs, clinical images, scans).
  - **Analytics Reports:** Beautiful charts showing daily patient counts, monthly revenue, and doctor performance.

### 🔔 Phase 4: Notifications & Advanced UX Polish
* **Goal:** Integrate automated clinic reminders, error handling, accessibility, and high performance.
* **Key Scopes:**
  - **Reminders:** SMS, email, and WhatsApp message system architecture.
  - **Polish:** Page transitions, skeleton loading, interactive feedback microinteractions.
