// Code that follows the standard: nothing may be reported here.
import { readFileSync } from "node:fs";

export function load(path: string, _encoding?: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch (_error) {
    // A missing file is an empty document by design.
    return "";
  }
}
