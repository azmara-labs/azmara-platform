import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHttpAdapter } from "./http.js";

// Minimal context fixture
const ctx = {
  filePath: "src/app.ts",
  source: "const x = eval('1');",
  primitives: ["Signal"],
};

describe("createHttpAdapter — construction", () => {
  it("throws if apiKey is empty", () => {
    expect(() =>
      createHttpAdapter({ endpoint: "http://localhost", apiKey: "", model: "gpt-4o" }),
    ).toThrow("apiKey is required");
  });

  it("throws if endpoint is empty", () => {
    expect(() => createHttpAdapter({ endpoint: "", apiKey: "key", model: "gpt-4o" })).toThrow(
      "endpoint is required",
    );
  });
});

describe("createHttpAdapter — suggest()", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the endpoint and returns suggestion", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({
        choices: [
          { message: { content: "const x = 1;\nEXPLANATION: Removed eval\nCONFIDENCE: high" } },
        ],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    const adapter = createHttpAdapter({
      endpoint: "https://api.example.com/v1/chat/completions",
      apiKey: "sk-test",
      model: "gpt-4o",
    });

    const result = await adapter.suggest(ctx);
    expect(result).toContain("const x = 1;");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("does not include apiKey in error message on HTTP failure", async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({}),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    const adapter = createHttpAdapter({
      endpoint: "https://api.example.com/v1/chat/completions",
      apiKey: "sk-super-secret-key",
      model: "gpt-4o",
      maxRetries: 0,
    });

    await expect(adapter.suggest(ctx)).rejects.toThrow(/API error 400/);
    // Key must NOT appear in the thrown error message
    try {
      await adapter.suggest(ctx);
    } catch (e) {
      expect(String(e)).not.toContain("sk-super-secret-key");
    }
  });

  it("retries on 503 and succeeds on second attempt", async () => {
    const fail = {
      ok: false,
      status: 503,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({}),
    };
    const success = {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "fixed code" } }],
      }),
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce(fail as unknown as Response)
      .mockResolvedValueOnce(success as unknown as Response);

    const adapter = createHttpAdapter({
      endpoint: "https://api.example.com/v1/chat/completions",
      apiKey: "sk-test",
      model: "gpt-4o",
      maxRetries: 2,
      retryBaseMs: 1, // fast for tests
    });

    const result = await adapter.suggest(ctx);
    expect(result).toBe("fixed code");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("throws after exhausting all retries", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const adapter = createHttpAdapter({
      endpoint: "https://api.example.com/v1/chat/completions",
      apiKey: "sk-test",
      model: "gpt-4o",
      maxRetries: 2,
      retryBaseMs: 1,
    });

    await expect(adapter.suggest(ctx)).rejects.toThrow("HTTP request failed");
  });
});
