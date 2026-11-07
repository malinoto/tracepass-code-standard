// An exported function whose return type is only inferred: the one thing wrong here.
/**
 * Counts the items.
 * @param items - The items to count.
 * @returns How many there are.
 */
export function score(items: string[]) {
  return items.length;
}
