import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";
import { extractDataSource } from "./expressions.js";

const preferMiniChart = true;

const COLORS = [
  "#336EF4",
  "#45CAFF",
  "#41CDCF",
  "#8146F3",
  "#F8A075",
  "#94E65E",
  "#57689C",
  "#C285EF",
  "#FAC60B",
  "#E4551F",
  "#8984FF",
  "#2540FF",
  "#08BF33",
  "#F7811C",
  "#AC7CFF",
  "#1BA5DC",
  "#E89716",
  "#76A6F5",
  "#4F69FF",
];

export default function convertDashboard({ properties }: Component): BrickConf {
  const { dataSource, widgets } = properties as {
    dataSource: string;
    widgets: Array<{
      title: string;
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

  const { isString, expression } = extractDataSource(dataSource);

  const chartData = isString ? `<%= (${expression}).list %>` : dataSource;

  if (preferMiniChart) {
    return {
      brick: "div",
      properties: {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(205px, 1fr))",
          gap: "10px",
          // gridTemplateColumns: "repeat(auto-fill, minmax(375px, 1fr))",
          // gap: "12px",
        },
      },
      children: widgets.map((widget) => {
        const { title, type, metric, precision } = widget;
        return {
          brick: "ai-portal.stat-with-mini-chart",
          properties: {
            size: "small",
            label: title || metric.id,
            data: chartData,
            xField: "time",
            yField: metric.id,
            lineColor: "#295DFF",
            showArea: type === "area",
            value: `<%= CTX.__builtin_fn_getLatestMetricValue((${
              isString ? expression : JSON.stringify(dataSource ?? null)
            }), ${JSON.stringify({
              metric,
              precision,
            })}) %>`,
          },
        };
      }),
    };
  }

  return {
    brick: "div",
    properties: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--card-content-gap)",
      },
    },
    children: widgets.map((widget, index) => {
      const { title, type, metric, size, precision, min, max } = widget;
      const chart = {
        brick: "chart-v2.time-series-chart",
        properties: {
          data: chartData,
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
          colors: [COLORS[index % COLORS.length]],
        },
      };
      return {
        brick: "div",
        properties: {
          style: {
            background: "var(--elevo-component-background)",
            backdropFilter: "var(--elevo-component-backdrop-filter)",
            border: "1px solid #fff",
            padding: "16px",
          },
        },
        children: [
          {
            brick: "div",
            properties: {
              style: {
                fontSize: "12px",
                fontWeight: "500",
                marginBottom: "16px",
              },
              textContent: title || metric.id,
            },
          },
          chart,
        ],
      };
    }),
  };
}
