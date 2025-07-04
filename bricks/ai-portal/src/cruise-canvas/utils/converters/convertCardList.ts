import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";

export default function convertCardList({ properties }: Component): BrickConf {
  const props = properties as {
    dataSource: string;
    fields: {
      title: string;
      description?: string;
    };
  };
  return {
    brick: "eo-grid-layout",
    properties: {
      templateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
      gap: "var(--card-content-gap)",
    },
    children: [
      {
        brick: ":forEach",
        dataSource: `<% CTX[${JSON.stringify(props.dataSource)}] %>`,
        children: [
          {
            brick: "eo-card-item",
            properties: {
              cardTitle: `<% ITEM[${JSON.stringify(props.fields.title)}] %>`,
              description: props.fields.description
                ? `<% ITEM[${JSON.stringify(props.fields.description)}] %>`
                : undefined,
            },
          },
        ],
      },
    ],
  };
}
