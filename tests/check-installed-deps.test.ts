import { describe, expect, it } from "vitest";
import { staleDependencies } from "../git-hooks/check-installed-deps.mjs";

const pkg = {
  dependencies: { zod: "^4.0.0" },
  devDependencies: { vitest: "^4.0.0", "@tracepass/code-standard": "^2.0.0" },
};
const lock = {
  packages: {
    "node_modules/zod": { version: "4.1.0" },
    "node_modules/vitest": { version: "4.1.11" },
    "node_modules/@tracepass/code-standard": { version: "2.0.0" },
  },
};
const installed: Record<string, string> = {
  zod: "4.1.0",
  vitest: "4.1.11",
  "@tracepass/code-standard": "2.0.0",
};

describe("staleDependencies", () => {
  it("finds nothing when every direct dependency is installed at its locked version", () => {
    expect(staleDependencies(pkg, lock, (n) => installed[n])).toEqual([]);
  });

  it("names a dependency installed at another version", () => {
    const old: Record<string, string> = { ...installed, "@tracepass/code-standard": "1.0.0" };
    expect(staleDependencies(pkg, lock, (n) => old[n])).toEqual([
      { name: "@tracepass/code-standard", locked: "2.0.0", installed: "1.0.0" },
    ]);
  });

  it("names a dependency missing from node_modules", () => {
    expect(staleDependencies(pkg, lock, (n) => (n === "zod" ? undefined : installed[n]))).toEqual([
      { name: "zod", locked: "4.1.0", installed: "(missing)" },
    ]);
  });

  it("ignores a dependency the lockfile does not list", () => {
    const extra = { ...pkg, dependencies: { ...pkg.dependencies, "not-locked": "^1.0.0" } };
    expect(staleDependencies(extra, lock, (n) => installed[n])).toEqual([]);
  });
});
