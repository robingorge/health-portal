import type { Request, Response, NextFunction } from "express";

export const portalController = {
  async summary(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: get patient from session, expand occurrences for next 7 days
      res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
    } catch (err) {
      next(err);
    }
  },

  async appointments(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: get patient from session, expand appointment occurrences up to 3 months
      res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
    } catch (err) {
      next(err);
    }
  },

  async prescriptions(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: get patient from session, return full prescription records
      res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
    } catch (err) {
      next(err);
    }
  },

  async refills(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: get patient from session, expand refill dates up to 3 months
      res.status(501).json({ success: false, error: { code: "NOT_IMPLEMENTED", message: "Not implemented" } });
    } catch (err) {
      next(err);
    }
  },
};
