import mergeTexts from "../../../src/helpers/mergeTexts.ts?raw";
import getLatestMetricValue from "../../../src/helpers/getLatestMetricValue.ts?raw";
import extractList from "../../../src/helpers/extractList.ts?raw";
import groupMetricData from "../../../src/helpers/groupMetricData.ts?raw";
import getMetricDisplayNames from "../../../src/helpers/getMetricDisplayNames.ts?raw";

let helperFunctions: Map<string, string> | undefined;

export function getHelperFunctions() {
  if (!helperFunctions) {
    helperFunctions = new Map([
      ["_helper_mergeTexts", fixFunctionSource(mergeTexts)],
      ["_helper_getLatestMetricValue", fixFunctionSource(getLatestMetricValue)],
      ["_helper_extractList", fixFunctionSource(extractList)],
      ["_helper_groupMetricData", fixFunctionSource(groupMetricData)],
      [
        "_helper_getMetricDisplayNames",
        fixFunctionSource(getMetricDisplayNames),
      ],
    ]);
  }
  return helperFunctions;
}

function fixFunctionSource(source: string): string {
  return source.replace(/^export /m, "").replace(/^import [^\n]+\n/gm, "");
}
