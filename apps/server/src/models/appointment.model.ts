import mongoose, { Schema, type Document, type Types } from "mongoose";
import { RECURRENCE_FREQUENCIES } from "@health-portal/shared";

export interface IRecurrenceRule {
  frequency: string;
  endDate: Date;
}

export interface IAppointment extends Document {
  patientId: Types.ObjectId;
  providerName: string;
  description: string;
  firstAppointment: Date;
  durationMinutes: number;
  recurrence: IRecurrenceRule | null;
  createdAt: Date;
  updatedAt: Date;
}

const recurrenceRuleSchema = new Schema<IRecurrenceRule>(
  {
    frequency: { type: String, required: true, enum: RECURRENCE_FREQUENCIES },
    endDate: { type: Date, required: true },
  },
  { _id: false },
);

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    providerName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    firstAppointment: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    recurrence: { type: recurrenceRuleSchema, default: null },
  },
  { timestamps: true },
);

// Index: fetch all appointments for a patient — the most common query
appointmentSchema.index({ patientId: 1 });

// Index: sort/filter by date for occurrence expansion windows
appointmentSchema.index({ patientId: 1, firstAppointment: 1 });

export const Appointment = mongoose.model<IAppointment>("Appointment", appointmentSchema);
