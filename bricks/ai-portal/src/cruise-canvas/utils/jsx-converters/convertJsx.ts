import type { BrickConf, ContextConf } from "@next-core/types";
import type { Component, ConstructResult } from "@next-shared/jsx-storyboard";
import { pipes } from "@easyops-cn/brick-next-pipes";
import convertList from "./convertList";
import type { ConvertViewOptions } from "../converters/interfaces";
import { convertEvents } from "./convertEvents";
import { withBox } from "../converters/withBox";
import { convertDataSources } from "./convertDataSources";
import { convertVariables } from "./convertVariables";
import convertTable from "./convertTable";
import convertDescriptions from "./convertDescriptions";
import convertDashboard from "./convertDashboard";
import convertButton from "./convertButton";
import convertForm from "./convertForm";
import convertFormItem from "./convertFormItem";
import convertModal from "./convertModal";
import convertToolbar from "./convertToolbar";

export async function convertJsx(
  result: ConstructResult,
  options: ConvertViewOptions
) {
  const convert = async (component: Component) => {
    let brick: BrickConf | null = null;
    switch (component.name) {
      case "eo-list":
        brick = await convertList(component);
        break;
      case "eo-table":
        brick = await convertTable(component, result, options);
        break;
      case "eo-descriptions":
        brick = await convertDescriptions(component, result, options);
        break;
      case "eo-dashboard":
        brick = await convertDashboard(component, result, options);
        break;
      case "eo-button":
        brick = await convertButton(component);
        break;
      case "eo-form":
        brick = await convertForm(component);
        break;
      case "eo-toolbar":
        brick = await convertToolbar(component);
        break;
      case "eo-modal":
        brick = await convertModal(component);
        break;
      case "eo-search":
      case "eo-input":
      case "eo-number-input":
      case "eo-textarea":
      case "eo-select":
      case "eo-radio":
      case "eo-checkbox":
      case "eo-switch":
      case "eo-date-picker":
      case "eo-time-picker":
        brick = await convertFormItem(component, component.name);
        break;
    }

    if (!brick) {
      return null;
    }

    // Set [data-component-id] for the brick
    if (component.componentId) {
      brick.properties ??= {};
      brick.properties.dataset ??= {};
      (brick.properties.dataset as Record<string, string>).componentId =
        component.componentId;
    }

    brick.events = convertEvents(component, options);

    if (component.children?.length) {
      brick.children = (
        await Promise.all(component.children.map(convert))
      ).filter(Boolean) as BrickConf[];
    }

    return brick;
  };

  const context: ContextConf[] = [
    ...convertDataSources(result.dataSources ?? []),
    ...convertVariables(result.variables ?? []),
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

  const children = (await Promise.all(result.components.map(convert))).filter(
    Boolean
  ) as BrickConf[];

  const needBox = result.components.every((component) =>
    ["form", "descriptions", "button"].includes(component.name)
  );

  return {
    brick: "eo-content-layout",
    children: needBox ? [withBox(children, options)] : children,
    context,
  };
}

function mergeTexts(
  items: (
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
