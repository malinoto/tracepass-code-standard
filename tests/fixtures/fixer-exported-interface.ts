// `eslint --fix` must not invent a comment: an exported interface with no JSDoc is reported,
// and the author writes the description.
export interface Shape {
  side: number;
}

/** Wrapped description that
 * ends here. */
export type Size = number;
