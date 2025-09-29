import mergeTexts from "./mergeTexts.txt?raw";
import getLatestMetricValue from "./getLatestMetricValue.txt?raw";
import extractList from "./extractList.txt?raw";
import groupMetricData from "./groupMetricData.txt?raw";
import getMetricDisplayNames from "./getMetricDisplayNames.txt?raw";

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
