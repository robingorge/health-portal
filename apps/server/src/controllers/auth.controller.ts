import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  readSessionId,
} from "../utils/session-cookie.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      if (!result) {
        res.status(401).json({
          success: false,
          error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
        });
        return;
      }

      res.cookie(SESSION_COOKIE_NAME, result.sessionId, SESSION_COOKIE_OPTIONS);
      res.json({ success: true, data: result.patient });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = readSessionId(req);
      if (sessionId) {
        authService.destroySession(sessionId);
      }
      // Always clear the cookie, even if no session was present, so a stale
      // client cookie is removed on the next round-trip.
      res.clearCookie(SESSION_COOKIE_NAME, { path: SESSION_COOKIE_OPTIONS.path });
      res.json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = readSessionId(req);
      if (!sessionId) {
        res.status(401).json({
          success: false,
          error: { code: "NOT_AUTHENTICATED", message: "Not authenticated" },
        });
        return;
      }

      const patient = await authService.getPatientBySession(sessionId);
      if (!patient) {
        // Session id was presented but is invalid/expired; clear the cookie
        // to prevent the client from re-sending it on every request.
        res.clearCookie(SESSION_COOKIE_NAME, { path: SESSION_COOKIE_OPTIONS.path });
        res.status(401).json({
          success: false,
          error: { code: "NOT_AUTHENTICATED", message: "Invalid or expired session" },
        });
        return;
      }

      res.json({ success: true, data: patient });
    } catch (err) {
      next(err);
    }
  },
};
