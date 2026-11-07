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
};

/** Node and web globals our code uses, for plain .js/.mjs files (TS files need none). */
const standardGlobals = Object.fromEntries(
  [
    "process", "console", "Buffer", "URL", "URLSearchParams", "fetch", "crypto",
    "Request", "Response", "Headers", "AbortController", "TextEncoder", "TextDecoder",
    "structuredClone", "setTimeout", "clearTimeout", "setInterval", "clearInterval",
  ].map((name) => [name, "readonly"]),
);

export const standard = [
  { ignores: standardIgnores },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: standardGlobals }, rules: standardRules },
];

export default standard;
