import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";
import { fixDataSource } from "./fixDataSource.js";

export default function convertList({ properties }: Component): BrickConf {
  const props = properties as {
    data: string | object;
    fields: {
      title: string;
      description?: string;
      icon?: string;
      url?: string;
    };
    variant?: "default" | "navigation" | "ranking";
  };

  const { data, fields, variant } = props;

  return {
    brick: "eo-list",
    properties: {
      variant,
      dataSource: fixDataSource(data),
      fields,
      themeVariant: "elevo",
    },
  };
}
