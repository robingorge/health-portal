import type { CreatePatientDto, UpdatePatientDto, PatientDto } from "@health-portal/shared";
import { patientRepository } from "../repositories/patient.repository.js";

export const patientService = {
  async getAll(): Promise<PatientDto[]> {
    return patientRepository.findAll();
  },

  async getById(id: string): Promise<PatientDto | null> {
    return patientRepository.findById(id);
  },

  async create(data: CreatePatientDto): Promise<PatientDto> {
    return patientRepository.create(data);
  },

  async update(id: string, data: UpdatePatientDto): Promise<PatientDto | null> {
    return patientRepository.update(id, data);
  },
};
