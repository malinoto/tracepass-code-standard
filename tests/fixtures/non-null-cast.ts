// A cast that removes "maybe undefined" must not be redirected to `!`, which the
// standard forbids (no-non-null-assertion): nothing may be reported here.
/**
 * Reads a value the caller has already checked.
 * @param value - A value that may be undefined.
 * @returns The value as text.
 */
export function asText(value: string | undefined): string {
  return value as string;
}
