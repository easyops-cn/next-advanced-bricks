import type { ContextConf } from "@next-core/types";
import type { Variable } from "../interfaces.js";

export function convertVariables(variables: Variable[]): ContextConf[] {
  return variables.map(({ name, value }) => ({
    name,
    value,
  }));
}
