import type { ContextConf } from "@next-core/types";
import type { Variable } from "@next-shared/tsx-parser";

export function convertVariables(variables: Variable[]): ContextConf[] {
  return variables.map(({ name, value }) => ({
    name,
    value,
    track: true,
  }));
}
