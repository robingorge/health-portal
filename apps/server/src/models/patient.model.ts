import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcrypt";
import { BLOOD_TYPES } from "@health-portal/shared";

const SALT_ROUNDS = 12;

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  bloodType: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const patientSchema = new Schema<IPatient>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    bloodType: { type: String, required: true, enum: BLOOD_TYPES },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

// email unique index is created by `unique: true` on the field definition

// Instance method for password comparison (used by auth service)
patientSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Static helper: hash a plain password before storing
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export const Patient = mongoose.model<IPatient>("Patient", patientSchema);
