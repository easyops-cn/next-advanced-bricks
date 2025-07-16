import type { BrickConf } from "@next-core/types";
import type {
  Component,
  ConvertViewOptions,
  ViewWithInfo,
} from "./interfaces.js";
import { convertToStoryboard } from "./raw-data-generate/convert.js";
import { getPreGeneratedViews } from "./getPreGeneratedViews.js";
import { parseDataSource } from "./expressions.js";
import { findObjectIdByUsedDataContexts } from "./findObjectIdByUsedDataContexts.js";

interface DescriptionItem {
  label: string;
  text?: string;
  field?: string;
}

export default async function convertDescriptions(
  { properties }: Component,
  view: ViewWithInfo,
  options: ConvertViewOptions
): Promise<BrickConf> {
  const { data, title, columns, list, ...restProps } = properties as {
    data: string;
    title?: string;
    columns?: number;
    list: DescriptionItem[];
  };

  const parsedDataSource = parseDataSource(data);

  const objectId = findObjectIdByUsedDataContexts(
    parsedDataSource.usedContexts,
    view.dataSources
  );

  const preGeneratedViews = objectId
    ? await getPreGeneratedViews(objectId)
    : undefined;

  const configuredItems = new Map<string, any>();

  if (preGeneratedViews?.size) {
    for (const item of list) {
      if (item.field) {
        const candidate = preGeneratedViews.get(item.field);
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
      dataSource: parsedDataSource.isString ? parsedDataSource.embedded : data,
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
      showCard: !options.expanded,
      themeVariant: "elevo",
    },
    children:
      configuredItems.size > 0 ? Array.from(configuredItems.values()) : [],
  };
}
