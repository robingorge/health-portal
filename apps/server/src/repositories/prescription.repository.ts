import { Types } from "mongoose";
import type {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionDto,
  RefillSchedule,
} from "@health-portal/shared";
import { Prescription, type IPrescription, type IRefillSchedule } from "../models/prescription.model.js";

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function scheduleToDto(s: IRefillSchedule | null | undefined): RefillSchedule | null {
  if (!s) return null;
  return {
    frequencyDays: s.frequencyDays,
    endDate: toDateOnly(s.endDate),
  };
}

function toDto(doc: IPrescription): PrescriptionDto {
  return {
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    medicationName: doc.medicationName,
    dosage: doc.dosage,
    quantity: doc.quantity,
    firstRefillDate: toDateOnly(doc.firstRefillDate),
    refillSchedule: scheduleToDto(doc.refillSchedule),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function scheduleToModel(s: RefillSchedule | null | undefined): IRefillSchedule | null | undefined {
  if (s === undefined) return undefined;
  if (s === null) return null;
  return {
    frequencyDays: s.frequencyDays,
    endDate: new Date(s.endDate),
  };
}

export const prescriptionRepository = {
  async findByPatientId(patientId: string): Promise<PrescriptionDto[]> {
    if (!Types.ObjectId.isValid(patientId)) return [];
    const docs = await Prescription.find({ patientId })
      .sort({ firstRefillDate: 1, medicationName: 1 })
      .lean<IPrescription[]>();
    return docs.map(toDto);
  },

  async findById(id: string): Promise<PrescriptionDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await Prescription.findById(id).lean<IPrescription | null>();
    return doc ? toDto(doc) : null;
  },

  async create(data: CreatePrescriptionDto): Promise<PrescriptionDto> {
    const doc = await Prescription.create({
      patientId: new Types.ObjectId(data.patientId),
      medicationName: data.medicationName,
      dosage: data.dosage,
      quantity: data.quantity,
      firstRefillDate: new Date(data.firstRefillDate),
      refillSchedule: scheduleToModel(data.refillSchedule) ?? null,
    });
    return toDto(doc);
  },

  async update(id: string, data: UpdatePrescriptionDto): Promise<PrescriptionDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const update: Record<string, unknown> = {};
    if (data.medicationName !== undefined) update.medicationName = data.medicationName;
    if (data.dosage !== undefined) update.dosage = data.dosage;
    if (data.quantity !== undefined) update.quantity = data.quantity;
    if (data.firstRefillDate !== undefined) update.firstRefillDate = new Date(data.firstRefillDate);
    if (data.refillSchedule !== undefined) update.refillSchedule = scheduleToModel(data.refillSchedule);

    const doc = await Prescription.findByIdAndUpdate(id, update, { new: true }).lean<IPrescription | null>();
    return doc ? toDto(doc) : null;
  },

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await Prescription.findByIdAndDelete(id).lean<IPrescription | null>();
    return result !== null;
  },
};
