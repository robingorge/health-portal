import { z } from "zod";
import { RECURRENCE_FREQUENCIES } from "../constants/domain.js";

const recurrenceRuleSchema = z.object({
  frequency: z.enum(RECURRENCE_FREQUENCIES),
  endDate: z.string().date(),
});

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1),
  providerName: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  firstAppointment: z.string().datetime(),
  durationMinutes: z.number().int().min(5).max(480),
  recurrence: recurrenceRuleSchema.optional(),
});

export const updateAppointmentSchema = z.object({
  providerName: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(500).optional(),
  firstAppointment: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  recurrence: recurrenceRuleSchema.nullable().optional(),
});
