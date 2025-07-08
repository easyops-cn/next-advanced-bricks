import { isExpression } from "./isExpression.js";

export function fixDataSource(data: string | object) {
  return typeof data !== "string"
    ? data
    : isExpression(data)
      ? data
      : data.includes("CTX.")
        ? `<%= ${data} %>`
        : `<%= CTX[${JSON.stringify(data)}] %>`;
}
