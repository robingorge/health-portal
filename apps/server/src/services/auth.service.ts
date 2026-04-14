import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import type { PatientDto } from "@health-portal/shared";
import { patientRepository } from "../repositories/patient.repository.js";

/**
 * In-memory session store: sessionId -> { patientId, expiresAt }.
 *
 * The interface (`createSession`, `getSession`, `destroySession`) matches
 * what a Redis / Mongo TTL-backed store would expose, so the store can be
 * swapped without touching middleware or controllers. Sessions are lost on
 * process restart — acceptable for this phase; a persistent store is the
 * natural follow-up.
 */
type SessionRecord = {
  patientId: string;
  expiresAt: number;
};

const sessions = new Map<string, SessionRecord>();

/** 7 days. Keep in sync with SESSION_COOKIE_MAX_AGE_MS. */
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function newSessionId(): string {
  return randomBytes(32).toString("hex");
}

export type LoginResult = {
  patient: PatientDto;
  sessionId: string;
};

export const authService = {
  /**
   * Verify credentials against the stored bcrypt hash and, on success,
   * mint a new session. Returns null on any failure (unknown email OR
   * wrong password) — the controller maps that to a generic 401 so we
   * don't leak which half was wrong.
   */
  async login(email: string, password: string): Promise<LoginResult | null> {
    const auth = await patientRepository.findAuthByEmail(email);
    if (!auth) return null;

    const ok = await bcrypt.compare(password, auth.passwordHash);
    if (!ok) return null;

    const patient = await patientRepository.findById(auth.id);
    if (!patient) return null; // raced with delete

    const sessionId = newSessionId();
    sessions.set(sessionId, {
      patientId: auth.id,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });
    return { patient, sessionId };
  },

  /**
   * Sync lookup used by `requireAuth` on every request. Returns the
   * patientId bound to the session or null (unknown or expired). Expired
   * entries are deleted lazily.
   */
  getSession(sessionId: string): string | null {
    const record = sessions.get(sessionId);
    if (!record) return null;
    if (record.expiresAt < Date.now()) {
      sessions.delete(sessionId);
      return null;
    }
    return record.patientId;
  },

  destroySession(sessionId: string): void {
    sessions.delete(sessionId);
  },

  /**
   * Resolve a session directly to the patient DTO. Used by GET /api/auth/me.
   */
  async getPatientBySession(sessionId: string): Promise<PatientDto | null> {
    const patientId = authService.getSession(sessionId);
    if (!patientId) return null;
    return patientRepository.findById(patientId);
  },
};
