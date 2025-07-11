import { isExpression } from "./isExpression.js";

export function fixDataSource(data: string | object, extraAccessor?: string) {
  // TODO: fix data source with extra accessor
  const accessor = extraAccessor ?? "";
  return typeof data !== "string"
    ? data
    : isExpression(data)
      ? data
      : data.includes("CTX.")
        ? `<%= ${data}${accessor} %>`
        : `<%= CTX[${JSON.stringify(data)}]${accessor} %>`;
}
