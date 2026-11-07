#!/bin/bash
# Lint files of a sibling repo with this standard before that repo has adopted it.
# Run from the repo's root:  bash ../tracepass-code-standard/scripts/lint-with-standard.sh <files…>
# It writes a temporary flat config next to the files (so type-aware rules find the repo's
# tsconfig) and removes it on exit. Uses this checkout's ESLint and plugins.
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
[ "$#" -gt 0 ] || { echo "usage: lint-with-standard.sh <files…>" >&2; exit 2; }
probe=".eslint-code-standard-probe.mjs"
printf 'import { standard } from "%s/typescript/eslint.standard.mjs";\nexport default standard;\n' "$here" > "$probe"
trap 'rm -f "$probe"' EXIT
"$here/node_modules/.bin/eslint" --no-config-lookup -c "$probe" "$@"
