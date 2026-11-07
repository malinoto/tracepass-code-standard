# @tracepass/code-standard

The shared coding standard for every TracePass TypeScript repository: one set of ESLint
rules and one set of TypeScript compiler settings, installed as a package so every
repository checks its code the same way.

## Use

```bash
npm install --save-dev @tracepass/code-standard eslint @eslint/js typescript-eslint
```

`eslint.config.mjs`:

```js
import { standard } from "@tracepass/code-standard/eslint";

export default [
  ...standard,
  // Framework or repo layers go AFTER the standard. They may add rules;
  // they never switch off or downgrade a rule the standard sets.
];
```

`tsconfig.json`:

```jsonc
{
  "extends": "@tracepass/code-standard/tsconfig.json",
  "compilerOptions": {
    // Only what this repo's runtime needs: module system, JSX, paths…
  }
}
```

## What it enforces

The base is `@eslint/js` recommended plus `typescript-eslint`'s `strictTypeChecked` and
`stylisticTypeChecked`, applied as shipped (type-aware rules use each repository's own
`tsconfig`; plain `.js` / `.mjs` / `.cjs` files skip them). The rules evolve from real
cases: when code shows a rule getting in the way or missing something, the change is
decided and made here, with its reason next to the rule.

On top of that base:

| Rule | Why |
|---|---|
| `@typescript-eslint/no-explicit-any` | No untyped escape hatch: use a real type, or `unknown` and a check |
| `@typescript-eslint/no-unused-vars` | Unused code is removed; a deliberately unused binding starts with `_` |
| `@typescript-eslint/no-require-imports` | ES modules only |
| `no-empty` (empty `catch` included) | An empty block hides a failure; a deliberate one says why in a comment |
| `no-alert` | No browser `alert`/`confirm`/`prompt` |
| `@typescript-eslint/explicit-module-boundary-types` | An exported function or method states its parameter and return types: its contract is written down, not inferred |

A `.cjs` file is CommonJS by definition, so there (and only there) `require`, `module`,
`exports`, `__dirname` and `__filename` are allowed.

TypeScript: `strict`, `forceConsistentCasingInFileNames`, `skipLibCheck`.

The tests prove each rule fires on a planted violation and that clean code passes.

## Other languages

`go/`, `python/` and `bash/` hold the equivalent settings when a TracePass service in
that language needs them. They are not part of the npm package.

## Releasing

Push a `vX.Y.Z` tag matching `package.json`; `.github/workflows/publish.yml` publishes to
npm with provenance through GitHub's OIDC trusted publishing.

Versioning: repositories depend on `^x.y.z`, so minor and patch releases arrive through
`npm update`. **A new or tightened rule, or anything that can fail existing code, is a
major release**, taken per repository with `npm install @tracepass/code-standard@<major>`.
Minor: a loosened ignore or a new optional export. Patch: comments and documentation.

## Licence

Apache-2.0.
