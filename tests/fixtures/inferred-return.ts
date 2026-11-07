// An exported function whose return type is only inferred: the one thing wrong here.
export function score(items: string[]) {
  return items.length;
}
