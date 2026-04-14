import { randomBytes } from "node:crypto";
import type { PatientDto } from "@health-portal/shared";
import { patientRepository } from "../repositories/patient.repository.js";

/**
 * Lightweight in-memory session store: sessionId -> patientId.
 *
 * This is intentionally simple for the current phase. A production
 * deployment would swap this for a signed cookie + persistent store
 * (Redis, Mongo TTL collection, etc.) without changing the interface
 * consumed by `requireAuth` and the portal controller.
 */
const sessions = new Map<string, string>();

export const authService = {
  /**
   * Password verification and credential lookup are not yet implemented.
   * The controller wires this up and returns 401 when it resolves to null.
   */
  async login(_email: string, _password: string): Promise<PatientDto | null> {
    throw new Error("Not implemented");
  },

  /**
   * Issue a new opaque session id for the given patient. Returned to the
   * client by the (future) login handler; clients echo it back on each
   * portal request via the `X-Session-Id` header.
   */
  createSession(patientId: string): string {
    const sessionId = randomBytes(32).toString("hex");
    sessions.set(sessionId, patientId);
    return sessionId;
  },

  /**
   * Sync lookup used by the `requireAuth` middleware on every request.
   * Returns the patientId bound to the session, or null if unknown.
   */
  getSession(sessionId: string): string | null {
    return sessions.get(sessionId) ?? null;
  },

  destroySession(sessionId: string): void {
    sessions.delete(sessionId);
  },

  /**
   * Resolve a session directly to the patient DTO. Kept async-returning
   * because it does a DB lookup; callers that only need the id should use
   * `getSession` to avoid the round-trip.
   */
  async getPatientBySession(sessionId: string): Promise<PatientDto | null> {
    const patientId = sessions.get(sessionId);
    if (!patientId) return null;
    return patientRepository.findById(patientId);
  },
};
