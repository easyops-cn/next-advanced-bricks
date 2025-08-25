import type { BrickConf } from "@next-core/types";
import type { Component, ConstructResult } from "@next-shared/jsx-storyboard";
import type { DescriptionsProps } from "@next-shared/jsx-storyboard/lib/components.js";
import type { ConvertViewOptions } from "../converters/interfaces.js";
import { convertToStoryboard } from "../converters/raw-data-generate/convert.js";
import { getPreGeneratedAttrViews } from "../converters/getPreGeneratedAttrViews.js";
import { parseDataSource } from "../converters/expressions.js";
import { findObjectIdByUsedDataContexts } from "./findObjectIdByUsedDataContexts.js";

interface DescriptionItem {
  label: string;
  text?: string;
  field?: string;
}

export default async function convertDescriptions(
  { properties }: Component,
  view: ConstructResult,
  options: ConvertViewOptions
): Promise<BrickConf> {
  const { dataSource, title, list, ...restProps } =
    properties as Partial<DescriptionsProps> as Omit<
      DescriptionsProps,
      "list"
    > & {
      dataSource: string | object;
      list: DescriptionItem[];
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

  const configuredItems = new Map<string, any>();

  if (attrViews?.size) {
    for (const item of list) {
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

  return {
    brick: "eo-descriptions",
    properties: {
      ...restProps,
      dataSource: parsedDataSource.isString
        ? parsedDataSource.embedded
        : dataSource,
      // descriptionTitle: title,
      list: list.map((item) => {
        const brick = item.field ? configuredItems.get(item.field) : undefined;
        return brick
          ? {
              label: item.label,
              useChildren: `[${item.field}]`,
            }
          : item;
      }),
      column: options.expanded ? 3 : 1,
      // showCard: !options.expanded,
      themeVariant: "elevo",
    },
    children:
      configuredItems.size > 0 ? Array.from(configuredItems.values()) : [],
  };
}
