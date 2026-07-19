/**
 * @azmr/ai — analyze.ts
 *
 * Rule-based static analyzer for Azmara source files.
 * Runs entirely locally — no external API, no network calls.
 *
 * Detects unsafe or incorrect patterns across the Azmara primitives:
 *   Signal, effect, computed, query, SQLiteAdapter, autoFix, audit logger.
 *
 * Used as the first pass in the autoFix pipeline BEFORE sending anything
 * to a ModelAdapter — cheap, fast, and catches the most common mistakes.
 */

export type Severity = "error" | "warning" | "info";

export interface AnalysisFinding {
  rule: string;
  severity: Severity;
  message: string;
  /** 1-based line number, if detectable */
  line?: number;
  /** Suggested fix hint (human-readable) */
  hint?: string;
}

export interface AnalysisResult {
  filePath: string;
  findings: AnalysisFinding[];
  /** true if any finding has severity === "error" */
  hasErrors: boolean;
  /** true if any finding has severity === "warning" */
  hasWarnings: boolean;
}

// ─── Rule definitions ───────────────────────────────────────────────────────

interface Rule {
  id: string;
  severity: Severity;
  description: string;
  /** Returns findings if the rule is violated, empty array if clean */
  check(source: string, lines: string[]): AnalysisFinding[];
}

const RULES: Rule[] = [
  // ── Security rules ───────────────────────────────────────────────────────

  {
    id: "no-eval",
    severity: "error",
    description: "eval() and new Function() are forbidden — they bypass sandbox and type safety",
    check(source, lines) {
      const findings: AnalysisFinding[] = [];
      lines.forEach((line, i) => {
        if (/\beval\s*\(/.test(line) || /new\s+Function\s*\(/.test(line)) {
          findings.push({
            rule: "no-eval",
            severity: "error",
            message: "eval() / new Function() detected — never execute dynamic code strings",
            line: i + 1,
            hint: "Use a typed function or the @azmr/ai sandbox instead",
          });
        }
      });
      return findings;
    },
  },

  {
    id: "no-sql-concat",
    severity: "error",
    description: "SQL built by string concatenation or template literal is an injection risk",
    check(_source, lines) {
      const findings: AnalysisFinding[] = [];
      lines.forEach((line, i) => {
        // Look for template literals or + concatenation that contain SQL keywords
        if (
          /`[^`]*(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE)[^`]*\$\{/i.test(line) ||
          /["'][^"']*(SELECT|INSERT|UPDATE|DELETE)[^"'"]*["']\s*\+/i.test(line)
        ) {
          findings.push({
            rule: "no-sql-concat",
            severity: "error",
            message: "SQL built with string interpolation detected — use parameterised queries",
            line: i + 1,
            hint: "Pass values as the second argument: db.rawSelect(sql, [value])",
          });
        }
      });
      return findings;
    },
  },

  {
    id: "no-dangerously-set-inner-html",
    severity: "error",
    description: "dangerouslySetInnerHTML with a non-literal value is an XSS risk",
    check(_source, lines) {
      const findings: AnalysisFinding[] = [];
      lines.forEach((line, i) => {
        if (/dangerouslySetInnerHTML\s*=\s*\{\s*\{/.test(line) && !/__html:\s*["']/.test(line)) {
          findings.push({
            rule: "no-dangerously-set-inner-html",
            severity: "error",
            message:
              "dangerouslySetInnerHTML with dynamic value detected — XSS risk",
            line: i + 1,
            hint: "Render data as text content, never as raw HTML",
          });
        }
      });
      return findings;
    },
  },

  {
    id: "no-unguarded-file-access",
    severity: "error",
    description: "fs.readFileSync/writeFileSync without assertSafePath is a path-traversal risk",
    check(source, lines) {
      const findings: AnalysisFinding[] = [];
      const hasAssertSafePath = source.includes("assertSafePath");
      if (!hasAssertSafePath) {
        lines.forEach((line, i) => {
          if (/fs\.(readFileSync|writeFileSync|appendFileSync|unlinkSync)\s*\(/.test(line)) {
            findings.push({
              rule: "no-unguarded-file-access",
              severity: "error",
              message: "File system access without assertSafePath() — path traversal risk",
              line: i + 1,
              hint:
                "Call assertSafePath(resolvedPath, allowedBase) before any file operation on user-supplied paths",
            });
          }
        });
      }
      return findings;
    },
  },

  // ── Azmara primitive rules ────────────────────────────────────────────────

  {
    id: "effect-missing-disposer",
    severity: "warning",
    description: "effect() return value (disposer) should be captured to allow cleanup",
    check(_source, lines) {
      const findings: AnalysisFinding[] = [];
      lines.forEach((line, i) => {
        // Bare effect() call — not assigned or returned
        if (/^\s*effect\s*\(/.test(line) && !/(?:const|let|var|return)\s/.test(line)) {
          findings.push({
            rule: "effect-missing-disposer",
            severity: "warning",
            message: "effect() called without capturing the disposer — memory leak risk",
            line: i + 1,
            hint: "const dispose = effect(() => { ... }); — call dispose() on cleanup",
          });
        }
      });
      return findings;
    },
  },

  {
    id: "signal-mutation-in-computed",
    severity: "error",
    description: "Calling Signal.set() inside computed() creates a reactive cycle",
    check(_source, lines) {
      const findings: AnalysisFinding[] = [];
      let insideComputed = false;
      let braceDepth = 0;
      let computedBraceStart = 0;

      lines.forEach((line, i) => {
        if (/\bcomputed\s*\(/.test(line)) {
          insideComputed = true;
          computedBraceStart = braceDepth;
        }
        if (insideComputed) {
          braceDepth += (line.match(/\{/g) ?? []).length;
          braceDepth -= (line.match(/\}/g) ?? []).length;
          if (braceDepth <= computedBraceStart && i > 0) {
            insideComputed = false;
          }
          if (/\.set\s*\(/.test(line)) {
            findings.push({
              rule: "signal-mutation-in-computed",
              severity: "error",
              message: "Signal.set() called inside computed() — this creates a reactive loop",
              line: i + 1,
              hint: "computed() should be pure — derive values, never write signals",
            });
          }
        }
      });
      return findings;
    },
  },

  {
    id: "raw-select-with-user-input",
    severity: "warning",
    description:
      "db.rawSelect() must only receive developer-authored SQL, never end-user input",
    check(_source, lines) {
      const findings: AnalysisFinding[] = [];
      lines.forEach((line, i) => {
        if (/\.rawSelect\s*\(/.test(line)) {
          // Flag if the SQL argument looks like it comes from req/query/body/params
          if (/req\.|query\.|body\.|params\.|args\[/.test(line)) {
            findings.push({
              rule: "raw-select-with-user-input",
              severity: "warning",
              message:
                "rawSelect() may be receiving user-supplied SQL — always use parameterised queries for values",
              line: i + 1,
              hint: "Pass user values as the params array, not in the SQL string",
            });
          }
        }
      });
      return findings;
    },
  },

  {
    id: "audit-log-pii",
    severity: "warning",
    description: "Audit log meta should never contain passwords, tokens, or raw PII",
    check(_source, lines) {
      const findings: AnalysisFinding[] = [];
      const piiPatterns =
        /\b(password|token|secret|apiKey|api_key|ssn|creditCard|credit_card)\b/i;
      lines.forEach((line, i) => {
        if (/audit\.log\(/.test(line) && piiPatterns.test(line)) {
          findings.push({
            rule: "audit-log-pii",
            severity: "warning",
            message: "Possible PII or credential in audit log meta",
            line: i + 1,
            hint: "Log IDs and action types only — never log secrets or sensitive values",
          });
        }
      });
      return findings;
    },
  },

  {
    id: "missing-env-validation",
    severity: "info",
    description: "Entry-point files should call validateEnv() at startup",
    check(source) {
      // Only flag files that use process.env but don't validate
      if (
        source.includes("process.env") &&
        !source.includes("validateEnv") &&
        !source.includes("validate.ts") &&
        !source.includes("@azmr/security")
      ) {
        return [
          {
            rule: "missing-env-validation",
            severity: "info",
            message:
              "process.env is accessed but validateEnv() is not called — missing vars will fail at runtime",
            hint: "Call validateEnv(['VAR1', 'VAR2']) at the top of entry-point files",
          },
        ];
      }
      return [];
    },
  },

  {
    id: "query-predicate-must-be-function",
    severity: "info",
    description: "query().where() should use arrow functions for clarity and type safety",
    check(_source, lines) {
      const findings: AnalysisFinding[] = [];
      lines.forEach((line, i) => {
        // Flag .where("string") or .where(someVariable) that isn't clearly a function
        if (/\.where\s*\(\s*["']/.test(line)) {
          findings.push({
            rule: "query-predicate-must-be-function",
            severity: "info",
            message:
              ".where() received a string — predicates must be typed functions, never string expressions",
            line: i + 1,
            hint: '.where(item => item.field === value)  not  .where("field === value")',
          });
        }
      });
      return findings;
    },
  },
];

// ─── Analyzer ───────────────────────────────────────────────────────────────

/**
 * Run all rules against a TypeScript source file.
 * Returns structured findings — safe to log, display in CLI, or pass to a ModelAdapter.
 */
export function analyzeSource(filePath: string, source: string): AnalysisResult {
  const lines = source.split("\n");
  const findings: AnalysisFinding[] = [];

  for (const rule of RULES) {
    findings.push(...rule.check(source, lines));
  }

  return {
    filePath,
    findings,
    hasErrors: findings.some((f) => f.severity === "error"),
    hasWarnings: findings.some((f) => f.severity === "warning"),
  };
}

/**
 * Format findings as a human-readable CLI report.
 */
export function formatReport(result: AnalysisResult): string {
  if (result.findings.length === 0) {
    return `✓ ${result.filePath} — no issues found`;
  }

  const lines: string[] = [`\n${result.filePath}`];

  for (const f of result.findings) {
    const icon = f.severity === "error" ? "✗" : f.severity === "warning" ? "⚠" : "ℹ";
    const loc = f.line != null ? `:${f.line}` : "";
    lines.push(`  ${icon} [${f.rule}]${loc}  ${f.message}`);
    if (f.hint) lines.push(`      → ${f.hint}`);
  }

  const counts = {
    errors: result.findings.filter((f) => f.severity === "error").length,
    warnings: result.findings.filter((f) => f.severity === "warning").length,
    info: result.findings.filter((f) => f.severity === "info").length,
  };

  lines.push(
    `\n  ${counts.errors} error(s)  ${counts.warnings} warning(s)  ${counts.info} info`,
  );
  return lines.join("\n");
}
