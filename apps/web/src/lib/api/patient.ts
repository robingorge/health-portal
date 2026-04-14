// Stateless API wrapper. Components should call these directly for now.
// If patient data ever needs cross-component caching or optimistic updates,
// this module is a natural seam to lift behind a store (Zustand / React Query).

import type {
  AppointmentDto,
  CreatePatientDto,
  PatientDto,
  PrescriptionDto,
  UpdatePatientDto,
} from "@health-portal/shared";
import { api } from "./client";

export const patientApi = {
  list(): Promise<PatientDto[]> {
    return api.get<PatientDto[]>("/patients");
  },

  getById(id: string): Promise<PatientDto> {
    return api.get<PatientDto>(`/patients/${id}`);
  },

  create(data: CreatePatientDto): Promise<PatientDto> {
    return api.post<PatientDto>("/patients", data);
  },

  update(id: string, data: UpdatePatientDto): Promise<PatientDto> {
    return api.put<PatientDto>(`/patients/${id}`, data);
  },

  appointments(id: string): Promise<AppointmentDto[]> {
    return api.get<AppointmentDto[]>(`/patients/${id}/appointments`);
  },

  prescriptions(id: string): Promise<PrescriptionDto[]> {
    return api.get<PrescriptionDto[]>(`/patients/${id}/prescriptions`);
  },
};
