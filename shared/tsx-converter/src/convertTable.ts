import type { BrickConf } from "@next-core/types";
import type {
  Component,
  ParseResult,
  RenderUseBrick,
} from "@next-shared/tsx-parser";
import type { TableColumn, TableProps } from "../lib/components.js";
import type { ConvertOptions } from "./interfaces.js";
import { lowLevelConvertToStoryboard } from "./raw-data-generate/convert.js";
import { parseDataSource } from "./expressions.js";
import { getPreGeneratedAttrViews } from "./getPreGeneratedAttrViews.js";
import { findObjectIdByUsedDataContexts } from "./findObjectIdByUsedDataContexts.js";
import { convertComponent } from "./convertComponent.js";
import { deepReplaceVariables } from "./deepReplaceVariables.js";

const columnUseBrickParams = ["cellData", "rowData"];

export default async function convertTable(
  component: Component,
  view: ParseResult,
  options: ConvertOptions,
  scope: "view" | "template"
): Promise<BrickConf> {
  const { properties } = component;
  const { dataSource, size, columns, rowKey, pagination, ...restProps } =
    properties as Omit<TableProps<object>, "dataSource" | "columns"> & {
      dataSource: string | object;
      size?: "small" | "medium" | "large";
      pagination?: boolean;
      columns:
        | string
        | Array<
            Omit<TableColumn<object>, "render"> & {
              render?: RenderUseBrick;
            }
          >;
    };

  const parsedDataSource = parseDataSource(dataSource);

  const objectId = findObjectIdByUsedDataContexts(
    parsedDataSource.usedContexts,
    view.dataSources,
    view.variables
  );

  const attrViews = objectId
    ? await getPreGeneratedAttrViews(objectId)
    : undefined;

  const configuredColumns = new Map<string, BrickConf>();

  if (attrViews?.size && Array.isArray(columns)) {
    for (const column of columns) {
      if (column.render || typeof column.dataIndex !== "string") {
        continue;
      }
      const candidate = attrViews.get(column.dataIndex);
      if (candidate) {
        const brick = lowLevelConvertToStoryboard(candidate, ".cellData");
        if (brick) {
          brick.slot = `[${column.dataIndex}]`;
          configuredColumns.set(column.dataIndex, brick);
        }
      }
    }
  }

  const convertedColumns = Array.isArray(columns)
    ? await Promise.all(
        columns.map(async ({ render, ...column }) => {
          if (render) {
            const patterns = new Map<string, string>();
            for (
              let i = 0;
              i < render.params.length && i < columnUseBrickParams.length;
              i++
            ) {
              patterns.set(render.params[i], `DATA.${columnUseBrickParams[i]}`);
            }

            const useBrick = (
              await Promise.all(
                render.children.map((child) =>
                  convertComponent(child, view, options, scope)
                )
              )
            ).flatMap((child) => deepReplaceVariables(child, patterns));

            return {
              ...column,
              useBrick: useBrick.map((item) =>
                item.brick.startsWith(":")
                  ? {
                      brick: "div",
                      children: [item],
                    }
                  : item
              ),
            };
          }
          return typeof column.dataIndex === "string" &&
            configuredColumns.has(column.dataIndex)
            ? {
                ...column,
                useChildren: `[${column.dataIndex}]`,
              }
            : column;
        })
      )
    : columns;

  return {
    brick: "eo-next-table",
    properties: {
      dataSource: parsedDataSource.isString
        ? parsedDataSource.embedded
        : dataSource,
      ...restProps,
      rowKey: rowKey ?? (Array.isArray(columns) ? columns[0]?.key : undefined),
      columns: convertedColumns,
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
  };
}
