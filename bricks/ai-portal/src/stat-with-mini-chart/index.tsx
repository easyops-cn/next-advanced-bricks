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
    "data" | "xField" | "yField" | "lineColor" | "showArea" | "min" | "max"
  > {
  label?: string;
  value?: string;
  size?: "medium" | "small";
}

/**
 * 构件 `ai-portal.stat-with-mini-chart`
 *
 * 带迷你折线图的统计数据展示构件，在统计数值旁边渲染一个迷你折线图。
 */
export
@defineElement("ai-portal.stat-with-mini-chart", {
  styleTexts: [styleText],
})
class StatWithMiniChart
  extends ReactNextElement
  implements StatWithMiniChartProps
{
  /** 统计指标标签名称 */
  @property()
  accessor label: string | undefined;

  /** 统计数值文本 */
  @property()
  accessor value: string | undefined;

  /**
   * 展示尺寸，medium 时图表高度为 92px，small 时为 55px
   * @default "medium"
   */
  @property()
  accessor size: "medium" | "small" | undefined;

  /**
   * 折线颜色
   * @default "var(--color-brand)"
   */
  @property()
  accessor lineColor: string | undefined;

  /** 是否在折线下方显示渐变填充区域 */
  @property({ type: Boolean })
  accessor showArea: boolean | undefined;

  /**
   * Specify the minimum value of the y-axis.
   * If not specified, the minimum value will be calculated from the data.
   */
  @property({ type: Number })
  accessor min: number | undefined;

  /**
   * Specify the maximum value of the y-axis.
   * If not specified, the maximum value will be calculated from the data.
   */
  @property({ type: Number })
  accessor max: number | undefined;

  /**
   * x 轴字段名（数据中时间字段的 key）
   * @default "0"
   */
  @property()
  accessor xField: string | undefined;

  /**
   * y 轴字段名（数据中数值字段的 key）
   * @default "1"
   */
  @property()
  accessor yField: string | undefined;

  /** 图表数据源，每项为包含 xField 和 yField 字段的对象 */
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
        min={this.min}
        max={this.max}
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
