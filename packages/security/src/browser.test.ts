import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));

// Node builtins that can be imported with or without the "node:" prefix.
// https://nodejs.org/api/module.html#modulebuiltinmodules
const NODE_BUILTINS = [
  "fs",
  "path",
  "crypto",
  "os",
  "child_process",
  "net",
  "tls",
  "http",
  "https",
  "stream",
  "buffer",
  "url",
  "util",
  "events",
  "dns",
  "cluster",
  "worker_threads",
];

// Node globals with no browser equivalent - these break at runtime (not build
// time), so an unused-export/tree-shaking argument doesn't cover them and a
// plain `import` scan can't see them either. This is exactly the class of bug
// that let validateEnv's `process.env` access through undetected in #10.
const NODE_GLOBALS = ["process", "Buffer", "__dirname", "__filename"];

// Strip comments before scanning for Node globals - otherwise prose that
// merely mentions "process" (e.g. a doc comment about multi-process
// deployment, or this very file's own explanation of why something is
// excluded) reads as a false-positive violation. Good enough for this
// codebase's comment style (no template literals containing "//" or "/*"
// inside comments); doesn't need to be a full parser.
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function findViolations(filePath: string, seen: Set<string>): string[] {
  if (seen.has(filePath)) return [];
  seen.add(filePath);

  const contents = fs.readFileSync(filePath, "utf-8");
  const code = stripComments(contents);
  const violations: string[] = [];

  for (const m of code.matchAll(/from "(node:)?([\w-]+)"/g)) {
    const [, nodePrefix, specifier] = m;
    if (nodePrefix || NODE_BUILTINS.includes(specifier as string)) {
      violations.push(`${path.basename(filePath)}: imports "${nodePrefix ?? ""}${specifier}"`);
    }
  }

  for (const global of NODE_GLOBALS) {
    if (new RegExp(`\\b${global}\\b`).test(code)) {
      violations.push(`${path.basename(filePath)}: references global "${global}"`);
    }
  }

  // Recurse into relative imports so a transitive Node dependency (imported
  // by a file this one imports, not directly by browser.ts) is still caught.
  for (const m of code.matchAll(/from "(\.\/[\w-]+)\.js"/g) as IterableIterator<
    RegExpMatchArray & [string, string]
  >) {
    violations.push(...findViolations(path.join(path.dirname(filePath), `${m[1]}.ts`), seen));
  }

  return violations;
}

describe("browser.ts source graph", () => {
  it("has no Node-only imports or globals anywhere in its transitive import graph", () => {
    const violations = findViolations(path.join(dir, "browser.ts"), new Set());
    expect(violations).toEqual([]);
  });
});
