import type { CreatePrescriptionDto, UpdatePrescriptionDto, PrescriptionDto } from "@health-portal/shared";
import { prescriptionRepository } from "../repositories/prescription.repository.js";
import { patientRepository } from "../repositories/patient.repository.js";
import { PatientNotFoundError } from "../utils/errors.js";

export { PatientNotFoundError };

export const prescriptionService = {
  async getByPatientId(patientId: string): Promise<PrescriptionDto[] | null> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) return null;
    return prescriptionRepository.findByPatientId(patientId);
  },

  async create(data: CreatePrescriptionDto): Promise<PrescriptionDto> {
    const patient = await patientRepository.findById(data.patientId);
    if (!patient) {
      throw new PatientNotFoundError(data.patientId);
    }
    return prescriptionRepository.create(data);
  },

  async update(id: string, data: UpdatePrescriptionDto): Promise<PrescriptionDto | null> {
    return prescriptionRepository.update(id, data);
  },

  async remove(id: string): Promise<boolean> {
    return prescriptionRepository.remove(id);
  },
};
