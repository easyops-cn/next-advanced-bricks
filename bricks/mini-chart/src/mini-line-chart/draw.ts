// istanbul ignore file
import { curveLinear, curveMonotoneX, line } from "d3-shape";
import { getLinePath } from "./getLinePath";

export interface MiniLineChartOptions {
  pixelRatio: number;
  width: number;
  height: number;
  padding: number;
  smooth?: boolean;
  /**
   * Accept values of `rgb()` or `rgba()` only,
   * which can be retrieved from `getComputedStyle()`.
   */
  lineColor: string;
  /** @default 2 */
  lineWidth?: number;
  showArea?: boolean;
  min?: number;
  max?: number;
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
    lineWidth,
    showArea,
    min: _min,
    max: _max,
    xField,
    yField,
    data,
  }: MiniLineChartOptions
): void {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  // Cannot resize canvas after call to transferControlToOffscreen().
  // So set width/height by offscreen canvas.
  ctx.canvas.width = width * pixelRatio;
  ctx.canvas.height = height * pixelRatio;

  ctx.resetTransform?.();
  ctx.reset?.();
  ctx.save();
  ctx.scale(pixelRatio, pixelRatio);
  ctx.clearRect(0, 0, width, height);
  ctx.translate(padding, padding);

  if (!data?.length) {
    ctx.restore();
    return;
  }

  const path = getLinePath(
    data,
    xField,
    yField,
    _min,
    _max,
    innerWidth,
    innerHeight
  );

  // Keep smooth behavior as G2 line chart implementation
  // See https://github.com/antvis/G2/blob/6013d72881276aca9d17d93908d33b21194979c6/src/shape/line/smooth.ts#L20
  const curve = smooth === false ? curveLinear : curveMonotoneX;

  if (showArea) {
    const matches = lineColor.match(
      /rgba?\((\d+)[\s,]+(\d+)[\s,]+(\d+)([\s,]+\d+(?:\.\d+)?)?\)/
    );
    if (matches) {
      ctx.save();
      const [_, r, g, b, a] = matches;
      const gradient = ctx.createLinearGradient(0, 0, 0, innerHeight);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${(a ? +a : 1) * 0.3})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = gradient;

      ctx.beginPath();
      line()
        .context(ctx as unknown as CanvasRenderingContext2D)
        .curve(curve)(path);
      ctx.lineTo(innerWidth, innerHeight);
      ctx.lineTo(0, innerHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else {
      // eslint-disable-next-line no-console
      console.error(
        "Invalid line color format. Expected rgb() or rgba(), received:",
        lineColor
      );
    }
  }

  ctx.lineWidth = lineWidth ?? 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = lineColor;

  ctx.beginPath();
  line()
    .context(ctx as unknown as CanvasRenderingContext2D)
    .curve(curve)(path);
  ctx.stroke();

  ctx.restore();
}
