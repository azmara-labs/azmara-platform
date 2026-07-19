/**
 * Asserts that all required environment variables are present at startup.
 * Call this once at the entry point of each app/service.
 *
 * Node-only (reads process.env) - not exported from the browser entry point.
 */
export function validateEnv(required: string[]): void {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[azmara/security] Missing required environment variables: ${missing.join(", ")}\n  Copy .env.example to .env and fill in the missing values.`,
    );
  }
}
