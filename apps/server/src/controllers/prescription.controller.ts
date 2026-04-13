import type { Request, Response, NextFunction } from "express";
import { prescriptionService } from "../services/prescription.service.js";
import { getParam } from "../utils/params.js";

export const prescriptionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const prescription = await prescriptionService.create(req.body);
      res.status(201).json({ success: true, data: prescription });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const prescription = await prescriptionService.update(getParam(req.params.id), req.body);
      if (!prescription) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Prescription not found" } });
        return;
      }
      res.json({ success: true, data: prescription });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await prescriptionService.remove(getParam(req.params.id));
      if (!deleted) {
        res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Prescription not found" } });
        return;
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
