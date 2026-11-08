/**
 * Fails when node_modules does not hold the versions package-lock.json names.
 *
 * A check runs against whatever is installed. After a branch bumps a dependency,
 * a checkout that has not run `npm install` checks the old package and passes
 * while proving nothing, and npm can report "up to date" while its hidden
 * lockfile names a version the files on disk are not. The pre-push hook runs
 * this before `npm run check`; a repo's own check script can run it too.
 *
 *   node check-installed-deps.mjs [projectDir]
 */
import fs from "node:fs";
import path from "node:path";

/**
 * The direct dependencies whose installed version differs from the lockfile.
 * @param {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string> }} pkg package.json
 * @param {{ packages?: Record<string, { version?: string }> }} lock package-lock.json
 * @param {(name: string) => string | undefined} installedVersion the version in node_modules, or undefined when absent
 * @returns {{ name: string, locked: string, installed: string }[]} one entry per mismatch
 */
export function staleDependencies(pkg, lock, installedVersion) {
  const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  return names.flatMap((name) => {
    const locked = lock.packages?.[`node_modules/${name}`]?.version;
    if (locked === undefined) return [];
    const installed = installedVersion(name);
    return installed === locked ? [] : [{ name, locked, installed: installed ?? "(missing)" }];
  });
}

/**
 * The version a package's own package.json in node_modules declares.
 * @param {string} dir the project directory
 * @param {string} name the package name
 * @returns {string | undefined} the version, or undefined when the package is absent
 */
export function readInstalledVersion(dir, name) {
  try {
    const file = path.join(dir, "node_modules", name, "package.json");
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return typeof parsed.version === "string" ? parsed.version : undefined;
  } catch {
    return undefined;
  }
}

if (import.meta.main) {
  const dir = path.resolve(process.argv[2] ?? ".");
  const lockFile = path.join(dir, "package-lock.json");
  if (!fs.existsSync(lockFile)) {
    console.log("no package-lock.json: nothing to compare");
    process.exit(0);
  }
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const stale = staleDependencies(read("package.json"), read("package-lock.json"), (name) =>
    readInstalledVersion(dir, name),
  );
  if (stale.length > 0) {
    for (const s of stale)
      console.error(`${s.name}: lockfile ${s.locked}, installed ${s.installed}`);
    console.error(
      "node_modules does not match package-lock.json: run npm install (if npm says it is up to date, remove the package's folder in node_modules and install again).",
    );
    process.exit(1);
  }
  console.log("node_modules matches package-lock.json");
}
