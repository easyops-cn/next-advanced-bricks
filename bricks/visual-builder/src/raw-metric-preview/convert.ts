import type { BrickConf } from "@next-core/types";
import type { VisualConfig } from "./raw-metric-interfaces";
import { ALLOWED_COLORS } from "./constants";

export interface RawMetric {
  name: string;
  unit?: string;
}

export function convertToChart(
  config: VisualConfig,
  metricId: string,
  metric: RawMetric
): BrickConf | null {
  let brickItem: BrickConf | null = null;

  const color =
    config.color && ALLOWED_COLORS.includes(config.color)
      ? `<% THEME.getCssPropertyValue(${JSON.stringify(`--palette-${config.color}-5`)}) %>`
      : undefined;

  if (config.size === "small") {
    switch (config.chartType) {
      case "line":
        brickItem = {
          brick: "eo-mini-line-chart",
          properties: {
            data: "<% DATA %>",
            xField: "time",
            yField: metricId,
            lineColor: color,
          },
        };
        break;
      case "gauge": {
        const isPercentBase1 = metric.unit === "percent(1)";
        const isPercentBase100 =
          metric.unit === "percent(100)" || /^\s*%\s*$/.test(metric.unit);
        brickItem = {
          brick: "chart-v2.gauge-chart",
          properties: {
            data: "<% DATA %>",
            xField: "time",
            yField: metricId,
            height: 100,
            axis: {
              yAxis: {
                // 目前图表构件不支持 bibytes 的 ticks
                unit: metric.unit === "bibytes" ? "bytes" : metric.unit,
                precision: config.precision,
                min: config.min,
                max:
                  config.max ??
                  (isPercentBase1 ? 1 : isPercentBase100 ? 100 : undefined),
              },
            },
            thresholdColors:
              isPercentBase1 || isPercentBase100
                ? [
                    {
                      value: 20,
                      color: "cyan",
                    },
                    {
                      value: 90,
                      color: "yellow",
                    },
                    {
                      value: 100,
                      color: "red",
                    },
                  ].map(({ value, color }) => ({
                    value: isPercentBase100 ? value : value / 100,
                    color: `<% THEME.getCssPropertyValue(${JSON.stringify(`--palette-${color}-5`)}) %>`,
                  }))
                : undefined,
          },
        };
        break;
      }
    }
  } else {
    switch (config.chartType) {
      case "line":
      case "area":
        brickItem = {
          brick: "chart-v2.time-series-chart",
          properties: {
            data: "<% DATA %>",
            xField: "time",
            yFields: [metricId],
            colors: [color].filter(Boolean),
            height: config.size === "large" ? 230 : 200,
            timeFormat: "HH:mm",
            areaOpacity: config.chartType === "line" ? 0 : undefined,
            axis: {
              yAxis: {
                // 目前图表构件不支持 bibytes 的 ticks
                unit: metric.unit === "bibytes" ? "bytes" : metric.unit,
                precision: config.precision,
                min: config.min,
                max: config.max,
              },
            },
            legends: config.size === "large",
          },
        };
        break;
    }
  }

  return brickItem;
}
