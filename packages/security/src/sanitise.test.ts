import { describe, expect, it } from "vitest";
import { assertSafeIdentifier, sanitiseForLog } from "./sanitise.js";

describe("assertSafeIdentifier", () => {
  it("passes valid identifiers", () => {
    expect(() => assertSafeIdentifier("customers")).not.toThrow();
    expect(() => assertSafeIdentifier("order_items")).not.toThrow();
    expect(() => assertSafeIdentifier("_private")).not.toThrow();
    expect(() => assertSafeIdentifier("Column1")).not.toThrow();
  });

  it("blocks SQL injection attempts", () => {
    expect(() => assertSafeIdentifier("users; DROP TABLE users")).toThrow();
    expect(() => assertSafeIdentifier("users--")).toThrow();
    expect(() => assertSafeIdentifier("1_invalid")).toThrow();
    expect(() => assertSafeIdentifier("has space")).toThrow();
    expect(() => assertSafeIdentifier("has'quote")).toThrow();
    expect(() => assertSafeIdentifier('has"quote')).toThrow();
  });

  it("blocks empty string", () => {
    expect(() => assertSafeIdentifier("")).toThrow();
  });

  it("blocks identifier over 64 chars", () => {
    const long = "a".repeat(65);
    expect(() => assertSafeIdentifier(long)).toThrow();
  });

  it("error message does not echo the full injection payload", () => {
    const payload = "users; DROP TABLE users; --";
    let msg = "";
    try {
      assertSafeIdentifier(payload);
    } catch (e) {
      msg = (e as Error).message;
    }
    // Should be truncated/sanitised, not the full payload
    expect(msg.length).toBeLessThan(payload.length + 100);
  });
});

describe("sanitiseForLog", () => {
  it("passes normal strings through", () => {
    expect(sanitiseForLog("hello world")).toBe("hello world");
  });

  it("strips null bytes", () => {
    expect(sanitiseForLog("hello\0world")).toBe("helloworld");
  });

  it("flattens newlines to prevent log injection", () => {
    const result = sanitiseForLog("line1\nline2\r\nline3");
    expect(result).not.toContain("\n");
    expect(result).not.toContain("\r");
  });

  it("truncates at maxLength", () => {
    const long = "a".repeat(300);
    const result = sanitiseForLog(long, 200);
    expect(result.length).toBeLessThanOrEqual(202); // 200 + ellipsis char
    expect(result).toContain("…");
  });
});
