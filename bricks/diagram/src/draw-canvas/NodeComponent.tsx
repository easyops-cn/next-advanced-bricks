import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactUseBrick } from "@next-core/react-runtime";
import { __secret_internals, checkIfByTransform } from "@next-core/runtime";
import { isEqual } from "lodash";
import ResizeObserver from "resize-observer-polyfill";
import type { NodeBrickCell, NodeBrickConf, NodeCell } from "./interfaces";
import type { SizeTuple } from "../diagram/interfaces";
import { LockIcon } from "./LockIcon";

export interface NodeComponentProps {
  node: NodeCell;
  x?: number;
  y?: number;
  degraded: boolean;
  degradedNodeLabel?: string;
  defaultNodeBricks?: NodeBrickConf[];
  locked?: boolean;
  containerLocked?: boolean;
  onResize(id: string, size: SizeTuple | null): void;
}

export function NodeComponent({
  node,
  x,
  y,
  degraded,
  degradedNodeLabel,
  defaultNodeBricks,
  locked,
  containerLocked,
  onResize,
}: NodeComponentProps): JSX.Element | null {
  const memoizedData = useDeepMemo({
    node: { id: node.id, data: node.data, locked: !!locked },
  });
  const specifiedUseBrick = (node as NodeBrickCell).useBrick;
  const observerRef = useRef<ResizeObserver | null>(null);

  const useBrick = useMemo(() => {
    return degraded
      ? null
      : (specifiedUseBrick ??
          defaultNodeBricks?.find((item) =>
            checkIfByTransform(item, memoizedData)
          )?.useBrick);
  }, [degraded, specifiedUseBrick, defaultNodeBricks, memoizedData]);

  const label = useMemo<string>(
    () =>
      degraded
        ? String(
            __secret_internals.legacyDoTransform(
              memoizedData,
              degradedNodeLabel ?? "<% DATA.node.id %>"
            )
          )
        : "",
    [degraded, degradedNodeLabel, memoizedData]
  );

  const brickRef = useRef<HTMLElement | null>(null);
  const xRef = useRef<number | undefined>(x);
  const yRef = useRef<number | undefined>(y);

  const refCallback = useCallback(
    (element: HTMLElement | null) => {
      brickRef.current = element;
      const prevObserver = observerRef.current;
      if (prevObserver) {
        prevObserver.disconnect();
        observerRef.current = null;
      }
      if (element) {
        if (xRef.current != null && yRef.current != null) {
          element.style.left = `${xRef.current}px`;
          element.style.top = `${yRef.current}px`;
        }
        // Todo: correctly wait for `useBrick` in v3 to be rendered (after layout)
        // Wait a macro task to let `useBrick` to be rendered.
        setTimeout(() => {
          const observer = new ResizeObserver(() => {
            onResize(node.id, [element.offsetWidth, element.offsetHeight]);
          });
          observer.observe(element);
          observerRef.current = observer;
        });
      } else {
        onResize(node.id, null);
      }
    },
    [node.id, onResize]
  );

  // Use position instead of transform, for clients
  // that hardware acceleration (GPU) is not available.
  useEffect(() => {
    xRef.current = x;
    yRef.current = y;
    const element = brickRef.current;
    if (element && x != null && y != null) {
      element.style.top = `${y}px`;
      element.style.left = `${x}px`;
    }
  }, [x, y]);

  const degradedRefCallBack = useCallback(
    (g: SVGGElement | null) => {
      if (g) {
        // istanbul ignore next
        const size =
          process.env.NODE_ENV === "test"
            ? { width: 60, height: 60 }
            : g.getBBox();
        onResize(node.id, [size.width, size.height]);
      } else {
        onResize(node.id, null);
      }
    },
    [node.id, onResize]
  );

  const foreignObjectRef = useRef<SVGForeignObjectElement | null>(null);

  // Workaround for Firefox bug:
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1644680
  // istanbul ignore next
  useEffect(() => {
    const fo = foreignObjectRef.current;
    if (!fo || !/firefox/i.test(navigator.userAgent)) {
      return;
    }
    fo.style.overflow = "hidden";
    // 延时 500ms 是经验值，实际测试如果机器性能较差，可能需要更长的时间。
    // MacBook Air M1 >= 100ms 可以工作，<= 50ms 则不行。
    const timeoutId = setTimeout(() => {
      fo.style.overflow = "visible";
    }, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {useBrick ? (
        <foreignObject
          // Make a large size to avoid the brick inside to be clipped by the foreignObject.
          width={9999}
          height={9999}
          className="node"
          ref={foreignObjectRef}
        >
          {useBrick && (
            <ReactUseBrick
              useBrick={useBrick}
              data={memoizedData}
              refCallback={refCallback}
            />
          )}
        </foreignObject>
      ) : degraded ? (
        <g className="degraded" ref={degradedRefCallBack}>
          <circle cx={8} cy={8} r={8} />
          <text x={8} y={32}>
            {label}
          </text>
        </g>
      ) : null}
      {locked && !containerLocked && x != null && y != null && (
        <LockIcon x={x + node.view.width + 4} y={y + node.view.height - 12} />
      )}
    </>
  );
}

function useDeepMemo<T>(value: T): T {
  const [memoizedValue, setMemoizedValue] = useState(value);

  useEffect(() => {
    setMemoizedValue((prev) => (isEqual(prev, value) ? prev : value));
  }, [value]);

  return memoizedValue;
}
