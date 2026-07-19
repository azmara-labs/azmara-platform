/**
 * @azmr/ai — sandbox-fallback.ts
 *
 * Node.js vm-module fallback sandbox for development environments where
 * isolated-vm cannot be compiled (e.g. Windows without VS2022 C++ workload).
 *
 * ⚠️  IMPORTANT — security comparison:
 *   isolated-vm  → TRUE isolation: separate V8 heap, no Node APIs accessible
 *   vm (this)    → PARTIAL isolation: same process, some builtins accessible
 *
 * This fallback is ONLY for local development and CI without native build tools.
 * Production deployments MUST use isolated-vm (sandbox.ts).
 *
 * The fallback is selected automatically via sandbox-runner.ts — never use
 * this file directly in production code.
 */

import vm from "node:vm";
import type { SandboxResult } from "./sandbox-types.js";

const TIMEOUT_MS = 5_000;

/**
 * Run code in a Node.js vm context.
 * Provides syntactic isolation and timeout enforcement.
 * Does NOT prevent access to Node.js internals via prototype chains.
 */
export async function runInFallbackSandbox(code: string): Promise<SandboxResult> {
  try {
    // Create a completely empty context — no globals at all
    const sandbox = Object.create(null) as Record<string, unknown>;
    vm.createContext(sandbox);

    const script = new vm.Script(code, {
      filename: "sandbox-input.js",
      // Syntax check happens at compile time — caught before execution
    });

    const output = script.runInContext(sandbox, {
      timeout: TIMEOUT_MS,
      // Prevent infinite loops from blocking the event loop
      breakOnSigint: true,
    });

    return { success: true, output };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: message.includes("timed out") ? `Execution timed out after ${TIMEOUT_MS}ms` : message,
    };
  }
}
