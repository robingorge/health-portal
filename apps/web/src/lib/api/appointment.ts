// Stateless API wrapper. Components should call these directly for now.
// Move behind a store later if appointments need shared/cached state.

import type {
  AppointmentDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from "@health-portal/shared";
import { api } from "./client";

export const appointmentApi = {
  create(data: CreateAppointmentDto): Promise<AppointmentDto> {
    return api.post<AppointmentDto>("/appointments", data);
  },

  update(id: string, data: UpdateAppointmentDto): Promise<AppointmentDto> {
    return api.put<AppointmentDto>(`/appointments/${id}`, data);
  },

  remove(id: string): Promise<void> {
    return api.delete(`/appointments/${id}`);
  },
};
