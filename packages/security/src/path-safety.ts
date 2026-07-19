import path from "node:path";
import { sanitiseForLog } from "./sanitise.js";

/**
 * Validates that a file path stays within an allowed base directory.
 * Prevents path traversal attacks.
 *
 * Node-only (uses node:path) - not exported from the browser entry point.
 */
export function assertSafePath(filePath: string, allowedBase: string): void {
  if (filePath.includes("\0")) {
    throw new Error(`[azmara/security] Null byte detected in path: "${sanitiseForLog(filePath)}"`);
  }
  const resolved = path.resolve(filePath);
  const base = path.resolve(allowedBase);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    throw new Error(
      `[azmara/security] Path traversal attempt detected: "${sanitiseForLog(filePath)}"`,
    );
  }
}
