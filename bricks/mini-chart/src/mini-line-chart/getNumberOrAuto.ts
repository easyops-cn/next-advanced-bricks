export function getNumberOrAuto(
  value: string | null | undefined,
  defaultValue: number | "auto"
): number | "auto" {
  if (value === "auto") {
    return "auto";
  }
  if (value == null) {
    return defaultValue;
  }
  // Compatible with `px` unit
  const num = Number(value.replace(/px$/, ""));
  if (!Number.isFinite(num)) {
    // eslint-disable-next-line no-console
    console.warn("Invalid number: %s, fallback to 'auto'", value);
    return "auto";
  }
  return num;
}
