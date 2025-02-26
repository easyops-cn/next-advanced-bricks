import { createProviderClass, hasOwnProperty } from "@next-core/utils/general";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";
import { isObject } from "lodash";

export interface Data {
  name: string;
  value: unknown;
}

export type Config = NormalConfig | UnknownConfig;

export interface NormalConfig {
  type: ConfigType;
  attrList: Attr[];
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

export type ConfigType = "list" | "list-with-pagination" | "object" | "unknown";

export interface Attr {
  id: string;
  name: string;
  candidates?: unknown[];
}

export interface ContainerOption {
  label: string;
  value: string;
  settings?: unknown;
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
}

interface ModelObject {
  attrList: ModelAttr[];
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
    if (
      hasOwnProperty(listValue, "list") &&
      Array.isArray(listValue.list) &&
      hasOwnProperty(listValue, "page") &&
      typeof listValue.page === "number" &&
      hasOwnProperty(listValue, "total") &&
      typeof listValue.total === "number"
    ) {
      // It's a list with pagination
      if (listValue.list.length > 0) {
        type = "list-with-pagination";
        datum = listValue.list[0];
        dataList = listValue.list;
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

  if (
    type !== "unknown" &&
    isObject(datum) &&
    hasOwnProperty(datum, "_object_id") &&
    typeof datum._object_id === "string"
  ) {
    const objectId = datum._object_id;

    const { list } = (await InstanceApi_postSearchV3("MODEL_OBJECT", {
      fields: [
        "name",
        "objectId",
        "attrList.id",
        "attrList.name",
        "attrList.generatedView.list",
      ],
      query: {
        objectId,
        ignore: { $ne: true },
      },
      page: 1,
    })) as { list: ModelObject[] };

    if (list.length === 0) {
      // eslint-disable-next-line no-console
      console.warn("Can not find object by objectId:", objectId);
    } else {
      attrList = list[0].attrList
        .map<Attr>((attr) =>
          keys.has(attr.id)
            ? {
                id: attr.id,
                name: attr.name,
                candidates: attr.generatedView?.[0]?.list,
              }
            : null
        )
        .filter(Boolean);
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn("Can not detect objectId with data:", data);

    // Fallback to attributes retrieval by data keys
    attrList = [...keys].map((id) => ({ id, name: id }));
  }

  return {
    type,
    attrList,
    dataList,
    containerOptions: getAvailableContainersByType(type),
  };
}

function getAvailableContainersByType(type: ConfigType): ContainerOption[] {
  switch (type) {
    case "list":
      return [
        {
          label: "表格",
          value: "table",
        },
        {
          label: "卡片列表",
          value: "cards",
        },
        // {
        //   label: "图表",
        //   value: "chart",
        // },
      ];
    case "list-with-pagination":
      return [
        {
          label: "表格",
          value: "table",
          settings: {
            pagination: true,
          },
        },
        {
          label: "卡片列表",
          value: "cards",
          settings: {
            pagination: true,
          },
        },
        // {
        //   label: "图表",
        //   value: "chart",
        //   settings: {
        //     pagination: true,
        //   },
        // },
      ];
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
}

customElements.define(
  "visual-builder.get-config-by-data-for-ai",
  createProviderClass(getConfigByDataForAi)
);
