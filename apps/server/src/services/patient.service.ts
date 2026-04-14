import type { CreatePatientDto, UpdatePatientDto, PatientDto } from "@health-portal/shared";
import { patientRepository } from "../repositories/patient.repository.js";
import { hashPassword } from "../models/patient.model.js";
import { DuplicateEmailError } from "../utils/errors.js";

export { DuplicateEmailError };

export const patientService = {
  async getAll(): Promise<PatientDto[]> {
    return patientRepository.findAll();
  },

  async getById(id: string): Promise<PatientDto | null> {
    return patientRepository.findById(id);
  },

  async create(data: CreatePatientDto): Promise<PatientDto> {
    const existing = await patientRepository.findByEmail(data.email);
    if (existing) {
      throw new DuplicateEmailError(data.email);
    }

    const passwordHash = await hashPassword(data.password);
    return patientRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      bloodType: data.bloodType,
      passwordHash,
    });
  },

  async update(id: string, data: UpdatePatientDto): Promise<PatientDto | null> {
    if (data.email) {
      const existing = await patientRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new DuplicateEmailError(data.email);
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    delete updateData.password;

    if (data.password) {
      (updateData as { passwordHash: string }).passwordHash = await hashPassword(data.password);
    }

    return patientRepository.update(id, updateData as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      bloodType?: string;
      passwordHash?: string;
    });
  },
};
