/**
 * @azmr/ai — adapters/http.ts
 *
 * HTTP ModelAdapter — connects to any OpenAI-compatible API endpoint.
 * Use this when an AI backend (Ollama, OpenAI, Anthropic via compat layer,
 * or a custom Azmara AI service) is available.
 *
 * Features:
 * - Exponential backoff retry on transient failures (429, 503, network errors)
 * - Hard timeout per request
 * - Structured context prompt — passes Azmara primitive info to the model
 * - No secrets in logs — API key redacted in all error messages
 *
 * Usage:
 *   const adapter = createHttpAdapter({
 *     endpoint: "https://api.openai.com/v1/chat/completions",
 *     apiKey: process.env.OPENAI_API_KEY!,
 *     model: "gpt-4o",
 *   });
 *   const result = await autoFix(filePath, allowedBase, adapter);
 */

import type { AzmaraContext, ModelAdapter } from "../fix.js";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HttpAdapterOptions {
  /** Full URL of the chat completions endpoint. */
  endpoint: string;
  /** Bearer token / API key. Never logged. */
  apiKey: string;
  /** Model name (e.g. "gpt-4o", "llama3", "claude-3-5-sonnet-20241022"). */
  model: string;
  /** Request timeout in ms. Default: 30_000. */
  timeoutMs?: number;
  /** Max retry attempts on transient errors. Default: 3. */
  maxRetries?: number;
  /** Base delay for exponential backoff in ms. Default: 1_000. */
  retryBaseMs?: number;
  /** Max tokens for the completion. Default: 2048. */
  maxTokens?: number;
}

// ─── System prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a code-fix assistant for Azmara Platform — a TypeScript reactive runtime.

Your task: Given a source file and its analysis findings, suggest the minimal safe fix.

Rules you must follow:
- Return ONLY the corrected TypeScript source code — no markdown fences, no preamble
- Preserve all existing comments, imports, and formatting style exactly
- Never introduce: eval(), new Function(), dangerouslySetInnerHTML, exec(), or fs operations without assertSafePath()
- Never concatenate user input into SQL strings — always use parameterised queries
- If you cannot safely fix the issue, respond with exactly: NO_FIX_AVAILABLE

After the code, add:
EXPLANATION: <one sentence describing what you changed>
CONFIDENCE: <high|medium|low>`;

// ─── Retry helpers ───────────────────────────────────────────────────────────

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: { maxRetries: number; retryBaseMs: number; timeoutMs: number },
): Promise<Response> {
  const { maxRetries, retryBaseMs, timeoutMs } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });

      if (!RETRYABLE_STATUS.has(response.status) || attempt === maxRetries) {
        return response;
      }

      // Respect Retry-After header if present (rate limit)
      const retryAfter = response.headers.get("Retry-After");
      const delay = retryAfter
        ? Number(retryAfter) * 1000
        : retryBaseMs * 2 ** attempt + Math.random() * 200; // jitter

      await sleep(delay);
    } catch (err) {
      if (attempt === maxRetries) throw err;
      // Network error — retry with backoff
      await sleep(retryBaseMs * 2 ** attempt + Math.random() * 200);
    } finally {
      clearTimeout(timer);
    }
  }

  // TypeScript: unreachable, but satisfies return type
  throw new Error("[azmr/ai] fetchWithRetry exhausted retries");
}

// ─── Adapter factory ─────────────────────────────────────────────────────────

/**
 * Create an HTTP ModelAdapter that calls an OpenAI-compatible API.
 */
export function createHttpAdapter(options: HttpAdapterOptions): ModelAdapter {
  const {
    endpoint,
    apiKey,
    model,
    timeoutMs = 30_000,
    maxRetries = 3,
    retryBaseMs = 1_000,
    maxTokens = 2048,
  } = options;

  if (!apiKey) throw new Error("[azmr/ai] createHttpAdapter: apiKey is required");
  if (!endpoint) throw new Error("[azmr/ai] createHttpAdapter: endpoint is required");

  return {
    async suggest(context: AzmaraContext): Promise<string> {
      const userMessage = buildUserMessage(context);

      const body = JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.1, // low temperature for deterministic, conservative fixes
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      });

      let response: Response;
      try {
        response = await fetchWithRetry(
          endpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Redacted in any catch block — never interpolate into logs
              Authorization: `Bearer ${apiKey}`,
            },
            body,
          },
          { maxRetries, retryBaseMs, timeoutMs },
        );
      } catch (err) {
        // Never include apiKey in error messages
        throw new Error(
          `[azmr/ai] HTTP request failed after ${maxRetries} retries: ${err instanceof Error ? err.message : "network error"}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          `[azmr/ai] API error ${response.status} from ${redactUrl(endpoint)}`,
        );
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message: string };
      };

      if (data.error) {
        throw new Error(`[azmr/ai] API returned error: ${data.error.message}`);
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("[azmr/ai] API returned empty content");
      }

      return content.trim();
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUserMessage(context: AzmaraContext): string {
  const primitiveList =
    context.primitives.length > 0
      ? `Azmara primitives in use: ${context.primitives.join(", ")}`
      : "No Azmara primitives detected";

  return `File: ${context.filePath}
${primitiveList}

Source:
${context.source}`;
}

/** Remove auth tokens from URLs for safe error logging. */
function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return "[invalid url]";
  }
}
