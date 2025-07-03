export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Merges multiple rectangles into a single bounding rectangle.
 */
export function mergeRects(rects: Rect[]): Rect {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const rect of rects) {
    const r = rect.x + rect.width;
    const b = rect.y + rect.height;
    if (rect.x < left) {
      left = rect.x;
    }
    if (r > right) {
      right = r;
    }
    if (rect.y < top) {
      top = rect.y;
    }
    if (b > bottom) {
      bottom = b;
    }
  }

  const width = right - left;
  const height = bottom - top;

  return { x: left, y: top, width, height };
}
