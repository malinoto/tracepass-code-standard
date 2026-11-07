/**
 * The shared pre-push hook, exercised on throwaway git repositories: a bare
 * remote whose default branch is `main` and a clone whose `npm run check`
 * passes or fails on demand.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const INSTALL = join(__dirname, "..", "git-hooks", "install.mjs");
const ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "Test",
  GIT_AUTHOR_EMAIL: "test@example.invalid",
  GIT_COMMITTER_NAME: "Test",
  GIT_COMMITTER_EMAIL: "test@example.invalid",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
};

let work: string;
let remote: string;

const git = (cwd: string, ...args: string[]): string =>
  execFileSync("git", args, { cwd, env: ENV, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/**
 * Pushes and reports whether git accepted it, with the hook's output.
 * @param args The `git push` arguments.
 * @returns Whether the push succeeded, and everything git and the hook printed.
 */
function push(...args: string[]): { ok: boolean; output: string } {
  const r = spawnSync("git", ["push", ...args], { cwd: work, env: ENV, encoding: "utf8" });
  return { ok: r.status === 0, output: r.stdout + r.stderr };
}

function setCheck(passes: boolean): void {
  writeFileSync(join(work, "check-result"), passes ? "pass" : "fail");
  git(work, "add", "check-result");
  git(work, "commit", "-q", "-m", passes ? "check passes" : "check fails");
}

const remoteHead = (branch: string): string => git(remote, "rev-parse", branch).trim();

beforeEach(() => {
  const root = mkdtempSync(join(tmpdir(), "code-standard-hook-"));
  remote = join(root, "remote.git");
  work = join(root, "work");
  execFileSync("git", ["init", "-q", "--bare", "-b", "main", remote], { env: ENV });
  execFileSync("git", ["clone", "-q", remote, work], { env: ENV, stdio: "ignore" });
  writeFileSync(
    join(work, "package.json"),
    JSON.stringify({ name: "x", private: true, scripts: { check: "node check.mjs" } }),
  );
  writeFileSync(
    join(work, "check.mjs"),
    'import { readFileSync } from "node:fs";\nprocess.exit(readFileSync("check-result", "utf8") === "pass" ? 0 : 1);\n',
  );
  writeFileSync(join(work, "check-result"), "pass");
  git(work, "checkout", "-q", "-b", "main");
  git(work, "add", ".");
  git(work, "commit", "-q", "-m", "init");
  git(work, "push", "-q", "origin", "main");
  execFileSync("node", [INSTALL], { cwd: work, env: ENV, stdio: "ignore" });
});

describe("pre-push hook", () => {
  it("blocks a push to the default branch when npm run check fails", () => {
    const before = remoteHead("main");
    setCheck(false);
    const r = push("origin", "main");
    expect(r.ok).toBe(false);
    expect(r.output).toContain("blocked");
    expect(remoteHead("main")).toBe(before);
  });

  it("lets a push to the default branch through when npm run check passes", () => {
    git(work, "commit", "-q", "--allow-empty", "-m", "more"); // check-result is already "pass"
    expect(push("origin", "main").ok).toBe(true);
    expect(remoteHead("main")).toBe(git(work, "rev-parse", "HEAD").trim());
  });

  it("runs nothing on a push to another branch, even with a failing check", () => {
    git(work, "checkout", "-q", "-b", "feature");
    setCheck(false);
    expect(push("origin", "feature").ok).toBe(true);
  });

  it("refuses when the checkout has uncommitted changes", () => {
    git(work, "commit", "-q", "--allow-empty", "-m", "more");
    writeFileSync(join(work, "check-result"), "pass-but-uncommitted");
    const r = push("origin", "main");
    expect(r.ok).toBe(false);
    expect(r.output).toContain("uncommitted changes");
  });

  it("refuses to push a commit other than HEAD", () => {
    git(work, "commit", "-q", "--allow-empty", "-m", "first");
    const first = git(work, "rev-parse", "HEAD").trim();
    git(work, "commit", "-q", "--allow-empty", "-m", "second");
    const r = push("origin", `${first}:refs/heads/main`);
    expect(r.ok).toBe(false);
    expect(r.output).toContain("check out the commit you push");
  });
});

describe("install.mjs", () => {
  it("leaves a pre-push hook it did not write unchanged", () => {
    const hook = join(work, ".git", "hooks", "pre-push");
    writeFileSync(hook, "#!/bin/sh\nexit 0\n");
    chmodSync(hook, 0o755);
    execFileSync("node", [INSTALL], { cwd: work, env: ENV, stdio: "ignore" });
    expect(readFileSync(hook, "utf8")).toBe("#!/bin/sh\nexit 0\n");
  });

  it("does nothing outside a git checkout", () => {
    const plain = mkdtempSync(join(tmpdir(), "code-standard-nogit-"));
    const r = spawnSync("node", [INSTALL], {
      cwd: plain,
      env: { ...ENV, GIT_CEILING_DIRECTORIES: tmpdir() },
    });
    expect(r.status).toBe(0);
    expect(existsSync(join(plain, ".git"))).toBe(false);
  });
});
