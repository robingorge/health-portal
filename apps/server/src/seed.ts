import { connectDatabase, disconnectDatabase } from "./lib/db.js";
import { Patient, hashPassword } from "./models/patient.model.js";
import { Appointment } from "./models/appointment.model.js";
import { Prescription } from "./models/prescription.model.js";

async function seed() {
  await connectDatabase();

  // Clear existing data
  await Promise.all([
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
  ]);

  console.log("Cleared existing data.");

  // --- Patients ---
  const patients = await Patient.insertMany([
    {
      firstName: "Elena",
      lastName: "Richardson",
      email: "elena.richardson@email.com",
      phone: "555-0101",
      dateOfBirth: new Date("1989-03-15"),
      bloodType: "O+",
      passwordHash: await hashPassword("password123"),
    },
    {
      firstName: "Marcus",
      lastName: "Sterling",
      email: "m.sterling@email.com",
      phone: "555-0102",
      dateOfBirth: new Date("1975-11-22"),
      bloodType: "A-",
      passwordHash: await hashPassword("password123"),
    },
    {
      firstName: "Aisha",
      lastName: "Patel",
      email: "aisha.p@email.com",
      phone: "555-0103",
      dateOfBirth: new Date("1992-07-08"),
      bloodType: "B+",
      passwordHash: await hashPassword("password123"),
    },
    {
      firstName: "Julian",
      lastName: "Wright",
      email: "julian.wright@email.com",
      phone: "555-0104",
      dateOfBirth: new Date("1960-01-30"),
      bloodType: "AB+",
      passwordHash: await hashPassword("password123"),
    },
    {
      firstName: "Evelyn",
      lastName: "Montgomery",
      email: "evelyn.m@email.com",
      phone: "555-0105",
      dateOfBirth: new Date("1962-05-12"),
      bloodType: "A+",
      passwordHash: await hashPassword("password123"),
    },
  ]);

  console.log(`Seeded ${patients.length} patients.`);

  // Helper to get patient ID by last name
  const pid = (lastName: string) => {
    const p = patients.find((p) => p.lastName === lastName);
    if (!p) throw new Error(`Patient ${lastName} not found`);
    return p._id;
  };

  // --- Appointments ---
  // Dates are relative to "now" so the seed data always has upcoming items
  const now = new Date();
  const daysFromNow = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };
  const monthsFromNow = (months: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const appointments = await Appointment.insertMany([
    // Elena — one-time cardiology follow-up in 3 days
    {
      patientId: pid("Richardson"),
      providerName: "Dr. Sarah Jenkins",
      description: "Cardiology Follow-up",
      firstAppointment: daysFromNow(3),
      durationMinutes: 45,
      recurrence: null,
    },
    // Elena — recurring weekly nutrition review starting in 5 days
    {
      patientId: pid("Richardson"),
      providerName: "Dr. Michael Chen",
      description: "Annual Nutrition Review",
      firstAppointment: daysFromNow(5),
      durationMinutes: 15,
      recurrence: { frequency: "monthly", endDate: monthsFromNow(6) },
    },
    // Marcus — biweekly check-in
    {
      patientId: pid("Sterling"),
      providerName: "Dr. Lisa Park",
      description: "Cardio Follow-up",
      firstAppointment: daysFromNow(2),
      durationMinutes: 30,
      recurrence: { frequency: "biweekly", endDate: monthsFromNow(3) },
    },
    // Aisha — weekly physical therapy
    {
      patientId: pid("Patel"),
      providerName: "Dr. James Rivera",
      description: "Physical Therapy Session",
      firstAppointment: daysFromNow(1),
      durationMinutes: 60,
      recurrence: { frequency: "weekly", endDate: monthsFromNow(2) },
    },
    // Evelyn — general health check (one-time, in 10 days)
    {
      patientId: pid("Montgomery"),
      providerName: "Dr. Sarah Jenkins",
      description: "General Health Check",
      firstAppointment: daysFromNow(10),
      durationMinutes: 30,
      recurrence: null,
    },
    // Evelyn — monthly cardiology consult
    {
      patientId: pid("Montgomery"),
      providerName: "Dr. Marcus Thorne",
      description: "Cardiology Consult",
      firstAppointment: daysFromNow(4),
      durationMinutes: 45,
      recurrence: { frequency: "monthly", endDate: monthsFromNow(6) },
    },
  ]);

  console.log(`Seeded ${appointments.length} appointments.`);

  // --- Prescriptions ---
  const prescriptions = await Prescription.insertMany([
    // Elena — Lisinopril, recurring 30-day refills
    {
      patientId: pid("Richardson"),
      medicationName: "Lisinopril",
      dosage: "10mg",
      quantity: 30,
      firstRefillDate: daysFromNow(2),
      refillSchedule: { frequencyDays: 30, endDate: monthsFromNow(12) },
    },
    // Elena — Atorvastatin, recurring 30-day refills
    {
      patientId: pid("Richardson"),
      medicationName: "Atorvastatin",
      dosage: "20mg",
      quantity: 30,
      firstRefillDate: daysFromNow(5),
      refillSchedule: { frequencyDays: 30, endDate: monthsFromNow(12) },
    },
    // Marcus — Metformin, 90-day refills
    {
      patientId: pid("Sterling"),
      medicationName: "Metformin",
      dosage: "500mg",
      quantity: 90,
      firstRefillDate: daysFromNow(10),
      refillSchedule: { frequencyDays: 90, endDate: monthsFromNow(12) },
    },
    // Aisha — Omeprazole, no recurring refill (one-time)
    {
      patientId: pid("Patel"),
      medicationName: "Omeprazole",
      dosage: "20mg",
      quantity: 14,
      firstRefillDate: daysFromNow(7),
      refillSchedule: null,
    },
    // Evelyn — Lisinopril 10mg tablet
    {
      patientId: pid("Montgomery"),
      medicationName: "Lisinopril",
      dosage: "10mg",
      quantity: 30,
      firstRefillDate: daysFromNow(1),
      refillSchedule: { frequencyDays: 30, endDate: monthsFromNow(12) },
    },
    // Evelyn — Atorvastatin 20mg
    {
      patientId: pid("Montgomery"),
      medicationName: "Atorvastatin",
      dosage: "20mg",
      quantity: 30,
      firstRefillDate: daysFromNow(3),
      refillSchedule: { frequencyDays: 30, endDate: monthsFromNow(12) },
    },
    // Julian — Amlodipine
    {
      patientId: pid("Wright"),
      medicationName: "Amlodipine",
      dosage: "5mg",
      quantity: 30,
      firstRefillDate: daysFromNow(6),
      refillSchedule: { frequencyDays: 30, endDate: monthsFromNow(6) },
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
