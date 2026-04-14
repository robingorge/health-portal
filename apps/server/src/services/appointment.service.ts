import type { CreateAppointmentDto, UpdateAppointmentDto, AppointmentDto } from "@health-portal/shared";
import { appointmentRepository } from "../repositories/appointment.repository.js";
import { patientRepository } from "../repositories/patient.repository.js";
import { PatientNotFoundError } from "../utils/errors.js";

export { PatientNotFoundError };

export const appointmentService = {
  async getByPatientId(patientId: string): Promise<AppointmentDto[] | null> {
    const patient = await patientRepository.findById(patientId);
    if (!patient) return null;
    return appointmentRepository.findByPatientId(patientId);
  },

  async create(data: CreateAppointmentDto): Promise<AppointmentDto> {
    const patient = await patientRepository.findById(data.patientId);
    if (!patient) {
      throw new PatientNotFoundError(data.patientId);
    }
    return appointmentRepository.create(data);
  },

  async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentDto | null> {
    return appointmentRepository.update(id, data);
  },

  async remove(id: string): Promise<boolean> {
    return appointmentRepository.remove(id);
  },
};
