import type { BrickConf } from "@next-core/types";
import type {
  Component,
  ConvertViewOptions,
  ViewWithInfo,
} from "./interfaces.js";
import { parseDataSource } from "./expressions.js";
import { findObjectIdByUsedDataContexts } from "./findObjectIdByUsedDataContexts.js";
import { getPreGeneratedMetricGroups } from "./getPreGeneratedMetricGroups.js";

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

interface Widget {
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
}

interface MergedWidget extends Widget {
  relevantMetrics?: string[];
  counterMetric?: string;
  groupTitle?: string;
}

export default async function convertDashboard(
  { properties }: Component,
  view: ViewWithInfo,
  options: ConvertViewOptions
): Promise<BrickConf> {
  const { dataSource, widgets } = properties as {
    dataSource: string;
    widgets: Array<Widget>;
  };

  const { isString, expression, usedContexts } = parseDataSource(dataSource);

  const chartData = isString ? `<%= (${expression}).list %>` : dataSource;

  if (options.expanded) {
    let mergedWidgets = widgets as MergedWidget[];
    const objectId = findObjectIdByUsedDataContexts(
      usedContexts,
      view.dataSources,
      view.variables
    );
    const metricGroups = objectId
      ? await getPreGeneratedMetricGroups(objectId)
      : [];

    mergedWidgets = [];
    if (metricGroups.length > 0) {
      const mergedMetrics = new Set<string>();
      const metricIds = new Set(widgets.map((w) => w.metric.id));
      for (const widget of widgets) {
        if (mergedMetrics.has(widget.metric.id)) {
          continue; // Skip already merged metrics
        }
        const mergedWidget = { ...widget } as MergedWidget;
        mergedWidgets.push(mergedWidget);
        const group = metricGroups.find((g) =>
          g.metrics.includes(widget.metric.id)
        );
        if (group) {
          const relevantMetrics = group.metrics.filter((m) => metricIds.has(m));
          if (relevantMetrics.length > 1) {
            mergedWidget.relevantMetrics = relevantMetrics;
            mergedWidget.counterMetric = group.counter;
            mergedWidget.groupTitle = group.group;
            for (const metricId of relevantMetrics) {
              mergedMetrics.add(metricId);
              metricIds.delete(metricId);
            }
          }
        }
      }
    }

    return {
      brick: "div",
      properties: {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "16px",
        },
      },
      children: mergedWidgets.map((widget, index) => {
        const { title, /* type, */ metric, size, precision, min, max } = widget;
        const color = COLORS[index % COLORS.length];
        const chart = {
          brick: "chart-v2.time-series-chart",
          properties: {
            data: chartData,
            xField: "time",
            yFields: widget.relevantMetrics ?? [metric.id],
            ...(widget.counterMetric
              ? {
                  forceAbsoluteNumbers: true,
                  series: {
                    [widget.counterMetric]: {
                      isNegative: true,
                    },
                  },
                }
              : null),
            height: size === "large" ? 230 : 200,
            timeFormat: "HH:mm",
            ...(widget.counterMetric
              ? null
              : {
                  areaOptions: {
                    style: {
                      fill: `l(90) 0:${color} 1:#ffffff`,
                    },
                  },
                }),
            axis: {
              yAxis: {
                unit: metric.unit,
                precision: precision,
                ...(widget.counterMetric
                  ? null
                  : metric.unit === "percent(1)"
                    ? { min: 0, max: 1 }
                    : metric.unit === "percent(100)" || metric.unit === "%"
                      ? { min: 0, max: 100 }
                      : { min, max }),
                shape: "smooth",
              },
            },
            areaShape: "smooth",
            legends: size === "large",
            colors: [color],
            tooltip: {
              marker: {
                fill: color,
                stroke: "#fff",
                lineWidth: 2,
                shadowColor: color,
                shadowBlur: 8,
                shadowOffsetX: 0,
                shadowOffsetY: 4,
              },
              domStyles: {
                "g2-tooltip": {
                  background: [
                    `radial-gradient( farthest-corner at -20px 150px, ${color} 0%, rgba(238,238,238,0) 60%)`,
                    "linear-gradient( 180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.8) 100%)",
                  ].join(", "),
                  boxShadow: `0px 4px 8px 0px ${convertHexColorToRGBA(color, 0.08)}`,
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,1)",
                  backdropFilter: "blur(3px)",
                },
              },
            },
          },
        };
        return {
          brick: "div",
          properties: {
            style: {
              background: "rgba(255,255,255,0.8)",
              boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.06)",
              borderRadius: "8px",
              padding: "16px 20px 20px",
            },
          },
          children: [
            {
              brick: "div",
              properties: {
                style: {
                  fontSize: "16px",
                  fontWeight: "500",
                  marginBottom: "20px",
                },
                textContent: widget.groupTitle || title || metric.id,
              },
            },
            chart,
          ],
        };
      }),
    };
  }

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
          ...(metric.unit === "percent(1)"
            ? { min: 0, max: 1, showArea: true }
            : metric.unit === "percent(100)" || metric.unit === "%"
              ? { min: 0, max: 100, showArea: true }
              : { showArea: type === "area" }),
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

function convertHexColorToRGBA(color: string, alpha: number): string {
  const hex = color.slice(1);
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
