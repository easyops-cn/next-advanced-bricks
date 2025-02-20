import { curveLinear, curveMonotoneX, line } from "d3-shape";

export type Point = [x: number, y: number];

export interface MiniLineChartOptions {
  pixelRatio: number;
  width: number;
  height: number;
  padding: number;
  smooth?: boolean;
  lineColor?: string;
  xField: string;
  yField: string;
  data?: Record<string, number>[];
}

export function drawMiniLineChart(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  {
    pixelRatio,
    width,
    height,
    padding,
    smooth,
    lineColor,
    xField,
    yField,
    data,
  }: MiniLineChartOptions
): void {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  ctx.save();
  ctx.scale(pixelRatio, pixelRatio);
  ctx.clearRect(0, 0, width, height);

  if (!data?.length) {
    ctx.restore();
    return;
  }

  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (lineColor) {
    ctx.strokeStyle = lineColor;
  }

  ctx.beginPath();
  ctx.translate(padding, padding);

  let min = Infinity;
  let max = -Infinity;
  for (const item of data) {
    const value = item[yField];
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  }

  let path: Point[];

  if (min === max) {
    const y = min === 0 ? innerHeight : innerHeight / 2;
    path = [
      [0, y],
      [innerWidth, y],
    ];
  } else {
    const start = data[0][xField];
    const end = data[data.length - 1][xField];
    const xScale = innerWidth / (end - start);
    const yScale = innerHeight / (max - min);

    path = data.map<Point>((item) => {
      const x = (item[xField] - start) * xScale;
      const y = innerHeight! - (item[yField] - min) * yScale;
      return [x, y];
    });
  }

  // Keep smooth behavior as G2 line chart implementation
  // See https://github.com/antvis/G2/blob/6013d72881276aca9d17d93908d33b21194979c6/src/shape/line/smooth.ts#L20
  line()
    .context(ctx as unknown as CanvasRenderingContext2D)
    .curve(smooth === false ? curveLinear : curveMonotoneX)(path);
  ctx.stroke();
  ctx.restore();
}
