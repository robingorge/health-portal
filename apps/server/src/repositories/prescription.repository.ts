import type { CreatePrescriptionDto, UpdatePrescriptionDto, PrescriptionDto } from "@health-portal/shared";

export const prescriptionRepository = {
  async findByPatientId(_patientId: string): Promise<PrescriptionDto[]> {
    throw new Error("Not implemented");
  },

  async findById(_id: string): Promise<PrescriptionDto | null> {
    throw new Error("Not implemented");
  },

  async create(_data: CreatePrescriptionDto): Promise<PrescriptionDto> {
    throw new Error("Not implemented");
  },

  async update(_id: string, _data: UpdatePrescriptionDto): Promise<PrescriptionDto | null> {
    throw new Error("Not implemented");
  },

  async remove(_id: string): Promise<boolean> {
    throw new Error("Not implemented");
  },
};
