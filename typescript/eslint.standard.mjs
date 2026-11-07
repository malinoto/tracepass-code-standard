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
};

/** Node and web globals our code uses, for plain .js/.mjs files (TS files need none). */
const standardGlobals = Object.fromEntries(
  [
    "process", "console", "Buffer", "URL", "URLSearchParams", "fetch", "crypto",
    "Request", "Response", "Headers", "AbortController", "TextEncoder", "TextDecoder",
    "structuredClone", "setTimeout", "clearTimeout", "setInterval", "clearInterval",
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
const plainJsFiles = { ...tseslint.configs.disableTypeChecked, files: ["**/*.js", "**/*.mjs", "**/*.cjs"] };

export const standard = [
  { ignores: standardIgnores },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  typeAware,
  { languageOptions: { globals: standardGlobals }, rules: standardRules },
  plainJsFiles,
  commonJsFiles,
];

export default standard;
