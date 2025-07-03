import type { NodeView, SizeTuple, TransformLiteral } from "../interfaces";

/**
 * Get the scroll movement so that the given rectangle is visible in container.
 */
export function getScrollTo(
  rect: NodeView,
  containerSize: SizeTuple,
  padding: [top: number, right: number, bottom: number, left: number],
  transform: TransformLiteral,
  block?: "start" | "nearest"
) {
  const [containerWidth, containerHeight] = containerSize;
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] = padding;
  const { x: left, y: top, width, height } = rect;
  const right = left + width;
  const bottom = top + height;

  const transformedTop = top * transform.k + transform.y;
  const transformedBottom = bottom * transform.k + transform.y;

  const diffYTop = paddingTop - transformedTop;
  const diffYBottom = containerHeight - paddingBottom - transformedBottom;
  const y =
    diffYTop > 0 || block === "start"
      ? diffYTop / transform.k
      : diffYBottom < 0
        ? diffYBottom / transform.k
        : 0;

  const transformedLeft = left * transform.k + transform.x;
  const transformedRight = right * transform.k + transform.x;

  const diffXLeft = paddingLeft - transformedLeft;
  const diffXRight = containerWidth - paddingRight - transformedRight;
  const x =
    diffXLeft > 0
      ? diffXLeft / transform.k
      : diffXRight < 0
        ? diffXRight / transform.k
        : 0;

  return { x, y };
}
