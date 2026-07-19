import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock isolated-vm as unavailable so tests run on any machine
vi.mock("isolated-vm", () => {
  throw new Error("not installed");
});

// Ensure fallback is selected
beforeEach(() => {
  // Reset the cached value between tests
  vi.resetModules();
});

describe("sandbox-runner — fallback sandbox (isolated-vm unavailable)", () => {
  it("executes simple arithmetic", async () => {
    const { runSandbox } = await import("./sandbox-runner.js");
    const result = await runSandbox("1 + 2");
    // vm sandbox returns the value of the last expression
    expect(result.success).toBe(true);
    expect(result._sandboxEngine).toBe("fallback");
  });

  it("catches syntax errors", async () => {
    const { runSandbox } = await import("./sandbox-runner.js");
    const result = await runSandbox("const x = {{{");
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("catches runtime errors", async () => {
    const { runSandbox } = await import("./sandbox-runner.js");
    const result = await runSandbox("null.property");
    expect(result.success).toBe(false);
  });

  it("blocks access to global process", async () => {
    const { runSandbox } = await import("./sandbox-runner.js");
    // process is not in our empty sandbox context — should throw ReferenceError
    const result = await runSandbox("process.env.SECRET");
    expect(result.success).toBe(false);
  });

  it("enforces timeout on infinite loops", async () => {
    const { runSandbox } = await import("./sandbox-runner.js");
    const result = await runSandbox("while(true){}");
    expect(result.success).toBe(false);
    expect(result.error?.toLowerCase()).toMatch(/timed out|script execution timed out/);
  }, 10_000);
});
