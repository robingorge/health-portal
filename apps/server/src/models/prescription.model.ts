import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IRefillSchedule {
  frequencyDays: number;
  endDate: Date;
}

export interface IPrescription extends Document {
  patientId: Types.ObjectId;
  medicationName: string;
  dosage: string;
  quantity: number;
  firstRefillDate: Date;
  refillSchedule: IRefillSchedule | null;
  createdAt: Date;
  updatedAt: Date;
}

const refillScheduleSchema = new Schema<IRefillSchedule>(
  {
    frequencyDays: { type: Number, required: true, min: 1, max: 365 },
    endDate: { type: Date, required: true },
  },
  { _id: false },
);

const prescriptionSchema = new Schema<IPrescription>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    medicationName: { type: String, required: true, trim: true },
    dosage: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    firstRefillDate: { type: Date, required: true },
    refillSchedule: { type: refillScheduleSchema, default: null },
  },
  { timestamps: true },
);

// Index: fetch all prescriptions for a patient
prescriptionSchema.index({ patientId: 1 });

// Index: sort/filter by refill date for expansion windows
prescriptionSchema.index({ patientId: 1, firstRefillDate: 1 });

export const Prescription = mongoose.model<IPrescription>("Prescription", prescriptionSchema);
