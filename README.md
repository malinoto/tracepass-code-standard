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

On top of `@eslint/js` recommended and `typescript-eslint` recommended:

| Rule | Why |
|---|---|
| `@typescript-eslint/no-explicit-any` | No untyped escape hatch: use a real type, or `unknown` and a check |
| `@typescript-eslint/no-unused-vars` | Unused code is removed; a deliberately unused binding starts with `_` |
| `@typescript-eslint/no-require-imports` | ES modules only |
| `no-empty` (empty `catch` included) | An empty block hides a failure; a deliberate one says why in a comment |
| `no-alert` | No browser `alert`/`confirm`/`prompt` |

TypeScript: `strict`, `forceConsistentCasingInFileNames`, `skipLibCheck`.

The tests prove each rule fires on a planted violation and that clean code passes.

## Other languages

`go/`, `python/` and `bash/` hold the equivalent settings when a TracePass service in
that language needs them. They are not part of the npm package.

## Releasing

Push a `vX.Y.Z` tag matching `package.json`; `.github/workflows/publish.yml` publishes to
npm with provenance through GitHub's OIDC trusted publishing. A change to the rules is a
new version, and each repository moves to it like any other dependency.

## Licence

Apache-2.0.
