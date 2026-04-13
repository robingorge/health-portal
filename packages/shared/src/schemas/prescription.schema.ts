import { z } from "zod";

const refillScheduleSchema = z.object({
  frequencyDays: z.number().int().min(1).max(365),
  endDate: z.string().date(),
});

export const createPrescriptionSchema = z.object({
  patientId: z.string().min(1),
  medicationName: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  quantity: z.number().int().min(1),
  firstRefillDate: z.string().date(),
  refillSchedule: refillScheduleSchema.optional(),
});

export const updatePrescriptionSchema = z.object({
  medicationName: z.string().min(1).max(200).optional(),
  dosage: z.string().min(1).max(100).optional(),
  quantity: z.number().int().min(1).optional(),
  firstRefillDate: z.string().date().optional(),
  refillSchedule: refillScheduleSchema.nullable().optional(),
});
