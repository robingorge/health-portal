import type { CreatePatientDto, UpdatePatientDto, PatientDto } from "@health-portal/shared";

export const patientRepository = {
  async findAll(): Promise<PatientDto[]> {
    throw new Error("Not implemented");
  },

  async findById(_id: string): Promise<PatientDto | null> {
    throw new Error("Not implemented");
  },

  async findByEmail(_email: string): Promise<PatientDto | null> {
    throw new Error("Not implemented");
  },

  async create(_data: CreatePatientDto): Promise<PatientDto> {
    throw new Error("Not implemented");
  },

  async update(_id: string, _data: UpdatePatientDto): Promise<PatientDto | null> {
    throw new Error("Not implemented");
  },
};
