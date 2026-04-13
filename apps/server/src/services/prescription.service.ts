import type { CreatePrescriptionDto, UpdatePrescriptionDto, PrescriptionDto } from "@health-portal/shared";
import { prescriptionRepository } from "../repositories/prescription.repository.js";

export const prescriptionService = {
  async getByPatientId(patientId: string): Promise<PrescriptionDto[]> {
    return prescriptionRepository.findByPatientId(patientId);
  },

  async create(data: CreatePrescriptionDto): Promise<PrescriptionDto> {
    return prescriptionRepository.create(data);
  },

  async update(id: string, data: UpdatePrescriptionDto): Promise<PrescriptionDto | null> {
    return prescriptionRepository.update(id, data);
  },

  async remove(id: string): Promise<boolean> {
    return prescriptionRepository.remove(id);
  },
};
