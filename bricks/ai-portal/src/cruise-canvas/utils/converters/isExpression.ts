export function isExpression(value: string) {
  return /^\s*<%=?\s+/.test(value) && /\s+%>\s*$/.test(value);
}
