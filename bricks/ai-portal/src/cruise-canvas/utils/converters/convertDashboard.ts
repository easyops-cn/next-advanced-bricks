import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";

export default function convertDashboard({ properties }: Component): BrickConf {
  const { dataSource, widgets } = properties as {
    dataSource: string;
    widgets: Array<{
      type: "line" | "area";
      metric: {
        id: string;
        unit: string;
      };
      size?: "small" | "medium" | "large";
      precision?: number;
      min?: number;
      max?: number;
      color?: string;
    }>;
  };

  return {
    brick: "eo-grid-layout",
    properties: {
      templateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
      gap: "var(--card-content-gap)",
    },
    children: widgets.map((widget) => {
      const { type, metric, size, precision, min, max } = widget;
      return {
        brick: "chart-v2.time-series-chart",
        properties: {
          data: `<% CTX[${JSON.stringify(dataSource)}] %>`,
          xField: "time",
          yFields: [metric.id],
          height: size === "large" ? 230 : 200,
          timeFormat: "HH:mm",
          areaOpacity: type === "line" ? 0 : undefined,
          axis: {
            yAxis: {
              unit: metric.unit,
              precision: precision,
              min: min === undefined ? 0 : min,
              max: max,
              shape: "smooth",
            },
          },
          areaShape: "smooth",
          legends: size === "large",
          colors: widget.color ? [widget.color] : undefined,
        },
      };
    }),
  };
}
