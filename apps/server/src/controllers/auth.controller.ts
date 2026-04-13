import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const patient = await authService.login(req.body.email, req.body.password);
      if (!patient) {
        res.status(401).json({ success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });
        return;
      }
      // TODO: set session
      res.json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: destroy session
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  async me(_req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: read patient from session
      res.status(401).json({ success: false, error: { code: "NOT_AUTHENTICATED", message: "Not authenticated" } });
    } catch (err) {
      next(err);
    }
  },
};
