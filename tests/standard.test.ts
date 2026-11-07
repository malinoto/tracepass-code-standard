import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";
import { standard, standardRules } from "../typescript/eslint.standard.mjs";

const fixture = (name: string) => fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url));

async function lint(name: string) {
  const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: standard });
  const [result] = await eslint.lintFiles([fixture(name)]);
  return result.messages.map((m) => m.ruleId);
}

// The contract. Removing a rule from the standard is a decision, so it must change this
// list too; reading the list from the code would let a deletion pass unnoticed.
const CONTRACT = [
  "@typescript-eslint/no-explicit-any",
  "@typescript-eslint/no-unused-vars",
  "@typescript-eslint/no-require-imports",
  "no-empty",
  "no-alert",
  "@typescript-eslint/explicit-module-boundary-types",
  "@typescript-eslint/explicit-member-accessibility",
  "@typescript-eslint/prefer-readonly",
  "@typescript-eslint/member-ordering",
];

describe("@tracepass/code-standard ESLint rules", () => {
  it("sets exactly the contracted rules", () => {
    expect(Object.keys(standardRules).sort()).toEqual([...CONTRACT].sort());
  });

  it("reports every contracted rule on the violation fixtures", async () => {
    const fixtures = [
      "violations.ts",
      "inferred-return.ts",
      "class-implicit-access.ts",
      "class-not-readonly.ts",
      "class-member-order.ts",
    ];
    const reported = (await Promise.all(fixtures.map(lint))).flat();
    for (const rule of CONTRACT) {
      expect(reported, `rule ${rule} did not fire`).toContain(rule);
    }
  });

  it("reports nothing on code that follows the standard", async () => {
    expect(await lint("clean.ts")).toEqual([]);
    expect(await lint("class-clean.ts")).toEqual([]);
  });

  it("accepts require/module/__dirname in a .cjs file, which is CommonJS by definition", async () => {
    expect(await lint("commonjs.cjs")).toEqual([]);
  });

  it("includes the type-aware rules: a forgotten await is reported", async () => {
    expect(await lint("violations.ts")).toContain("@typescript-eslint/no-floating-promises");
  });

  it("requires an exported function to state its return type", async () => {
    expect(await lint("inferred-return.ts")).toEqual(["@typescript-eslint/explicit-module-boundary-types"]);
  });

  it("requires a JSDoc on every exported function", async () => {
    expect(await lint("missing-jsdoc.ts")).toEqual(["jsdoc/require-jsdoc"]);
  });

  it("keeps types out of JSDoc in TypeScript (the signature holds them)", async () => {
    expect(await lint("jsdoc-types-in-ts.ts")).toEqual(["jsdoc/no-types"]);
  });

  it("requires types in JSDoc in plain JavaScript (they are its only types)", async () => {
    expect(await lint("jsdoc-untyped.mjs")).toEqual(["jsdoc/require-param-type"]);
  });

  it("requires every class member to state its accessibility", async () => {
    expect(await lint("class-implicit-access.ts")).toEqual(["@typescript-eslint/explicit-member-accessibility"]);
  });

  it("requires readonly on a private field that is never reassigned", async () => {
    expect(await lint("class-not-readonly.ts")).toEqual(["@typescript-eslint/prefer-readonly"]);
  });

  it("requires class members in one fixed order", async () => {
    expect(await lint("class-member-order.ts")).toEqual(["@typescript-eslint/member-ordering"]);
  });

  it("still forbids require in TypeScript", async () => {
    expect(await lint("violations.ts")).toContain("@typescript-eslint/no-require-imports");
  });

  it("sets every one of its own rules at error severity", () => {
    for (const [rule, setting] of Object.entries(standardRules)) {
      const level = Array.isArray(setting) ? setting[0] : setting;
      expect(level, rule).toBe("error");
    }
  });
});

describe("@tracepass/code-standard TypeScript settings", () => {
  it("keeps strict mode on", () => {
    const raw = readFileSync(new URL("../typescript/tsconfig.standard.json", import.meta.url), "utf8");
    const json: unknown = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ""));
    expect(json).toMatchObject({ compilerOptions: { strict: true } });
  });
});
