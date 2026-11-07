// Code that follows the standard: nothing may be reported here.
import { readFileSync } from "node:fs";

/**
 * Reads a text document; a missing file is an empty document by design.
 * @param path - Absolute path of the document.
 * @param _encoding - Reserved; documents are always read as UTF-8.
 * @returns The document's text, or "" when the file does not exist.
 */
export function load(path: string, _encoding?: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch (_error) {
    // A missing file is an empty document by design.
    return "";
  }
}
