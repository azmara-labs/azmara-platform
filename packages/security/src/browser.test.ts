import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));

// Guards against the exact bug in issue #10: a Node-only import (fs, path,
// crypto, etc.) sneaking into a file that browser.ts re-exports from, which
// breaks client bundlers even if the Node-only export itself is unused.
describe("browser.ts source graph", () => {
  it("re-exports only from files with no node: imports", () => {
    const source = fs.readFileSync(path.join(dir, "browser.ts"), "utf-8");
    const reExportedFiles = [...source.matchAll(/from "\.\/(.+)\.js"/g)].map((m) => `${m[1]}.ts`);
    expect(reExportedFiles.length).toBeGreaterThan(0);

    for (const file of reExportedFiles) {
      const contents = fs.readFileSync(path.join(dir, file), "utf-8");
      const nodeImports = [...contents.matchAll(/from "node:(\w+)"/g)].map((m) => m[1]);
      expect(nodeImports, `${file} imports Node built-ins: ${nodeImports.join(", ")}`).toEqual([]);
    }
  });
});
