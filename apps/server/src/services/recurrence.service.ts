import type { AppointmentDto, AppointmentOccurrence, PrescriptionDto, RefillOccurrence } from "@health-portal/shared";

export const recurrenceService = {
  expandAppointments(
    _appointments: AppointmentDto[],
    _windowStart: Date,
    _windowEnd: Date,
  ): AppointmentOccurrence[] {
    throw new Error("Not implemented");
  },

  expandRefills(
    _prescriptions: PrescriptionDto[],
    _windowStart: Date,
    _windowEnd: Date,
  ): RefillOccurrence[] {
    throw new Error("Not implemented");
  },
};
