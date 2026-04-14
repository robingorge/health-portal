import type { PatientDto } from "@health-portal/shared";
import { api } from "./client";

export const authApi = {
  login(email: string, password: string): Promise<PatientDto> {
    return api.post<PatientDto>("/auth/login", { email, password });
  },

  logout(): Promise<void> {
    return api.post<void>("/auth/logout");
  },

  me(): Promise<PatientDto> {
    return api.get<PatientDto>("/auth/me");
  },
};
