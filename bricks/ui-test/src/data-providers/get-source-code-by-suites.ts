import { createProviderClass } from "@next-core/utils/general";
import { parseSourceCode } from "../utils/parseSuiteAst";
import { NodeItem, TransformOptions } from "../interface";

interface SourceResult {
  name: string;
  source: string;
}

export async function getSourceCodeBySuites(
  suiteDataList: NodeItem[],
  transformOptions?: TransformOptions
): Promise<SourceResult[]> {
  const sourceList = [] as SourceResult[];
  suiteDataList?.forEach((suiteData) => {
    const code = parseSourceCode(suiteData, transformOptions);

    sourceList.push({
      name: suiteData.name,
      source: code as string,
    });
  });

  return sourceList;
}

customElements.define(
  "ui-test.get-source-code-by-suites",
  createProviderClass(getSourceCodeBySuites)
);
