import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";

/**
 * Attach `patientId` to the Express `Request` so downstream handlers can
 * read the authenticated patient without re-parsing session headers.
 */
declare module "express" {
  interface Request {
    patientId?: string;
  }
}

/**
 * Session-scoped auth middleware for the patient portal.
 *
 * Reads the session id from the `X-Session-Id` header and resolves it to a
 * patientId via the in-memory session store in `authService`. Responds with
 * 401 when no session is presented or the session is invalid/expired.
 *
 * Note: header-based sessions are a deliberate simplification of the
 * design doc's "session-based auth" — a cookie-based flow can replace the
 * header read here without touching any portal code.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers["x-session-id"];
    const sessionId = typeof header === "string" ? header.trim() : "";

    if (!sessionId) {
      res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "Not authenticated" },
      });
      return;
    }

    const patientId = authService.getSession(sessionId);
    if (!patientId) {
      res.status(401).json({
        success: false,
        error: { code: "NOT_AUTHENTICATED", message: "Invalid or expired session" },
      });
      return;
    }

    req.patientId = patientId;
    next();
  } catch (err) {
    next(err);
  }
}
