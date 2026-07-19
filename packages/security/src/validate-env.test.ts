import { describe, expect, it } from "vitest";
import { validateEnv } from "./validate-env.js";

describe("validateEnv", () => {
  it("passes when all required vars are set", () => {
    process.env.TEST_VAR_A = "value";
    expect(() => validateEnv(["TEST_VAR_A"])).not.toThrow();
    delete process.env.TEST_VAR_A;
  });

  it("throws listing missing vars", () => {
    delete process.env.MISSING_VAR_X;
    expect(() => validateEnv(["MISSING_VAR_X"])).toThrow("MISSING_VAR_X");
  });

  it("throws only for missing vars, not present ones", () => {
    process.env.PRESENT_VAR = "set";
    delete process.env.ABSENT_VAR;
    expect(() => validateEnv(["PRESENT_VAR", "ABSENT_VAR"])).toThrow("ABSENT_VAR");
    delete process.env.PRESENT_VAR;
  });
});
