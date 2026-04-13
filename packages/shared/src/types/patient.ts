export type PatientDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientDto = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodType: string;
  password: string;
};

export type UpdatePatientDto = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  bloodType?: string;
  password?: string;
};
