import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { readSessionId } from "../utils/session-cookie.js";

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
 * Session-scoped auth middleware for the patient portal. Resolves the
 * session id (cookie first, `X-Session-Id` header fallback) to a patientId
 * via `authService` and stamps it on the request. Responds 401 with the
 * shared API envelope when no valid session is present.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = readSessionId(req);
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
