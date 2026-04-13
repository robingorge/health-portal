import { z } from "zod";
import { BLOOD_TYPES } from "../constants/domain.js";

export const createPatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(1).max(20),
  dateOfBirth: z.string().date(),
  bloodType: z.enum(BLOOD_TYPES),
  password: z.string().min(8).max(128),
});

export const updatePatientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(20).optional(),
  dateOfBirth: z.string().date().optional(),
  bloodType: z.enum(BLOOD_TYPES).optional(),
  password: z.string().min(8).max(128).optional(),
});
