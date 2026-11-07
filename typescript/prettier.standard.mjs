// TracePass coding standard — the shared Prettier settings for TypeScript and JavaScript.
//
// Published as @tracepass/code-standard. A repo uses it with `"prettier":
// "@tracepass/code-standard/prettier"` in package.json and formats code files only
// (ts, tsx, js, mjs, cjs); JSON, Markdown and generated files are left alone. Repos whose
// ecosystem prescribes its own formatting (the n8n node: n8n's settings) keep theirs.
//
// Chosen to change the least in existing code: double quotes, semicolons, two-space
// indent, which the code already uses; a line width of 100 rewraps far fewer lines than
// Prettier's default 80.

/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  endOfLine: "lf",
};

export default config;
