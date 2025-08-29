import type { ContextConf } from "@next-core/types";
import { pipes } from "@easyops-cn/brick-next-pipes";
import type { ConvertResult } from "../interfaces.js";
import type { ConvertViewOptions } from "../interfaces.js";
import { withBox } from "./withBox.js";
import { convertDataSources } from "./convertDataSources.js";
import { convertVariables } from "./convertVariables.js";
import type { ConstructedView } from "../interfaces.js";
import { convertComponent } from "./convertComponent.js";

const BUILTIN_FUNCTIONS: ContextConf[] = [
  {
    name: "__builtin_fn_mergeTexts",
    value: mergeTexts,
  },
  {
    name: "__builtin_fn_getLatestMetricValue",
    value: getLatestMetricValue,
  },
  {
    name: "__builtin_fn_extractList",
    value: extractList,
  },
  {
    name: "__builtin_fn_groupMetricData",
    value: groupMetricData,
  },
  {
    name: "__builtin_fn_getMetricDisplayNames",
    value: getMetricDisplayNames,
  },
];

export async function convertJsx(
  result: ConstructedView,
  options: ConvertViewOptions
): Promise<ConvertResult> {
  const context: ContextConf[] = [
    ...convertDataSources(result.dataSources ?? []),
    ...convertVariables(result.variables ?? []),
    ...(result.withContexts
      ? Object.entries(result.withContexts).map(([name, value]) => ({
          name,
          value,
        }))
      : []),
    ...BUILTIN_FUNCTIONS,
  ];

  const children = (
    await Promise.all(
      result.components.map((component) =>
        convertComponent(component, result, options)
      )
    )
  ).flat();

  const needBox = result.components.every((component) =>
    [
      "Form",
      "Descriptions",
      "Button",
      "eo-form",
      "eo-descriptions",
      "eo-button",
      "form",
      "descriptions",
      "button",
    ].includes(component.name)
  );

  return {
    brick: {
      brick: "eo-content-layout",
      children: needBox ? [withBox(children, options)] : children,
    },
    context,
  };
}

function mergeTexts(
  ...items: (
    | { type: "text"; text: string }
    | { type: "expression"; value: unknown }
  )[]
): string {
  const texts: string[] = [];
  for (const item of items) {
    if (item.type === "text") {
      texts.push(item.text.trim());
    } else {
      texts.push(mergeValuesAsText(item.value));
    }
  }
  return texts.join("");
}

function mergeValuesAsText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(mergeValuesAsText).join("");
  }
  const type = typeof value;
  if (type === "string" || type === "number") {
    return String(value);
  }
  if (type === "object" && value !== null) {
    throw new Error("Can not render object as text");
  }
  return "";
}

function getLatestMetricValue(
  list: Record<string, any>[] | undefined,
  {
    metric,
    precision,
  }: { metric: { id: string; unit: string }; precision?: number }
) {
  const value = list?.findLast?.((item) => item[metric.id] != null)?.[
    metric.id
  ];
  const unit = metric.unit === "load" ? "" : metric.unit;
  return pipes.unitFormat(value, unit, precision).join("");
}

function extractList<T = unknown>(data: T[] | { list: T[] }): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.list;
}

function groupMetricData(list: Record<string, any>[], groupField: string) {
  if (!list || !Array.isArray(list) || list.length === 0) {
    return [];
  }
  const grouped = new Map<
    string,
    { group: string; list: Record<string, any>[] }
  >();
  for (const item of list) {
    const key = item[groupField];
    let groupedList = grouped.get(key);
    if (!groupedList) {
      grouped.set(key, (groupedList = { group: key, list: [] }));
    }
    groupedList.list.push(item);
  }
  return Array.from(grouped.values());
}

function getMetricDisplayNames(
  displayNameList:
    | { metric_name: string; metric_display_name: string }[]
    | undefined,
  metricNames: string[]
): string[] {
  return metricNames.map(
    (metricName) =>
      displayNameList?.find((item) => item.metric_name === metricName)
        ?.metric_display_name ?? metricName
  );
}
