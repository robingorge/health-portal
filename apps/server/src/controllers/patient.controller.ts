import type { Request, Response, NextFunction } from "express";
import { patientService, DuplicateEmailError } from "../services/patient.service.js";
import { prescriptionService } from "../services/prescription.service.js";
import { appointmentService } from "../services/appointment.service.js";
import { getParam } from "../utils/params.js";

export const patientController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const patients = await patientService.getAll();
      res.json({ success: true, data: patients });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.getById(getParam(req.params.id));
      if (!patient) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found" } });
        return;
      }
      res.json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.create(req.body);
      res.status(201).json({ success: true, data: patient });
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        res.status(409).json({ success: false, error: { code: "DUPLICATE_EMAIL", message: err.message } });
        return;
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.update(getParam(req.params.id), req.body);
      if (!patient) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found" } });
        return;
      }
      res.json({ success: true, data: patient });
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        res.status(409).json({ success: false, error: { code: "DUPLICATE_EMAIL", message: err.message } });
        return;
      }
      next(err);
    }
  },

  async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.getByPatientId(getParam(req.params.id));
      if (appointments === null) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found" } });
        return;
      }
      res.json({ success: true, data: appointments });
    } catch (err) {
      next(err);
    }
  },

  async getPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const prescriptions = await prescriptionService.getByPatientId(getParam(req.params.id));
      if (prescriptions === null) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Patient not found" } });
        return;
      }
      res.json({ success: true, data: prescriptions });
    } catch (err) {
      next(err);
    }
  },
};
