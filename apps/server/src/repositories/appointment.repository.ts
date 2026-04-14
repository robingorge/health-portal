import { Types } from "mongoose";
import type {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentDto,
  RecurrenceRule,
  RecurrenceFrequency,
} from "@health-portal/shared";
import { Appointment, type IAppointment, type IRecurrenceRule } from "../models/appointment.model.js";

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function recurrenceToDto(r: IRecurrenceRule | null | undefined): RecurrenceRule | null {
  if (!r) return null;
  return {
    frequency: r.frequency as RecurrenceFrequency,
    endDate: toDateOnly(r.endDate),
  };
}

function toDto(doc: IAppointment): AppointmentDto {
  return {
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    providerName: doc.providerName,
    description: doc.description,
    firstAppointment: doc.firstAppointment.toISOString(),
    durationMinutes: doc.durationMinutes,
    recurrence: recurrenceToDto(doc.recurrence),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function recurrenceToModel(r: RecurrenceRule | null | undefined): IRecurrenceRule | null | undefined {
  if (r === undefined) return undefined;
  if (r === null) return null;
  return {
    frequency: r.frequency,
    endDate: new Date(r.endDate),
  };
}

export const appointmentRepository = {
  async findByPatientId(patientId: string): Promise<AppointmentDto[]> {
    if (!Types.ObjectId.isValid(patientId)) return [];
    const docs = await Appointment.find({ patientId })
      .sort({ firstAppointment: 1 })
      .lean<IAppointment[]>();
    return docs.map(toDto);
  },

  async findById(id: string): Promise<AppointmentDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await Appointment.findById(id).lean<IAppointment | null>();
    return doc ? toDto(doc) : null;
  },

  async create(data: CreateAppointmentDto): Promise<AppointmentDto> {
    const doc = await Appointment.create({
      patientId: new Types.ObjectId(data.patientId),
      providerName: data.providerName,
      description: data.description,
      firstAppointment: new Date(data.firstAppointment),
      durationMinutes: data.durationMinutes,
      recurrence: recurrenceToModel(data.recurrence) ?? null,
    });
    return toDto(doc);
  },

  async update(id: string, data: UpdateAppointmentDto): Promise<AppointmentDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const update: Record<string, unknown> = {};
    if (data.providerName !== undefined) update.providerName = data.providerName;
    if (data.description !== undefined) update.description = data.description;
    if (data.firstAppointment !== undefined) update.firstAppointment = new Date(data.firstAppointment);
    if (data.durationMinutes !== undefined) update.durationMinutes = data.durationMinutes;
    if (data.recurrence !== undefined) update.recurrence = recurrenceToModel(data.recurrence);

    const doc = await Appointment.findByIdAndUpdate(id, update, { new: true }).lean<IAppointment | null>();
    return doc ? toDto(doc) : null;
  },

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await Appointment.findByIdAndDelete(id).lean<IAppointment | null>();
    return result !== null;
  },
};
