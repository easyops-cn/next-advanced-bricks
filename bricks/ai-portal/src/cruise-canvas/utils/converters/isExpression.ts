export function isExpression(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\s*<%=?\s+/.test(value) &&
    /\s+%>\s*$/.test(value)
  );
}
