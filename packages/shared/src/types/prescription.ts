export type RefillSchedule = {
  frequencyDays: number;
  endDate: string;
};

export type PrescriptionDto = {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  firstRefillDate: string;
  refillSchedule: RefillSchedule | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePrescriptionDto = {
  patientId: string;
  medicationName: string;
  dosage: string;
  quantity: number;
  firstRefillDate: string;
  refillSchedule?: RefillSchedule;
};

export type UpdatePrescriptionDto = {
  medicationName?: string;
  dosage?: string;
  quantity?: number;
  firstRefillDate?: string;
  refillSchedule?: RefillSchedule | null;
};

export type RefillOccurrence = {
  prescriptionId: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  date: string;
};
