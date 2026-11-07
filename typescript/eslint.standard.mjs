// TracePass coding standard — the shared ESLint rules for every TypeScript repo.
//
// Published as @tracepass/code-standard. A repo's eslint.config imports `standard` from
// "@tracepass/code-standard/eslint" and adds framework or tool layers AFTER it (Next.js,
// the n8n node rules, repo-only rules). A repo may add rules; it never switches off or
// downgrades one set here.
//
// Peer dependencies of the consuming repo: eslint, @eslint/js, typescript-eslint.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";

/** Paths no repo lints: dependencies and build output. */
export const standardIgnores = ["**/node_modules/**", "**/dist/**", "**/coverage/**"];

/**
 * The rules this standard sets on top of the recommended sets. Exported so a test can
 * prove a repo's final config keeps every one of them at this severity.
 */
export const standardRules = {
  // No untyped escape hatch: give the value a real type (or `unknown` + a check).
  "@typescript-eslint/no-explicit-any": "error",
  // Unused code is removed; a deliberately unused binding starts with `_`.
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
  ],
  // ES modules only.
  "@typescript-eslint/no-require-imports": "error",
  // An empty block hides a failure; a deliberate one says why in a comment.
  "no-empty": ["error", { allowEmptyCatch: false }],
  // No browser alert/confirm/prompt: use the product's own UI.
  "no-alert": "error",
  // Owner rule: an exported function or method states its parameter and return types,
  // so its contract is written down rather than inferred from the body.
  "@typescript-eslint/explicit-module-boundary-types": "error",
  // Owner decision: strict OOP. Every class member states its accessibility, and a field
  // never reassigned after construction is readonly. (A fixed member order was tried and
  // dropped: it catches no bug and cannot be autofixed.)
  "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: "explicit" }],
  "@typescript-eslint/prefer-readonly": "error",
  // Owner decision: a fixed set of options is a list of allowed values (`as const`) and the
  // union type derived from it, never a TypeScript enum: the value is the same plain string
  // in the database, the API and the code, and the same list feeds the input schema.
  "no-restricted-syntax": [
    "error",
    {
      selector: "TSEnumDeclaration",
      message: "Use a list of allowed values (`as const`) and its union type, not an enum.",
    },
  ],
};

/**
 * Rules from the base switched OFF, each with its reason (owner decision). Stylistic rules
 * that only choose between two equivalent spellings catch no bug. (prefer-nullish-coalescing
 * stays on: `count || 10` turning a real 0 into 10 is a bug.)
 */
export const relaxedRules = {
  "@typescript-eslint/array-type": "off", // T[] vs Array<T>: equivalent
  "@typescript-eslint/dot-notation": "off", // obj.key vs obj["key"]: equivalent
  "@typescript-eslint/consistent-type-definitions": "off", // interface vs type: equivalent here
  // It rewrites `x as T` into `x!`, which no-non-null-assertion forbids: the two
  // contradict, and the ban is the rule that keeps code honest (owner decision).
  "@typescript-eslint/non-nullable-type-assertion-style": "off",
};

/** Node and web globals our code uses, for plain .js/.mjs files (TS files need none). */
const standardGlobals = Object.fromEntries(
  [
    "process",
    "console",
    "Buffer",
    "URL",
    "URLSearchParams",
    "fetch",
    "crypto",
    "Request",
    "Response",
    "Headers",
    "AbortController",
    "TextEncoder",
    "TextDecoder",
    "structuredClone",
    "setTimeout",
    "clearTimeout",
    "setInterval",
    "clearInterval",
  ].map((name) => [name, "readonly"]),
);

/**
 * A `.cjs` file is CommonJS by definition (Node treats it so whatever the package type),
 * so `require`, `module`, `exports`, `__dirname` and `__filename` are correct there.
 * This block applies only to `.cjs`; every other file keeps the ES-modules rule.
 */
const commonJsFiles = {
  files: ["**/*.cjs"],
  languageOptions: {
    sourceType: "commonjs",
    globals: Object.fromEntries(
      ["require", "module", "exports", "__dirname", "__filename"].map((n) => [n, "readonly"]),
    ),
  },
  rules: {
    "@typescript-eslint/no-require-imports": "off",
    // Node wraps a CommonJS file in a function, so its top-level bindings are module
    // scoped and cannot redeclare a global (e.g. `const crypto = require("node:crypto")`).
    "no-redeclare": ["error", { builtinGlobals: false }],
  },
};

/**
 * The base (owner decision): ESLint recommended + typescript-eslint strict and stylistic,
 * both type-aware. Strict includes recommended and adds the rules that need the type
 * checker (forgotten awaits, misused promises, impossible conditions, `any` flowing into
 * typed code…); stylistic adds consistency. `projectService` finds each file's tsconfig on
 * its own. Plain .js / .mjs / .cjs files have no TypeScript types, so the type-aware rules
 * are switched off for them only. Each rule is then reviewed; any rule this standard
 * configures or switches off says why, next to it.
 */
const typeAware = { languageOptions: { parserOptions: { projectService: true } } };
const plainJsFiles = {
  ...tseslint.configs.disableTypeChecked,
  files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
  rules: {
    ...tseslint.configs.disableTypeChecked.rules,
    // Plain JavaScript has no annotation syntax: its explicit types are the JSDoc types,
    // which the JSDoc rules below require for every export.
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
};

/**
 * JSDoc (owner decision): every EXPORTED function, method, class, interface, type alias
 * and enum carries a JSDoc with a description, every parameter and the return value.
 * Types inside JSDoc only in plain .js/.mjs/.cjs files, where TypeScript checks them; in
 * .ts files the types live in the signature (a second copy would drift unchecked) and the
 * JSDoc holds the meaning.
 */
const exportedNeedJsdoc = {
  "jsdoc/require-jsdoc": [
    "error",
    {
      publicOnly: true,
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: true,
        FunctionExpression: true,
      },
      contexts: ["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSEnumDeclaration"],
    },
  ],
  "jsdoc/require-description": "error",
  "jsdoc/require-param-description": "error",
  "jsdoc/require-returns-description": "error",
};
const jsdocTs = {
  ...jsdoc.configs["flat/recommended-typescript-error"],
  files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
  rules: { ...jsdoc.configs["flat/recommended-typescript-error"].rules, ...exportedNeedJsdoc },
};
const jsdocJs = {
  ...jsdoc.configs["flat/recommended-error"],
  files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
  rules: { ...jsdoc.configs["flat/recommended-error"].rules, ...exportedNeedJsdoc },
};

/**
 * Framework files (owner decision): React components (.tsx) and Next.js route, page and
 * metadata files. The framework fixes their shape and return types, and their names say
 * what they are, so a required JSDoc or an explicit return type there repeats the name and
 * adds nothing. The JSDoc correctness rules still apply when a JSDoc is written.
 */
export const frameworkFiles = [
  "**/*.tsx",
  "**/app/**/route.ts",
  "**/app/**/{sitemap,robots,manifest}.ts",
  "**/{middleware,proxy,instrumentation}.ts",
];
const frameworkRelief = {
  files: frameworkFiles,
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "jsdoc/require-jsdoc": "off",
    "jsdoc/require-param": "off",
    "jsdoc/require-returns": "off",
    "jsdoc/require-description": "off",
  },
};

export const standard = [
  { ignores: standardIgnores },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  typeAware,
  { languageOptions: { globals: standardGlobals }, rules: { ...standardRules, ...relaxedRules } },
  plainJsFiles,
  commonJsFiles,
  jsdocTs,
  jsdocJs,
  frameworkRelief,
];

export default standard;
