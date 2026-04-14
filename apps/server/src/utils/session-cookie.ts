/**
 * Session cookie configuration, shared by the auth controller (issues the
 * cookie on login, clears it on logout) and the requireAuth middleware
 * (reads it on each portal request).
 *
 * HttpOnly: blocks JS access. SameSite=Lax: blocks cross-site POSTs while
 * allowing top-level navigations. `Secure` should be added in production
 * once the server is exclusively served over HTTPS.
 */

export const SESSION_COOKIE_NAME = "hp_session";

/** 7 days. Keep in sync with the session TTL in authService. */
export const SESSION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_COOKIE_MAX_AGE_MS,
};

/**
 * Read a named cookie from a raw `Cookie` header. Hand-rolled to avoid a
 * `cookie-parser` dependency for a single use case.
 */
export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) {
      const raw = part.slice(eq + 1).trim();
      // A malformed percent-escape (e.g. `%E0%A4%A`) throws URIError.
      // Treat that as "no valid cookie" so auth flows respond with 401
      // rather than bubbling a 500 through the global error handler.
      try {
        return decodeURIComponent(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Extract the session id from either the session cookie (primary) or the
 * `X-Session-Id` header (fallback, convenient for curl / automated tests).
 */
export function readSessionId(req: { headers: Record<string, unknown> }): string | null {
  const cookieHeader = req.headers.cookie;
  const fromCookie = readCookie(typeof cookieHeader === "string" ? cookieHeader : undefined, SESSION_COOKIE_NAME);
  if (fromCookie) return fromCookie;
  const header = req.headers["x-session-id"];
  if (typeof header === "string" && header.trim().length > 0) return header.trim();
  return null;
}
