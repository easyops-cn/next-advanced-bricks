import type { MetricVisualConfig } from "./raw-metric-interfaces";

export interface Metric {
  name: string;
  displayName?: string;
  unit?: string;
  dataType?: "long" | "double";
}

export function generateMetricCandidates(metric: Metric): MetricVisualConfig[] {
  const configList: MetricVisualConfig[] = [];
  for (let i = -1; i < 3; i++) {
    const isPercentBase1 = metric.unit === "percent(1)";
    const isPercentBase100 =
      metric.unit === "percent(100)" || metric.unit === "%";

    const size = i <= 0 ? "small" : i === 1 ? "medium" : "large";

    if (isPercentBase1 || isPercentBase100 || i >= 0) {
      const chartType = i === -1 ? "gauge" : i === 2 ? "area" : "line";

      configList.push({
        visualWeight: i,
        // color: "orange",
        chartType,
        size,
        min: 0,
        precision:
          isPercentBase1 || isPercentBase100
            ? 1
            : metric.dataType === "double"
              ? 2
              : 0,
      });
    }
  }
  return configList;
}
