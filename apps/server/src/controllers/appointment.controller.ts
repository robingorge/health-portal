import type { Request, Response, NextFunction } from "express";
import { appointmentService, PatientNotFoundError } from "../services/appointment.service.js";
import { getParam } from "../utils/params.js";

export const appointmentController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.create(req.body);
      res.status(201).json({ success: true, data: appointment });
    } catch (err) {
      if (err instanceof PatientNotFoundError) {
        res.status(404).json({ success: false, error: { code: "PATIENT_NOT_FOUND", message: err.message } });
        return;
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.update(getParam(req.params.id), req.body);
      if (!appointment) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Appointment not found" } });
        return;
      }
      res.json({ success: true, data: appointment });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await appointmentService.remove(getParam(req.params.id));
      if (!deleted) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Appointment not found" } });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
