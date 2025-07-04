import type { BrickConf } from "@next-core/types";
import type { Component, ViewWithInfo } from "./interfaces.js";
// import fetchObjectAttrList from "./fetchObjectAttrList.js";
// import findNearestCandidate from "./findNearestCandidate.js";
import { convertToStoryboard } from "./raw-data-generate/convert.js";
import { isExpression } from "./isExpression.js";

interface DescriptionItem {
  label: string;
  text?: string;
  field?: string;
}

export default async function convertDescriptions(
  { properties }: Component,
  _view: ViewWithInfo
): Promise<BrickConf> {
  const { data, title, columns, list, ...restProps } = properties as {
    data: string;
    title?: string;
    columns?: number;
    list: DescriptionItem[];
  };

  const visualConfig = new Map<string, any>();

  // const dataSourceDef = data
  //   ? view.dataSources?.find((ds) => ds.name === data)
  //   : undefined;
  // if (dataSourceDef?.api.name === "host@cmdb") {
  //   const attrList = await fetchObjectAttrList();
  //   for (const attr of attrList ?? []) {
  //     const candidates = attr.generatedView?.[0]?.list;
  //     const select = findNearestCandidate(candidates, 0);
  //     if (select) {
  //       visualConfig.set(attr.id, select);
  //     }
  //   }
  // }

  const configuredItems = new Map<string, any>();

  for (const item of list) {
    if (item.field) {
      const candidate = visualConfig.get(item.field);
      if (candidate) {
        const brick = convertToStoryboard(candidate, item.field);
        if (brick) {
          brick.slot = `[${item.field}]`;
          configuredItems.set(item.field, brick);
        }
      }
    }
  }

  return {
    brick: "eo-descriptions",
    properties: {
      dataSource: isExpression(data)
        ? data
        : `<% CTX[${JSON.stringify(data)}] %>`,
      descriptionTitle: title,
      column: columns,
      list: list.map((item) => {
        const brick = item.field ? configuredItems.get(item.field) : undefined;
        return brick
          ? {
              label: item.label,
              useChildren: `[${item.field}]`,
            }
          : item;
      }),
      ...restProps,
    },
    children:
      configuredItems.size > 0 ? Array.from(configuredItems.values()) : [],
  };
}
