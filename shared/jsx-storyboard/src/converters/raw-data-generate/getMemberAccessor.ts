const VALID_IDENTIFIER_REG = /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u;

export function getMemberAccessor(property: unknown): string {
  const propertyStr = String(property);
  return VALID_IDENTIFIER_REG.test(propertyStr)
    ? `.${propertyStr}`
    : `[${JSON.stringify(propertyStr)}]`;
}
