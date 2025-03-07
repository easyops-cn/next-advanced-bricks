export type Point = [x: number, y: number];

export function getLinePath(
  data: Record<string, number>[],
  xField: string,
  yField: string,
  min: number | undefined,
  max: number | undefined,
  width: number,
  height: number
): Point[] {
  const hasMin = Number.isFinite(min);
  const hasMax = Number.isFinite(max);
  let fixedMin = hasMin ? (min as number) : Infinity;
  let fixedMax = hasMax ? (max as number) : -Infinity;
  if (!(hasMin && hasMax)) {
    for (const item of data) {
      const value = item[yField];
      if (!hasMin && value < fixedMin) {
        fixedMin = value;
      }
      if (!hasMax && value > fixedMax) {
        fixedMax = value;
      }
    }
  }

  let path: Point[];

  if (fixedMin === fixedMax) {
    const y = fixedMin === 0 ? height : height / 2;
    path = [
      [0, y],
      [width, y],
    ];
  } else {
    const start = data[0][xField];
    const end = data[data.length - 1][xField];
    const xScale = width / (end - start);
    const yScale = height / (fixedMax - fixedMin);

    path = data.map<Point>((item) => {
      const x = (item[xField] - start) * xScale;
      const y = height! - (item[yField] - fixedMin) * yScale;
      return [x, y];
    });
  }

  return path;
}
