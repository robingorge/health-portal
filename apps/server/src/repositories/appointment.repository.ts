import type { CreateAppointmentDto, UpdateAppointmentDto, AppointmentDto } from "@health-portal/shared";

export const appointmentRepository = {
  async findByPatientId(_patientId: string): Promise<AppointmentDto[]> {
    throw new Error("Not implemented");
  },

  async findById(_id: string): Promise<AppointmentDto | null> {
    throw new Error("Not implemented");
  },

  async create(_data: CreateAppointmentDto): Promise<AppointmentDto> {
    throw new Error("Not implemented");
  },

  async update(_id: string, _data: UpdateAppointmentDto): Promise<AppointmentDto | null> {
    throw new Error("Not implemented");
  },

  async remove(_id: string): Promise<boolean> {
    throw new Error("Not implemented");
  },
};
