export type RecurrenceFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export type RecurrenceRule = {
  frequency: RecurrenceFrequency;
  endDate: string;
};

export type AppointmentDto = {
  id: string;
  patientId: string;
  providerName: string;
  description: string;
  firstAppointment: string;
  durationMinutes: number;
  recurrence: RecurrenceRule | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppointmentDto = {
  patientId: string;
  providerName: string;
  description: string;
  firstAppointment: string;
  durationMinutes: number;
  recurrence?: RecurrenceRule;
};

export type UpdateAppointmentDto = {
  providerName?: string;
  description?: string;
  firstAppointment?: string;
  durationMinutes?: number;
  recurrence?: RecurrenceRule | null;
};

export type AppointmentOccurrence = {
  appointmentId: string;
  patientId: string;
  providerName: string;
  description: string;
  date: string;
  durationMinutes: number;
};
