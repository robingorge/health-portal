import { Types } from "mongoose";
import type { PatientDto } from "@health-portal/shared";
import { Patient, type IPatient } from "../models/patient.model.js";
import { DuplicateEmailError, isDuplicateKeyError } from "../utils/errors.js";

function toDto(doc: IPatient): PatientDto {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    dateOfBirth: doc.dateOfBirth.toISOString().slice(0, 10),
    bloodType: doc.bloodType,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const patientRepository = {
  async findAll(): Promise<PatientDto[]> {
    const docs = await Patient.find().sort({ lastName: 1, firstName: 1 }).lean<IPatient[]>();
    return docs.map(toDto);
  },

  async findById(id: string): Promise<PatientDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await Patient.findById(id).lean<IPatient | null>();
    return doc ? toDto(doc) : null;
  },

  async findByEmail(email: string): Promise<PatientDto | null> {
    const doc = await Patient.findOne({ email: email.toLowerCase() }).lean<IPatient | null>();
    return doc ? toDto(doc) : null;
  },

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    bloodType: string;
    passwordHash: string;
  }): Promise<PatientDto> {
    try {
      const doc = await Patient.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: new Date(data.dateOfBirth),
        bloodType: data.bloodType,
        passwordHash: data.passwordHash,
      });
      return toDto(doc);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new DuplicateEmailError(data.email);
      }
      throw err;
    }
  },

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: string;
      bloodType?: string;
      passwordHash?: string;
    },
  ): Promise<PatientDto | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const update: Record<string, unknown> = {};
    if (data.firstName !== undefined) update.firstName = data.firstName;
    if (data.lastName !== undefined) update.lastName = data.lastName;
    if (data.email !== undefined) update.email = data.email;
    if (data.phone !== undefined) update.phone = data.phone;
    if (data.dateOfBirth !== undefined) update.dateOfBirth = new Date(data.dateOfBirth);
    if (data.bloodType !== undefined) update.bloodType = data.bloodType;
    if (data.passwordHash !== undefined) update.passwordHash = data.passwordHash;

    try {
      const doc = await Patient.findByIdAndUpdate(id, update, { new: true }).lean<IPatient | null>();
      return doc ? toDto(doc) : null;
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        throw new DuplicateEmailError(data.email ?? "");
      }
      throw err;
    }
  },
};
