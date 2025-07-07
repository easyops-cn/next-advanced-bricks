import type { BrickConf } from "@next-core/types";
import type { Component, ViewWithInfo } from "./interfaces.js";
// import findNearestCandidate from "./findNearestCandidate.js";
import { lowLevelConvertToStoryboard } from "./raw-data-generate/convert.js";
import { convertEvents } from "./convertEvents.js";
import { isExpression } from "./isExpression.js";

interface TableColumn {
  key: string;
  dataIndex: string;
  title: string;
  sortable?: boolean;
}

export default async function convertTable(
  component: Component,
  view: ViewWithInfo
): Promise<BrickConf> {
  const { properties } = component;
  const { data, size, columns, rowKey, ...restProps } = properties as {
    data: string;
    columns: Array<TableColumn>;
    rowKey?: string;
    size?: "small" | "medium" | "large";
  };

  const visualConfig = new Map<string, any>();

  // const dataSourceDef = data
  //   ? view.dataSources?.find((ds) => ds.name === data)
  //   : undefined;
  // if (dataSourceDef?.api.name === "hosts@cmdb") {
  //   const attrList = await fetchObjectAttrList();
  //   for (const attr of attrList ?? []) {
  //     const candidates = attr.generatedView?.[0]?.list;
  //     const select = findNearestCandidate(candidates, 0);
  //     if (select) {
  //       visualConfig.set(attr.id, select);
  //     }
  //   }
  // }

  const configuredColumns = new Map<string, any>();

  for (const column of columns) {
    const candidate = visualConfig.get(column.dataIndex);
    if (candidate) {
      const brick = lowLevelConvertToStoryboard(candidate, ".cellData");
      if (brick) {
        brick.slot = `[${column.dataIndex}]`;
        configuredColumns.set(column.dataIndex, brick);
      }
    }
  }

  return {
    brick: "eo-next-table",
    properties: {
      dataSource: isExpression(data)
        ? data
        : `<%= CTX[${JSON.stringify(data)}] %>`,
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
      pagination: false,
      // size: size === "medium" ? "middle" : size,
      themeVariant: "elevo",

      scrollConfig: {
        x: "max-content",
      },
    },
    children:
      configuredColumns.size > 0 ? Array.from(configuredColumns.values()) : [],
    events: convertEvents(component, view),
  };
}
