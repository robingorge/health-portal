import type { PatientDto } from "@health-portal/shared";

export const authService = {
  async login(_email: string, _password: string): Promise<PatientDto | null> {
    throw new Error("Not implemented");
  },

  async getPatientBySession(_sessionId: string): Promise<PatientDto | null> {
    throw new Error("Not implemented");
  },
};
