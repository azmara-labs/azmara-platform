import { describe, expect, it } from "vitest";
import { assertSafePath } from "./path-safety.js";

describe("assertSafePath", () => {
  it("passes paths within allowed base", () => {
    expect(() => assertSafePath("D:/data/app.db", "D:/data")).not.toThrow();
  });

  it("blocks path traversal with ../", () => {
    expect(() => assertSafePath("D:/data/../etc/passwd", "D:/data")).toThrow();
  });

  it("blocks absolute escape from base", () => {
    expect(() => assertSafePath("C:/Windows/System32", "D:/data")).toThrow();
  });

  it("blocks null byte injection", () => {
    expect(() => assertSafePath("D:/data/file\0.db", "D:/data")).toThrow();
  });
});
