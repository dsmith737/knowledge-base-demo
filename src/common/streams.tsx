export function recursiveFields(
  relationshipField: string,
  dataFields: string[],
  depth: number = 1
): string[] {
  const out = [];
  for (let i = 1; i <= depth; i++) {
    const base = `${relationshipField}.`.repeat(i);
    for (const field of dataFields) {
      out.push(`${base}${field}`);
    }
  }

  return out;
}
