import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import type {
  MiniLineChart,
  MiniLineChartProps,
} from "@next-bricks/mini-chart/mini-line-chart";

const WrappedMiniLineChart = wrapBrick<MiniLineChart, MiniLineChartProps>(
  "eo-mini-line-chart"
);

const { defineElement, property } = createDecorators();

export interface StatWithMiniChartProps
  extends Pick<
    MiniLineChartProps,
    "data" | "xField" | "yField" | "lineColor" | "showArea"
  > {
  label?: string;
  value?: string;
  size?: "medium" | "small";
}

/**
 * 构件 `ai-portal.stat-with-mini-chart`
 */
export
@defineElement("ai-portal.stat-with-mini-chart", {
  styleTexts: [styleText],
})
class StatWithMiniChart
  extends ReactNextElement
  implements StatWithMiniChartProps
{
  @property()
  accessor label: string | undefined;

  @property()
  accessor value: string | undefined;

  /**
   * @default "medium"
   */
  @property()
  accessor size: "medium" | "small" | undefined;

  /**
   * @default "var(--color-brand)"
   */
  @property()
  accessor lineColor: string | undefined;

  @property({ type: Boolean })
  accessor showArea: boolean | undefined;

  /**
   * @default "0"
   */
  @property()
  accessor xField: string | undefined;

  /**
   * @default "1"
   */
  @property()
  accessor yField: string | undefined;

  @property({ attribute: false })
  accessor data: Record<string, number>[] | undefined;

  render() {
    return (
      <StatWithMiniChartComponent
        label={this.label}
        value={this.value}
        size={this.size}
        lineColor={this.lineColor}
        showArea={this.showArea}
        xField={this.xField}
        yField={this.yField}
        data={this.data}
      />
    );
  }
}

function StatWithMiniChartComponent({
  label,
  value,
  size,
  ...chartProps
}: StatWithMiniChartProps) {
  if (size === "small") {
    return (
      <div className="container">
        <div className="label-and-stat">
          <div className="label">{label}</div>
          <div className="stat">{value}</div>
        </div>
        <div className="chart">
          <WrappedMiniLineChart
            {...chartProps}
            lineWidth={1.5}
            width="auto"
            height="55"
          />
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      <div className="label">{label}</div>
      <div className="stat-and-chart">
        <div className="chart">
          <WrappedMiniLineChart
            {...chartProps}
            lineWidth={2}
            width="auto"
            height="92"
          />
        </div>
        <div className="stat">{value}</div>
      </div>
    </div>
  );
}
