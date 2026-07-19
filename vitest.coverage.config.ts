/**
 * Root vitest coverage configuration.
 * Run with: pnpm test:coverage
 * Aggregates coverage across all packages into coverage/
 */
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["packages/*/src/**/*.test.ts", "packages/*/src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["packages/*/src/**/*.ts", "packages/*/src/**/*.tsx"],
      exclude: [
        "packages/*/src/**/*.test.ts",
        "packages/*/src/**/*.test.tsx",
        "packages/*/src/index.ts",
        "**/dist/**",
        "**/node_modules/**",
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 70,
        statements: 75,
      },
      all: true,
    },
  },
});
