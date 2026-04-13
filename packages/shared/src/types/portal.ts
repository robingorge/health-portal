import type { PatientDto } from "./patient.js";
import type { AppointmentOccurrence } from "./appointment.js";
import type { RefillOccurrence } from "./prescription.js";

export type PatientSummaryDto = {
  patient: PatientDto;
  upcomingAppointments: AppointmentOccurrence[];
  upcomingRefills: RefillOccurrence[];
};
