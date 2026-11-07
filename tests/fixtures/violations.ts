// Every rule the standard sets, broken once. The test asserts each one is reported, so a
// rule that stops biting fails the build instead of passing silently.
const fs = require("node:fs");

export function load(input: any): string {
  const unused = 1;
  try {
    return String(fs.readFileSync(input));
  } catch {}
  alert("failed");
  return "";
}

async function save(): Promise<void> {}

export function persist(): void {
  save(); // forgotten await: a failure here would vanish
}
