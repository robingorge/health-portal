import type { Request, Response, NextFunction } from "express";
import { portalService, PatientNotFoundError } from "../services/portal.service.js";

/**
 * The `requireAuth` middleware guarantees `req.patientId` is set before any
 * portal handler runs; this helper narrows the type for the controller body.
 */
function sessionPatientId(req: Request): string {
  // Safe: requireAuth rejects the request before this controller runs.
  return req.patientId as string;
}

function handlePatientNotFound(err: unknown, res: Response, next: NextFunction): void {
  if (err instanceof PatientNotFoundError) {
    // The session references a patient that no longer exists — treat as
    // auth failure rather than 404, since the client's session is stale.
    res.status(401).json({
      success: false,
      error: { code: "NOT_AUTHENTICATED", message: "Session patient no longer exists" },
    });
    return;
  }
  next(err);
}

export const portalController = {
  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await portalService.getSummary(sessionPatientId(req));
      res.json({ success: true, data });
    } catch (err) {
      handlePatientNotFound(err, res, next);
    }
  },

  async appointments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await portalService.getAppointmentOccurrences(sessionPatientId(req));
      res.json({ success: true, data });
    } catch (err) {
      handlePatientNotFound(err, res, next);
    }
  },

  async prescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await portalService.getPrescriptions(sessionPatientId(req));
      res.json({ success: true, data });
    } catch (err) {
      handlePatientNotFound(err, res, next);
    }
  },

  async refills(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await portalService.getRefillOccurrences(sessionPatientId(req));
      res.json({ success: true, data });
    } catch (err) {
      handlePatientNotFound(err, res, next);
    }
  },
};
