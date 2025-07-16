import type { BrickConf } from "@next-core/types";
import type {
  Component,
  ConvertViewOptions,
  ViewWithInfo,
} from "./interfaces.js";
import { lowLevelConvertToStoryboard } from "./raw-data-generate/convert.js";
import { convertEvents } from "./convertEvents.js";
import { parseDataSource } from "./expressions.js";
import { getPreGeneratedViews } from "./getPreGeneratedViews.js";
import { findObjectIdByUsedDataContexts } from "./findObjectIdByUsedDataContexts.js";

interface TableColumn {
  key: string;
  dataIndex: string;
  title: string;
  sortable?: boolean;
}

export default async function convertTable(
  component: Component,
  view: ViewWithInfo,
  options: ConvertViewOptions
): Promise<BrickConf> {
  const { properties } = component;
  const { data, size, columns, rowKey, pagination, ...restProps } =
    properties as {
      data: string;
      columns: Array<TableColumn>;
      rowKey?: string;
      size?: "small" | "medium" | "large";
      pagination?: boolean;
    };

  const parsedDataSource = parseDataSource(data);

  const objectId = findObjectIdByUsedDataContexts(
    parsedDataSource.usedContexts,
    view.dataSources,
    view.variables
  );

  const preGeneratedViews = objectId
    ? await getPreGeneratedViews(objectId)
    : undefined;

  const configuredColumns = new Map<string, any>();

  if (preGeneratedViews?.size) {
    for (const column of columns) {
      const candidate = preGeneratedViews.get(column.dataIndex);
      if (candidate) {
        const brick = lowLevelConvertToStoryboard(candidate, ".cellData");
        if (brick) {
          brick.slot = `[${column.dataIndex}]`;
          configuredColumns.set(column.dataIndex, brick);
        }
      }
    }
  }

  return {
    brick: "eo-next-table",
    properties: {
      dataSource: parsedDataSource.isString ? parsedDataSource.embedded : data,
      ...restProps,
      rowKey: rowKey ?? columns[0]?.key,
      columns: columns.map((column) => {
        const brick = configuredColumns.get(column.dataIndex);
        return brick
          ? {
              ...column,
              useChildren: `[${column.dataIndex}]`,
            }
          : column;
      }),
      themeVariant: "elevo",
      scrollConfig: {
        x: "max-content",
      },
      ...(options.expanded
        ? {
            bordered: true,
            pagination,
            size: "large",
          }
        : {
            size: "middle",
            pagination: false,
          }),
    },
    children:
      configuredColumns.size > 0 ? Array.from(configuredColumns.values()) : [],
    events: convertEvents(component, view, options),
  };
}
