import { createProviderClass } from "@next-core/utils/general";
import { Options } from "prettier";
import { formatCode } from "../utils/parseSuiteAst";

export async function prettierCode(
  source: string,
  options?: Options
): Promise<unknown> {
  return formatCode(source, options);
}

customElements.define(
  "ui-test.prettier-code",
  createProviderClass(prettierCode)
);
