# Design Document: Health Portal Domain & API

## 1. Entity Design (Database Models)

These live in `apps/server/src/models/` only. Never exposed to the frontend directly.

### Patient

| Field        | Type     | Notes                        |
|--------------|----------|------------------------------|
| _id          | ObjectId |                              |
| firstName    | string   |                              |
| lastName     | string   |                              |
| email        | string   | unique                       |
| phone        | string   |                              |
| dateOfBirth  | Date     |                              |
| bloodType    | string   | enum: A+, A-, B+, B-, AB+, AB-, O+, O- |
| passwordHash | string   | never exposed in DTOs        |
| createdAt    | Date     |                              |
| updatedAt    | Date     |                              |

### Appointment

| Field            | Type                   | Notes                          |
|------------------|------------------------|--------------------------------|
| _id              | ObjectId               |                                |
| patientId        | ObjectId (ref: Patient)|                                |
| providerName     | string                 |                                |
| description      | string                 | e.g. "Cardiology Follow-up"   |
| firstAppointment | Date                   | anchor datetime                |
| durationMinutes  | number                 |                                |
| recurrence       | RecurrenceRule \| null  | null = one-time appointment    |
| createdAt        | Date                   |                                |
| updatedAt        | Date                   |                                |

**RecurrenceRule (embedded)**

| Field     | Type   | Notes                                  |
|-----------|--------|----------------------------------------|
| frequency | string | "daily" \| "weekly" \| "biweekly" \| "monthly" |
| endDate   | Date   | when recurrence stops                  |

### Prescription

| Field           | Type                    | Notes                       |
|-----------------|-------------------------|-----------------------------|
| _id             | ObjectId                |                             |
| patientId       | ObjectId (ref: Patient) |                             |
| medicationName  | string                  |                             |
| dosage          | string                  | e.g. "10mg"                 |
| quantity         | number                  |                             |
| firstRefillDate | Date                    | anchor date                 |
| refillSchedule  | RefillSchedule \| null   | null = no recurring refills |
| createdAt       | Date                    |                             |
| updatedAt       | Date                    |                             |

**RefillSchedule (embedded)**

| Field         | Type   | Notes              |
|---------------|--------|--------------------|
| frequencyDays | number | e.g. 30, 60, 90    |
| endDate       | Date   | when refills stop  |

---

## 2. DTO Design (Shared Types)

These live in `packages/shared/src/types/`. Used by both frontend and backend. All dates are ISO strings for JSON serialization.

### PatientDto

Same fields as entity except: no `passwordHash`, `_id` becomes `id: string`, all dates are ISO strings.

### CreatePatientDto

`firstName`, `lastName`, `email`, `phone`, `dateOfBirth`, `bloodType`, `password`

### UpdatePatientDto

All fields from CreatePatientDto are optional.

### AppointmentDto

Same fields as entity except: `_id` → `id`, `patientId` is a string, dates are ISO strings, `recurrence` uses string dates.

### CreateAppointmentDto

`patientId`, `providerName`, `description`, `firstAppointment`, `durationMinutes`, `recurrence?`

### UpdateAppointmentDto

All fields optional except `patientId` (immutable). `recurrence` can be set to `null` to remove.

### AppointmentOccurrence (computed, not stored)

| Field           | Type   | Notes                          |
|-----------------|--------|--------------------------------|
| appointmentId   | string | references the source record   |
| patientId       | string |                                |
| providerName    | string |                                |
| description     | string |                                |
| date            | string | ISO datetime of this occurrence|
| durationMinutes | number |                                |

### PrescriptionDto

Same fields as entity except: `_id` → `id`, dates are ISO strings.

### CreatePrescriptionDto

`patientId`, `medicationName`, `dosage`, `quantity`, `firstRefillDate`, `refillSchedule?`

### UpdatePrescriptionDto

All fields optional except `patientId` (immutable). `refillSchedule` can be set to `null` to remove.

### RefillOccurrence (computed, not stored)

| Field            | Type   | Notes                         |
|------------------|--------|-------------------------------|
| prescriptionId   | string | references the source record  |
| patientId        | string |                               |
| medicationName   | string |                               |
| dosage           | string |                               |
| date             | string | ISO date of this refill       |

### PatientSummaryDto (portal dashboard)

| Field                 | Type                    | Notes       |
|-----------------------|-------------------------|-------------|
| patient               | PatientDto              |             |
| upcomingAppointments  | AppointmentOccurrence[] | next 7 days |
| upcomingRefills       | RefillOccurrence[]      | next 7 days |

---

## 3. Route Design

### Admin API (no auth) — returns raw stored records

| Method   | Path                              | Response             |
|----------|-----------------------------------|----------------------|
| GET      | /api/patients                     | PatientDto[]         |
| GET      | /api/patients/:id                 | PatientDto           |
| POST     | /api/patients                     | PatientDto           |
| PUT      | /api/patients/:id                 | PatientDto           |
| GET      | /api/patients/:id/appointments    | AppointmentDto[]     |
| GET      | /api/patients/:id/prescriptions   | PrescriptionDto[]    |
| POST     | /api/appointments                 | AppointmentDto       |
| PUT      | /api/appointments/:id             | AppointmentDto       |
| DELETE   | /api/appointments/:id             | void                 |
| POST     | /api/prescriptions                | PrescriptionDto      |
| PUT      | /api/prescriptions/:id            | PrescriptionDto      |
| DELETE   | /api/prescriptions/:id            | void                 |

### Patient Portal API (session auth, scoped to logged-in patient)

| Method   | Path                                | Response                | Notes                          |
|----------|-------------------------------------|-------------------------|--------------------------------|
| POST     | /api/auth/login                     | PatientDto + session    |                                |
| POST     | /api/auth/logout                    | void                    |                                |
| GET      | /api/auth/me                        | PatientDto              |                                |
| GET      | /api/portal/summary                 | PatientSummaryDto       | expanded occurrences, 7 days   |
| GET      | /api/portal/appointments            | AppointmentOccurrence[] | expanded, up to 3 months       |
| GET      | /api/portal/prescriptions           | PrescriptionDto[]       | full records with all fields   |
| GET      | /api/portal/prescriptions/refills   | RefillOccurrence[]      | expanded refill dates, 3 months|

### Utility

| Method | Path        | Response                          |
|--------|-------------|-----------------------------------|
| GET    | /api/health | { success: true, data: { status: "ok" } } |

### API Response Shape

All responses follow a consistent envelope:

```
Success: { success: true, data: T }
Error:   { success: false, error: { code: string, message: string } }
```

---

## 4. Recurrence Design

### Principle

Store the scheduling rule on the record. Never materialize future occurrences in the database. Expand occurrences in the service layer at read time.

### Expansion Logic

```
Input:  appointment record + time window (start, end)
Output: AppointmentOccurrence[]

1. Start from firstAppointment
2. Step forward by frequency interval
3. Stop at recurrence.endDate or windowEnd (whichever is first)
4. Skip dates before windowStart
5. Return one AppointmentOccurrence per date in window
```

Same pattern applies for prescriptions using `firstRefillDate` + `refillSchedule.frequencyDays`.

### Time Windows

| Context                | Window                     | Constant               |
|------------------------|----------------------------|------------------------|
| Patient portal summary | today → today + 7 days     | SUMMARY_WINDOW_DAYS    |
| Detail / calendar views| today → today + 3 months   | DETAIL_WINDOW_MONTHS   |

### Where Each Piece Lives

| Concern                  | Location                                      |
|--------------------------|-----------------------------------------------|
| Recurrence rule types    | packages/shared/src/types/                     |
| Occurrence types         | packages/shared/src/types/                     |
| Time window constants    | packages/shared/src/constants/                 |
| Expansion functions      | apps/server/src/services/recurrence.service.ts |

---

## 5. Validation (Zod Schemas)

All Zod schemas live in `packages/shared/src/schemas/`. They mirror DTO types and are used by backend validation middleware.

| Schema                     | File                        | Fields Validated                              |
|----------------------------|-----------------------------|-----------------------------------------------|
| createPatientSchema        | patient.schema.ts           | all required, email format, password min 8    |
| updatePatientSchema        | patient.schema.ts           | all optional, same constraints                |
| createAppointmentSchema    | appointment.schema.ts       | all required, datetime format, duration 5-480 |
| updateAppointmentSchema    | appointment.schema.ts       | all optional, recurrence nullable             |
| createPrescriptionSchema   | prescription.schema.ts      | all required, date format, quantity min 1     |
| updatePrescriptionSchema   | prescription.schema.ts      | all optional, refillSchedule nullable         |
| loginSchema                | auth.schema.ts              | email format, password required               |

---

## 6. Constants

Defined in `packages/shared/src/constants/domain.ts`:

| Constant               | Value                                                          |
|-------------------------|---------------------------------------------------------------|
| BLOOD_TYPES             | A+, A-, B+, B-, AB+, AB-, O+, O-                             |
| RECURRENCE_FREQUENCIES  | daily, weekly, biweekly, monthly                              |
| SUMMARY_WINDOW_DAYS     | 7                                                             |
| DETAIL_WINDOW_MONTHS    | 3                                                             |
| MEDICATION_OPTIONS      | Lisinopril, Atorvastatin, Metformin, Amlodipine, Omeprazole, Losartan, Levothyroxine, Albuterol |
| DOSAGE_OPTIONS          | 5mg, 10mg, 20mg, 25mg, 40mg, 50mg, 100mg, 250mg, 500mg      |

---

## 7. File Structure

### packages/shared/src/

```
types/
  index.ts              — barrel export
  api.ts                — ApiResponse, ApiSuccessResponse, ApiErrorResponse
  patient.ts            — PatientDto, CreatePatientDto, UpdatePatientDto
  appointment.ts        — AppointmentDto, CreateAppointmentDto, UpdateAppointmentDto,
                          RecurrenceRule, RecurrenceFrequency, AppointmentOccurrence
  prescription.ts       — PrescriptionDto, CreatePrescriptionDto, UpdatePrescriptionDto,
                          RefillSchedule, RefillOccurrence
  portal.ts             — PatientSummaryDto

schemas/
  index.ts              — barrel export
  patient.schema.ts     — createPatientSchema, updatePatientSchema
  appointment.schema.ts — createAppointmentSchema, updateAppointmentSchema
  prescription.schema.ts— createPrescriptionSchema, updatePrescriptionSchema
  auth.schema.ts        — loginSchema

constants/
  index.ts              — barrel export
  domain.ts             — BLOOD_TYPES, RECURRENCE_FREQUENCIES, time windows,
                          MEDICATION_OPTIONS, DOSAGE_OPTIONS
```

### apps/server/src/

```
index.ts                — entry point
app.ts                  — Express app setup, mounts /api routes

models/
  patient.model.ts      — Mongoose schema + model (includes passwordHash)
  appointment.model.ts  — Mongoose schema + model (includes RecurrenceRule subdoc)
  prescription.model.ts — Mongoose schema + model (includes RefillSchedule subdoc)

routes/
  index.ts              — mounts all sub-routers under /api
  patient.routes.ts     — /patients CRUD + nested /appointments, /prescriptions
  appointment.routes.ts — /appointments create, update, delete
  prescription.routes.ts— /prescriptions create, update, delete
  auth.routes.ts        — /auth/login, /auth/logout, /auth/me
  portal.routes.ts      — /portal/summary, appointments, prescriptions, refills

controllers/
  patient.controller.ts
  appointment.controller.ts
  prescription.controller.ts
  auth.controller.ts
  portal.controller.ts

services/
  patient.service.ts
  appointment.service.ts
  prescription.service.ts
  recurrence.service.ts — occurrence expansion logic
  auth.service.ts

repositories/
  patient.repository.ts
  appointment.repository.ts
  prescription.repository.ts

middleware/
  validate.ts           — Zod validation middleware
  error-handler.ts      — global error handler

utils/
```

---

## 8. Key Design Decisions

1. **DB models vs DTOs are strictly separated.** `passwordHash` and `ObjectId` never appear in shared types. The shared package has no Mongoose dependency.

2. **Admin sees raw records.** Admin endpoints return `AppointmentDto[]` and `PrescriptionDto[]` with recurrence rules intact — what's stored is what's shown.

3. **Portal sees expanded views where appropriate.** Appointments are expanded into occurrences. Prescriptions are returned as full records (patients need medication details), with a dedicated `/refills` sub-route for expanded refill calendar dates.

4. **Recurrence is a rule, not materialized data.** No future appointment rows in the database. The `recurrence.service.ts` expands on read within a time window.

5. **Validation at the boundary.** Zod schemas validate all incoming request bodies. Shared between frontend (for UX) and backend (source of truth).

6. **Seeded domain options.** Medications and dosages are constants, not free-text — ready for dropdown use in both admin and portal forms.

7. **Consistent API envelope.** Every response uses `{ success, data }` or `{ success, error: { code, message } }`.
