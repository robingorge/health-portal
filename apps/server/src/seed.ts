import { connectDatabase, disconnectDatabase } from "./lib/db.js";
import { Patient, hashPassword } from "./models/patient.model.js";
import { Appointment } from "./models/appointment.model.js";
import { Prescription } from "./models/prescription.model.js";

const RECURRENCE_END = new Date("2027-04-16");

async function seed() {
  // Seed wipes every patient / appointment / prescription. Guard against
  // pointing it at a production database by accident — opt in explicitly
  // with ALLOW_PROD_SEED=1 for the (rare) case you really mean it.
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "1") {
    console.error("Refusing to seed: NODE_ENV=production. Set ALLOW_PROD_SEED=1 to override.");
    process.exit(1);
  }

  await connectDatabase();

  await Promise.all([
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
  ]);

  console.log("Cleared existing data.");

  // --- Patients ---
  const patients = await Patient.insertMany([
    {
      firstName: "Mark",
      lastName: "Johnson",
      email: "mark@some-email-provider.net",
      phone: "555-0101",
      dateOfBirth: new Date("1985-06-15"),
      bloodType: "O+",
      passwordHash: await hashPassword("Password123!"),
    },
    {
      firstName: "Lisa",
      lastName: "Smith",
      email: "lisa@some-email-provider.net",
      phone: "555-0102",
      dateOfBirth: new Date("1990-03-22"),
      bloodType: "A+",
      passwordHash: await hashPassword("Password123!"),
    },
  ]);

  console.log(`Seeded ${patients.length} patients.`);

  const pid = (lastName: string) => {
    const p = patients.find((p) => p.lastName === lastName);
    if (!p) throw new Error(`Patient ${lastName} not found`);
    return p._id;
  };

  // --- Appointments ---
  const appointments = await Appointment.insertMany([
    // Mark — recurring weekly with Dr Kim West
    {
      patientId: pid("Johnson"),
      providerName: "Dr Kim West",
      description: "Weekly Check-in",
      firstAppointment: new Date("2026-04-16T16:30:00.000-07:00"),
      durationMinutes: 30,
      recurrence: { frequency: "weekly", endDate: RECURRENCE_END },
    },
    // Mark — recurring monthly with Dr Lin James
    {
      patientId: pid("Johnson"),
      providerName: "Dr Lin James",
      description: "Monthly Consultation",
      firstAppointment: new Date("2026-04-19T18:30:00.000-07:00"),
      durationMinutes: 30,
      recurrence: { frequency: "monthly", endDate: RECURRENCE_END },
    },
    // Lisa — recurring monthly with Dr Sally Field
    {
      patientId: pid("Smith"),
      providerName: "Dr Sally Field",
      description: "Monthly Review",
      firstAppointment: new Date("2026-04-22T18:15:00.000-07:00"),
      durationMinutes: 30,
      recurrence: { frequency: "monthly", endDate: RECURRENCE_END },
    },
    // Lisa — recurring weekly with Dr Lin James
    {
      patientId: pid("Smith"),
      providerName: "Dr Lin James",
      description: "Weekly Follow-up",
      firstAppointment: new Date("2026-04-25T20:00:00.000-07:00"),
      durationMinutes: 30,
      recurrence: { frequency: "weekly", endDate: RECURRENCE_END },
    },
  ]);

  console.log(`Seeded ${appointments.length} appointments.`);

  // --- Prescriptions ---
  const prescriptions = await Prescription.insertMany([
    // Mark — Lexapro 5mg, monthly refills
    {
      patientId: pid("Johnson"),
      medicationName: "Lexapro",
      dosage: "5mg",
      quantity: 2,
      firstRefillDate: new Date("2026-04-05"),
      refillSchedule: { frequencyDays: 30, endDate: RECURRENCE_END },
    },
    // Mark — Ozempic 1mg, monthly refills
    {
      patientId: pid("Johnson"),
      medicationName: "Ozempic",
      dosage: "1mg",
      quantity: 1,
      firstRefillDate: new Date("2026-04-10"),
      refillSchedule: { frequencyDays: 30, endDate: RECURRENCE_END },
    },
    // Lisa — Metformin 500mg, monthly refills
    {
      patientId: pid("Smith"),
      medicationName: "Metformin",
      dosage: "500mg",
      quantity: 2,
      firstRefillDate: new Date("2026-04-15"),
      refillSchedule: { frequencyDays: 30, endDate: RECURRENCE_END },
    },
    // Lisa — Diovan 100mg, monthly refills
    {
      patientId: pid("Smith"),
      medicationName: "Diovan",
      dosage: "100mg",
      quantity: 1,
      firstRefillDate: new Date("2026-04-25"),
      refillSchedule: { frequencyDays: 30, endDate: RECURRENCE_END },
    },
  ]);

  console.log(`Seeded ${prescriptions.length} prescriptions.`);

  await disconnectDatabase();
  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
