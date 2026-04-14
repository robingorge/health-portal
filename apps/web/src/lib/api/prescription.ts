// Stateless API wrapper. Components should call these directly for now.
// Move behind a store later if prescriptions need shared/cached state.

import type {
  CreatePrescriptionDto,
  PrescriptionDto,
  UpdatePrescriptionDto,
} from "@health-portal/shared";
import { api } from "./client";

export type PrescriptionOptions = {
  medications: readonly string[];
  dosages: readonly string[];
};

export const prescriptionApi = {
  options(): Promise<PrescriptionOptions> {
    return api.get<PrescriptionOptions>("/prescriptions/options");
  },

  create(data: CreatePrescriptionDto): Promise<PrescriptionDto> {
    return api.post<PrescriptionDto>("/prescriptions", data);
  },

  update(id: string, data: UpdatePrescriptionDto): Promise<PrescriptionDto> {
    return api.put<PrescriptionDto>(`/prescriptions/${id}`, data);
  },

  remove(id: string): Promise<void> {
    return api.delete(`/prescriptions/${id}`);
  },
};
