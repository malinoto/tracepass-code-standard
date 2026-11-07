/**
 * Installs the standard's pre-push hook into the current git checkout.
 *
 * Run from a repo's `prepare` script. Outside a git checkout (a production
 * `npm ci`, an unpacked tarball) it does nothing. A pre-push hook that this
 * package did not write is left alone, with a warning.
 */
import { execFileSync } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MARKER = "tracepass-code-standard pre-push hook";
const source = join(dirname(fileURLToPath(import.meta.url)), "pre-push");

let hooksDir;
try {
  hooksDir = execFileSync("git", ["rev-parse", "--git-path", "hooks"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
} catch {
  process.exit(0); // not a git checkout: nothing to install
}

const target = resolve(hooksDir, "pre-push");
if (existsSync(target) && !readFileSync(target, "utf8").includes(MARKER)) {
  console.warn(
    `! ${target} exists and was not installed by @tracepass/code-standard; left unchanged`,
  );
  process.exit(0);
}
mkdirSync(hooksDir, { recursive: true });
copyFileSync(source, target);
chmodSync(target, 0o755);
console.log("✓ installed the pre-push hook (npm run check on pushes to the default branch)");
