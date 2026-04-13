import type { CreateAppointmentDto, UpdateAppointmentDto, AppointmentDto } from "@health-portal/shared";
import { appointmentRepository } from "../repositories/appointment.repository.js";

export const appointmentService = {
  async getByPatientId(patientId: string): Promise<AppointmentDto[]> {
    return appointmentRepository.findByPatientId(patientId);
  },

  async create(data: CreateAppointmentDto): Promise<AppointmentDto> {
    return appointmentRepository.create(data);
  },

  async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentDto | null> {
    return appointmentRepository.update(id, data);
  },

  async remove(id: string): Promise<boolean> {
    return appointmentRepository.remove(id);
  },
};
