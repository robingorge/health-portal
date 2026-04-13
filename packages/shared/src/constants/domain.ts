export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodType = (typeof BLOOD_TYPES)[number];

export const RECURRENCE_FREQUENCIES = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
] as const;

export const SUMMARY_WINDOW_DAYS = 7;

export const DETAIL_WINDOW_MONTHS = 3;

export const MEDICATION_OPTIONS = [
  "Lisinopril",
  "Atorvastatin",
  "Metformin",
  "Amlodipine",
  "Omeprazole",
  "Losartan",
  "Levothyroxine",
  "Albuterol",
] as const;

export const DOSAGE_OPTIONS = [
  "5mg",
  "10mg",
  "20mg",
  "25mg",
  "40mg",
  "50mg",
  "100mg",
  "250mg",
  "500mg",
] as const;
