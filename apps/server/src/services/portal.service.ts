import type {
  PatientDto,
  PatientSummaryDto,
  AppointmentOccurrence,
  PrescriptionDto,
  RefillOccurrence,
} from "@health-portal/shared";
import { patientRepository } from "../repositories/patient.repository.js";
import { appointmentRepository } from "../repositories/appointment.repository.js";
import { prescriptionRepository } from "../repositories/prescription.repository.js";
import { recurrenceService } from "./recurrence.service.js";
import { next7Days, next3Months } from "../utils/date-window.js";
import { PatientNotFoundError } from "../utils/errors.js";

export { PatientNotFoundError };

/**
 * All portal read endpoints operate on the patient identified by the current
 * session (enforced by the `requireAuth` middleware before these service
 * methods are called). They never accept a patientId from the request body
 * or query string.
 */

async function loadPatientOrThrow(patientId: string): Promise<PatientDto> {
  const patient = await patientRepository.findById(patientId);
  if (!patient) throw new PatientNotFoundError(patientId);
  return patient;
}

export const portalService = {
  async getSummary(patientId: string): Promise<PatientSummaryDto> {
    const { start, end } = next7Days();
    const [patient, appointments, prescriptions] = await Promise.all([
      loadPatientOrThrow(patientId),
      appointmentRepository.findByPatientId(patientId),
      prescriptionRepository.findByPatientId(patientId),
    ]);

    return {
      patient,
      upcomingAppointments: recurrenceService.expandAppointments(appointments, start, end),
      upcomingRefills: recurrenceService.expandRefills(prescriptions, start, end),
    };
  },

  async getAppointmentOccurrences(patientId: string): Promise<AppointmentOccurrence[]> {
    await loadPatientOrThrow(patientId);
    const { start, end } = next3Months();
    const appointments = await appointmentRepository.findByPatientId(patientId);
    return recurrenceService.expandAppointments(appointments, start, end);
  },

  async getPrescriptions(patientId: string): Promise<PrescriptionDto[]> {
    await loadPatientOrThrow(patientId);
    return prescriptionRepository.findByPatientId(patientId);
  },

  async getRefillOccurrences(patientId: string): Promise<RefillOccurrence[]> {
    await loadPatientOrThrow(patientId);
    const { start, end } = next3Months();
    const prescriptions = await prescriptionRepository.findByPatientId(patientId);
    return recurrenceService.expandRefills(prescriptions, start, end);
  },
};
