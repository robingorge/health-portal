// Stateless API wrapper. Components should call these directly for now.
// Move behind a store later if the portal needs cross-page caching.

import type {
  AppointmentOccurrence,
  PatientSummaryDto,
  PrescriptionDto,
  RefillOccurrence,
} from "@health-portal/shared";
import { api } from "./client";

export const portalApi = {
  summary(): Promise<PatientSummaryDto> {
    return api.get<PatientSummaryDto>("/portal/summary");
  },

  appointments(): Promise<AppointmentOccurrence[]> {
    return api.get<AppointmentOccurrence[]>("/portal/appointments");
  },

  prescriptions(): Promise<PrescriptionDto[]> {
    return api.get<PrescriptionDto[]>("/portal/prescriptions");
  },

  refills(): Promise<RefillOccurrence[]> {
    return api.get<RefillOccurrence[]>("/portal/prescriptions/refills");
  },
};
