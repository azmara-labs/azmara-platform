import { describe, expect, it } from "vitest";
import { validate, z } from "./validate.js";

describe("validate", () => {
  const Schema = z.object({
    name: z.string().min(1),
    age: z.number().nonnegative(),
  });

  it("returns parsed data on valid input", () => {
    const result = validate(Schema, { name: "Aroha", age: 25 });
    expect(result).toEqual({ name: "Aroha", age: 25 });
  });

  it("throws on missing required field", () => {
    expect(() => validate(Schema, { name: "Aroha" })).toThrow("Validation failed");
  });

  it("throws on wrong type", () => {
    expect(() => validate(Schema, { name: "Aroha", age: "old" })).toThrow("Validation failed");
  });

  it("throws on empty string when min(1)", () => {
    expect(() => validate(Schema, { name: "", age: 25 })).toThrow("Validation failed");
  });

  it("throws on negative number when nonnegative()", () => {
    expect(() => validate(Schema, { name: "Aroha", age: -1 })).toThrow("Validation failed");
  });

  it("does not leak raw input in error message", () => {
    const secret = "sk_live_supersecretkey";
    let errorMsg = "";
    try {
      validate(Schema, { name: secret, age: "not-a-number" });
    } catch (e) {
      errorMsg = (e as Error).message;
    }
    // Error should describe the field issue, not echo back the value
    expect(errorMsg).not.toContain(secret);
  });
});
