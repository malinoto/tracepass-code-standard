// Equivalent spellings the standard does not choose between: nothing may be reported.
/** A record with a label. */
export type Labelled = { label: string };

/**
 * Collects the labels.
 * @param items - The labelled records.
 * @returns The labels, in order.
 */
export function labels(items: Array<Labelled>): string[] {
  const out: string[] = [];
  for (const item of items) out.push(item["label"]);
  return out;
}
