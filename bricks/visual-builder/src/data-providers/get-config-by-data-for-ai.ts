import { createProviderClass, hasOwnProperty } from "@next-core/utils/general";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";
import { isObject } from "lodash";
import {
  generateMetricCandidates,
  type Metric,
} from "../raw-metric-preview/generateMetricCandidates";

export interface Data {
  name: string;
  value: unknown;
}

export type Config = NormalConfig | UnknownConfig;

export interface NormalConfig {
  type: ConfigType;
  attrList: Attr[];
  metricGroups: MetricGroup[];
  dataList: unknown[];
  containerOptions?: ContainerOption[];
}

export interface UnknownConfig {
  type: "unknown";
  error: string;
}

export interface Options {
  dataType?: "context" | "state";
}

export type ConfigType =
  | "list"
  | "list-with-pagination"
  | "list-with-wrapper"
  | "object"
  | "unknown";

export interface Attr {
  id: string;
  name: string;
  candidates?: unknown[];
  metricKey?: string;
  unit?: string;
}

export interface MetricGroup {
  group: string;
  metrics: string[];
  counter?: string;
}

export interface ObjectInfo {
  attrList: Attr[];
  metricGroups: MetricGroup[];
}

export interface ContainerOption {
  label: string;
  value: string;
  settings?: unknown;
  prefer?: boolean;
}

interface ListWithPagination {
  list: DatumWithObjectId[];
  page: number;
  total: number;
  pageSize?: number;
  page_size?: number;
}

interface DatumWithObjectId {
  _object_id: string;
  time?: number;
}

interface ModelObject {
  attrList: ModelAttr[];
  parentObjectIds?: string[];
  metricGroups?: MetricGroup[];
}

interface ModelAttr {
  id: string;
  name: string;
  generatedView?: ModelAttrGeneratedView[];
}

interface ModelAttrGeneratedView {
  list?: unknown[];
}

export async function getConfigByDataForAi(
  data: Data | undefined | null
): Promise<Config> {
  if (data?.value == null) {
    return null;
  }

  const { value } = data;

  let datum: DatumWithObjectId | undefined;
  let type: ConfigType = "unknown";
  let dataList: unknown[] = [];
  let fields: Record<string, string> | undefined;

  // Detect value type
  if (Array.isArray(value)) {
    // It's a list without pagination
    if (value.length > 0) {
      type = "list";
      datum = value[0] as DatumWithObjectId;
      dataList = value;
    }
  } else if (isObject(value)) {
    const listValue = value as ListWithPagination;
    if (hasOwnProperty(listValue, "list") && Array.isArray(listValue.list)) {
      // It's a list with pagination
      if (listValue.list.length > 0) {
        type =
          hasOwnProperty(listValue, "page") &&
          typeof listValue.page === "number" &&
          hasOwnProperty(listValue, "total") &&
          typeof listValue.total === "number"
            ? "list-with-pagination"
            : "list-with-wrapper";
        datum = listValue.list[0];
        dataList = listValue.list;
      }
      if (
        type === "list-with-pagination" &&
        typeof listValue.page_size === "number" &&
        typeof listValue.pageSize !== "number"
      ) {
        fields = { pageSize: "page_size" };
      }
    } else {
      // It's a single object
      type = "object";
      datum = value as DatumWithObjectId;
      dataList = [datum];
    }
  }

  const keys = new Set<string>();
  for (const item of dataList) {
    if (isObject(item)) {
      for (const key of Object.keys(item)) {
        keys.add(key);
      }
    } else {
      type = "unknown";
      break;
    }
  }

  let attrList: Attr[] = [];
  let metricGroups: MetricGroup[] = [];

  if (
    type !== "unknown" &&
    isObject(datum) &&
    hasOwnProperty(datum, "_object_id") &&
    typeof datum._object_id === "string"
  ) {
    const objectId = datum._object_id;

    const isTimeSeries =
      type !== "object" &&
      hasOwnProperty(datum, "time") &&
      typeof datum.time === "number";
    ({ attrList, metricGroups } = await getMergedObjectInfo(
      objectId,
      keys,
      isTimeSeries
    ));
  } else {
    // eslint-disable-next-line no-console
    console.warn("Can not detect objectId with data:", data);

    // Fallback to attributes retrieval by data keys
    attrList = [...keys].map((id) => ({ id, name: id }));
  }

  if (attrList.length === 0) {
    type = "unknown";
  }

  return {
    type,
    attrList,
    metricGroups,
    dataList,
    containerOptions: getAvailableContainersByType(type, fields, attrList),
  };
}

function getAvailableContainersByType(
  type: ConfigType,
  fields: Record<string, string> | undefined,
  attrList: Attr[]
): ContainerOption[] {
  let result: ContainerOption[] = [];

  switch (type) {
    case "list":
      result = [
        {
          label: "表格",
          value: "table",
        },
        {
          label: "卡片列表",
          value: "cards",
        },
      ];
      break;
    case "list-with-pagination":
      result = [
        {
          label: "表格",
          value: "table",
          settings: {
            pagination: true,
            fields,
          },
        },
        {
          label: "卡片列表",
          value: "cards",
          settings: {
            pagination: true,
            fields,
          },
        },
      ];
      break;
    case "list-with-wrapper":
      result = [
        {
          label: "属性详情",
          value: "descriptions",
        },
        {
          label: "表格",
          value: "table",
          settings: {
            wrapper: true,
            fields,
          },
        },
        {
          label: "卡片列表",
          value: "cards",
          settings: {
            wrapper: true,
          },
        },
      ];
      break;
    case "object":
      return [
        {
          label: "属性详情",
          value: "descriptions",
        },
      ];
    default:
      return [];
  }

  // Count metrics and non-metrics, prefer to show chart first
  // if there are more metrics than non-metrics
  let metricCount = 0;
  let nonMetricCount = 0;
  for (const attr of attrList) {
    if (attr.metricKey) {
      metricCount++;
    } else {
      nonMetricCount++;
    }
  }
  const settings =
    type === "list-with-pagination"
      ? { pagination: true }
      : type === "list-with-wrapper"
        ? { wrapper: true }
        : undefined;
  if (metricCount > 0) {
    result.push({
      label: "图表",
      value: "chart",
      settings,
      prefer: metricCount > nonMetricCount && metricCount < 6,
    });
  }
  if (metricCount > 1) {
    result.push({
      label: "组合图表",
      value: "grouped-chart",
      settings,
      prefer: metricCount > nonMetricCount && metricCount >= 6,
    });
  }
  return result;
}

async function getMergedObjectInfo(
  objectIdWithNamespace: string,
  keys: Set<string>,
  isTimeSeries: boolean
): Promise<ObjectInfo> {
  const attrList: Attr[] = [];
  const metricGroups: MetricGroup[] = [];

  const [objectId, namespace] = objectIdWithNamespace.split("@");

  const { list } = (await InstanceApi_postSearchV3("MODEL_OBJECT", {
    fields: [
      "name",
      "objectId",
      "attrList.id",
      "attrList.name",
      "attrList.generatedView.list",
      "parentObjectIds",
      "metricGroups",
    ],
    query: {
      objectId,
      ignore: { $ne: true },
      ...(namespace
        ? { "space.name": namespace }
        : { space: { $exists: false } }),
    },
    page: 1,
  })) as { list: ModelObject[] };

  if (list.length === 0) {
    // eslint-disable-next-line no-console
    console.warn("Can not find object by objectId:", objectIdWithNamespace);
  } else {
    const { attrList: attrs, parentObjectIds, metricGroups: groups } = list[0];

    if (parentObjectIds?.length) {
      const parents = await Promise.all(
        parentObjectIds.map((parentId) =>
          getMergedObjectInfo(parentId, keys, isTimeSeries)
        )
      );

      for (const parent of parents) {
        attrList.push(...parent.attrList);
        metricGroups.push(...parent.metricGroups);
      }
    }

    attrList.push(
      ...attrs
        .map<Attr>((attr) =>
          keys.has(attr.id)
            ? {
                id: attr.id,
                name: attr.name,
                candidates: attr.generatedView?.[0]?.list,
              }
            : null
        )
        .filter(Boolean)
    );
    if (groups?.length) {
      metricGroups.push(...groups);
    }

    if (isTimeSeries) {
      const { list: metrics } = (await InstanceApi_postSearchV3(
        "_COLLECTOR_ALIAS_METRIC",
        {
          fields: ["name", "displayName", "unit", "dataType"],
          page_size: 3000,
          query: {
            dataType: {
              $ne: "string",
            },
            objectId: objectIdWithNamespace,
          },
          sort: [
            {
              key: "name",
              order: 1,
            },
          ],
        }
      )) as { list: Metric[] };

      attrList.push(
        ...metrics
          .map<Attr>((metric) => {
            const hasMetricName =
              metric.displayName && keys.has(metric.displayName);
            return hasMetricName || keys.has(metric.name)
              ? {
                  id: metric.name,
                  name: metric.displayName,
                  metricKey: hasMetricName ? metric.displayName : metric.name,
                  unit: metric.unit,
                  candidates: generateMetricCandidates(metric),
                }
              : null;
          })
          .filter(Boolean)
      );
    }
  }

  return { attrList, metricGroups };
}

customElements.define(
  "visual-builder.get-config-by-data-for-ai",
  createProviderClass(getConfigByDataForAi)
);
