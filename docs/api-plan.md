# Cosmediq API & Endpoints Specification

This document details the route endpoints, request/response models, and Auth.js v5 REST API designs planned for Cosmediq.

---

## 🔒 Authentication API (Auth.js v5 integration)

All authentication endpoints are handled under NextAuth.js App Router handlers at `/api/auth/*`.

### `POST /api/auth/callback/credentials`
- **Method:** `POST`
- **Description:** Core role-based authentication check.
- **Request Body (JSON):**
  ```json
  {
    "email": "doctor@cosmediq.com",
    "password": "securepassword123"
  }
  ```
- **Response (Success - 200):** Sets secure HTTP-Only session cookies containing the signed JWT.
  ```json
  {
    "user": {
      "id": "u-1234-uuid",
      "email": "doctor@cosmediq.com",
      "name": "Dr. Sarah Miller",
      "role": "DOCTOR",
      "branchId": "b-5678-uuid"
    }
  }
  ```

---

## 📅 Public & Appointment Requests API

### `POST /api/appointments/request`
- **Method:** `POST`
- **Description:** Submit a walk-in / virtual consultation slot request from the public site. (Patients cannot directly book/confirm. It saves with `REQUESTED` status for Staff approval).
- **Request Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@gmail.com",
    "phone": "+919876543210",
    "date": "2026-06-05T10:00:00Z",
    "doctorId": "doc-5555-uuid",
    "reason": "Acne scar treatment consultation"
  }
  ```
- **Response (Success - 201):**
  ```json
  {
    "status": "success",
    "message": "Appointment slot requested. Reception will contact you shortly to confirm.",
    "appointmentId": "app-8888-uuid"
  }
  ```

---

## 📝 Audit & Operational API (Used inside Admin/Staff Panels later)

### `POST /api/audit-logs`
- **Method:** `POST`
- **Description:** Internal system action logger.
- **Request Body (JSON):**
  ```json
  {
    "action": "APPOINTMENT_CANCEL",
    "entityType": "Appointment",
    "entityId": "app-8888-uuid",
    "oldValue": { "status": "CONFIRMED" },
    "newValue": { "status": "CANCELLED" }
  }
  ```
- **Response (Success - 201):**
  ```json
  {
    "logId": "audit-9999-uuid",
    "status": "logged"
  }
  ```
