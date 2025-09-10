import type { BrickConf } from "@next-core/types";
import type {
  Component,
  ConstructResult,
  RenderUseBrick,
} from "../interfaces.js";
import type { DescriptionsProps } from "../../lib/components.js";
import type { ConvertViewOptions } from "../interfaces.js";
import { convertToStoryboard } from "./raw-data-generate/convert.js";
import { getPreGeneratedAttrViews } from "./getPreGeneratedAttrViews.js";
import { parseDataSource } from "./expressions.js";
import { findObjectIdByUsedDataContexts } from "./findObjectIdByUsedDataContexts.js";
import { convertComponent } from "./convertComponent.js";
import { deepReplaceVariables } from "../tsx-constructors/replaceVariables.js";

interface DescriptionItem {
  label: string;
  text?: string;
  field?: string;
  render?: RenderUseBrick;
}

export default async function convertDescriptions(
  { properties }: Component,
  view: ConstructResult,
  options: ConvertViewOptions
): Promise<BrickConf> {
  const { dataSource, title, list, ...restProps } = properties as Partial<
    DescriptionsProps<object>
  > as Omit<DescriptionsProps<object>, "list"> & {
    dataSource: string | object;
    list: DescriptionItem[] | string;
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

  const configuredItems = new Map<string, BrickConf>();

  if (attrViews?.size && Array.isArray(list)) {
    for (const item of list) {
      if (item.render) {
        continue;
      }
      if (item.field) {
        const candidate = attrViews.get(item.field);
        if (candidate) {
          const brick = convertToStoryboard(candidate, item.field);
          if (brick) {
            brick.slot = `[${item.field}]`;
            configuredItems.set(item.field, brick);
          }
        }
      }
    }
  }

  const convertedList = Array.isArray(list)
    ? await Promise.all(
        list.map(async ({ render, ...item }) => {
          if (render) {
            const patterns = new Map<string, string>();
            if (render.params.length > 0) {
              patterns.set(render.params[0], "DATA");
            }

            const useBrick = (
              await Promise.all(
                render.children.map((child) =>
                  convertComponent(child, view, options)
                )
              )
            ).flatMap((child) => deepReplaceVariables(child, patterns));

            return {
              label: item.label,
              useBrick,
            };
          }
          const brick = item.field
            ? configuredItems.get(item.field)
            : undefined;
          return brick
            ? {
                label: item.label,
                useChildren: `[${item.field}]`,
              }
            : item;
        })
      )
    : list;

  return {
    brick: "eo-descriptions",
    properties: {
      ...restProps,
      dataSource: parsedDataSource.isString
        ? parsedDataSource.embedded
        : dataSource,
      // descriptionTitle: title,
      list: convertedList,
      column: options.expanded ? 3 : 1,
      templateColumns: "repeat(auto-fill,minmax(360px,1fr))",
      // showCard: !options.expanded,
      themeVariant: "elevo",
    },
    children:
      configuredItems.size > 0 ? Array.from(configuredItems.values()) : [],
  };
}
