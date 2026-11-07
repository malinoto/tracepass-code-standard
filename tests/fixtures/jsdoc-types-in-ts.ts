// Types repeated inside a JSDoc in a TypeScript file: the one thing wrong here.
/**
 * Counts the items.
 * @param {string[]} items - The items to count.
 * @returns How many there are.
 */
export function score(items: string[]): number {
  return items.length;
}
