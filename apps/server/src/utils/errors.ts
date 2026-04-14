export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`A patient with email "${email}" already exists`);
    this.name = "DuplicateEmailError";
  }
}

/**
 * Detects MongoDB duplicate-key errors (E11000). These can surface as
 * `MongoServerError` at runtime even when Mongoose wraps the call, so we
 * duck-type on the `code` field rather than relying on instanceof.
 */
export function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: unknown }).code === 11000
  );
}
