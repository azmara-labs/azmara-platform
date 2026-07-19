import { z } from "zod";

export { z };

/**
 * Validates `data` against `schema` and returns the parsed, typed result.
 * Throws a structured error on failure — never leaks raw input to error messages.
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    throw new Error(`[azmara/security] Validation failed:\n  ${issues.join("\n  ")}`);
  }
  return result.data;
}
