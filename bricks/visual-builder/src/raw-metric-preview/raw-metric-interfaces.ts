import type { ALLOWED_COLORS } from "./constants";

export interface MetricVisualConfig {
  /** 视觉重量，整型，默认为 0，取值范围 [-1, 2] */
  visualWeight: number;

  /** 图表类型 */
  chartType: "line" | "area" | "gauge";

  /** 图表尺寸 */
  size?: "small" | "medium" | "large";

  /** 保留几位小数 */
  precision?: number;

  /** 最小值 */
  min?: number;

  /** 最大值 */
  max?: number;

  color?: Color;
}

export type Color =
  | "blue"
  | "cyan"
  | "deep-purple"
  | "gray-blue"
  | "gray"
  | "green"
  | "indigo"
  | "orange"
  | "purple"
  | "red"
  | "teal"
  | "yellow";

/* ====== Type checks ====== */
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type cases = [Expect<Equal<Color, (typeof ALLOWED_COLORS)[number]>>];
