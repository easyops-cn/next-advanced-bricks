import type { BrickConf, ContextConf } from "@next-core/types";
import { pipes } from "@easyops-cn/brick-next-pipes";
import type { Component, ConvertResult } from "../interfaces.js";
import convertList from "./convertList.js";
import type { ConvertViewOptions } from "../interfaces.js";
import { convertEvents } from "./convertEvents.js";
import { withBox } from "./withBox.js";
import { convertDataSources } from "./convertDataSources.js";
import { convertVariables } from "./convertVariables.js";
import convertTable from "./convertTable.js";
import convertDescriptions from "./convertDescriptions.js";
import convertDashboard from "./convertDashboard.js";
import convertButton from "./convertButton.js";
import convertForm from "./convertForm.js";
import convertFormItem from "./convertFormItem.js";
import convertModal from "./convertModal.js";
import convertToolbar from "./convertToolbar.js";
import convertText from "./convertText.js";
import type { ConstructedView } from "../interfaces.js";
import convertCard from "./convertCard.js";
import convertForEach from "./convertForEach.js";
import convertIf from "./convertIf.js";

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
  const convert = async (
    component: Component
  ): Promise<BrickConf | BrickConf[]> => {
    let brick: BrickConf | null = null;
    switch (component.name) {
      case "List":
      case "eo-list":
        brick = await convertList(component);
        break;
      case "Table":
      case "eo-table":
        brick = await convertTable(component, result, options);
        break;
      case "Descriptions":
      case "eo-descriptions":
        brick = await convertDescriptions(component, result, options);
        break;
      case "Card":
        brick = await convertCard(component);
        break;
      case "Dashboard":
      case "eo-dashboard":
        brick = await convertDashboard(component, result, options);
        break;
      case "Button":
      case "eo-button":
        brick = await convertButton(component);
        break;
      case "Form":
      case "eo-form":
        brick = await convertForm(component);
        break;
      case "Toolbar":
      case "eo-toolbar":
        brick = await convertToolbar(component);
        break;
      case "Modal":
      case "eo-modal":
        brick = await convertModal(component);
        break;
      case "Plaintext":
      case "eo-text":
        brick = await convertText(component);
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
      case "Search":
      case "Input":
      case "NumberInput":
      case "Textarea":
      case "Select":
      case "Radio":
      case "Checkbox":
      case "Switch":
      case "DatePicker":
      case "TimePicker":
        brick = await convertFormItem(
          component,
          convertComponentName(component.name)
        );
        break;
      case "ForEach":
        brick = await convertForEach(component);
        break;
      case "If":
        brick = await convertIf(component);
        break;
      default:
        // eslint-disable-next-line no-console
        console.error("Unsupported component:", component.name);
    }

    if (!brick) {
      return [];
    }

    // Set [data-component-id] for the brick
    if (component.componentId) {
      brick.properties ??= {};
      brick.properties.dataset ??= {};
      (brick.properties.dataset as Record<string, string>).componentId =
        component.componentId;
    }

    if (component.slot) {
      brick.slot = component.slot;
    }

    brick.events = convertEvents(component, options);

    if (component.children?.length) {
      brick.children = (
        await Promise.all(component.children.map(convert))
      ).flat();

      if (component.name === "Card" && brick.children.length > 1) {
        brick.children = [
          {
            brick: "eo-content-layout",
            children: brick.children,
          },
        ];
      }
    }

    return brick;
  };

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

  const children = (await Promise.all(result.components.map(convert))).flat();

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

function convertComponentName(name: string) {
  return name.includes("-")
    ? name
    : `eo${name.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}
