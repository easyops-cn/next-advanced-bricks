import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";
import type { ListProps } from "@next-shared/jsx-storyboard/lib/components.js";
import { parseDataSource } from "../converters/expressions";

export default function convertList({ properties }: Component): BrickConf {
  const props = properties as Omit<ListProps, "dataSource"> & {
    dataSource: string | object;
  };

  const { dataSource, fields, variant } = props;

  const parsedDataSource = parseDataSource(dataSource);

  return {
    brick: "eo-list",
    properties: {
      variant,
      dataSource: parsedDataSource.isString
        ? parsedDataSource.embedded
        : dataSource,
      fields,
      themeVariant: "elevo",
    },
  };
}
