import { useMemo, useRef } from "react";
import {
  __secret_internals,
  checkIfByTransform,
  checkIfOfComputed,
} from "@next-core/runtime";
import { findIndex, isUndefined, omitBy } from "lodash";
import type {
  Cell,
  ComputedEdgeLineConf,
  ComputedLineConnecterConf,
  EdgeCell,
  EdgeLineConf,
  EditableLineCell,
  LineConnecterConf,
  LineMarker,
} from "../../draw-canvas/interfaces";
import {
  isEdgeCell,
  isLineDecoratorCell,
} from "../../draw-canvas/processors/asserts";
import {
  DEFAULT_LINE_STROKE_COLOR,
  DEFAULT_LINE_STROKE_WIDTH,
  DEFAULT_LINE_INTERACT_STROKE_WIDTH,
  DEFAULT_LINE_INTERACT_SHOW_START_ARROW,
  DEFAULT_LINE_INTERACT_SHOW_END_ARROW,
  DEFAULT_LINE_INTERACT_ANIMATE_DURATION,
  DEFAULT_DECORATOR_LINE_STROKE_COLOR,
} from "../../draw-canvas/constants";
import { LineMarkerConf } from "../../diagram/interfaces";

export interface UseLineMarkersOptions {
  cells: Cell[];
  defaultEdgeLines: EdgeLineConf[] | undefined;
  markerPrefix: string;
  lineConnector?: LineConnecterConf | boolean;
  /** Use memoized result when moving and resizing cells */
  useMemoizedResult?: boolean;
}

export interface UseLineMarkersResult {
  lineConfMap: WeakMap<EditableLineCell, ComputedEdgeLineConf>;
  lineConnectorConf: ComputedLineConnecterConf | null;
  markers: LineMarker[];
}

export function useLineMarkers({
  cells,
  defaultEdgeLines,
  markerPrefix,
  lineConnector,
  useMemoizedResult,
}: UseLineMarkersOptions): UseLineMarkersResult {
  const memoizedResult = useRef<UseLineMarkersResult | null>(null);

  return useMemo<UseLineMarkersResult>(() => {
    if (useMemoizedResult && memoizedResult.current) {
      // If cells are moving or resizing, we can use the previous memoized result.
      return memoizedResult.current;
    }

    // Always put the default stroke marker at the first position,
    // since the connecting line will use it.
    const markers: LineMarker[] = [
      {
        strokeColor: DEFAULT_LINE_STROKE_COLOR,
        markerType: "arrow",
      },
    ];

    let lineConnectorConf: ComputedLineConnecterConf | null = null;
    if (lineConnector) {
      lineConnectorConf = {
        ...getDefaultLineConf(),
        editingStrokeColor: "var(--palette-blue-5)",
        ...omitBy(lineConnector === true ? {} : lineConnector, isUndefined),
      } as ComputedLineConnecterConf;
      const lineMarkers: LineMarkerConf[] = getMarkers(lineConnectorConf);
      for (const marker of lineMarkers) {
        const { placement, type: _type } = marker;
        const type = _type ?? "arrow";
        const markerIndex = addMarker(
          {
            strokeColor: lineConnectorConf.strokeColor,
            markerType: type,
          },
          markers
        );
        const editingMarkerIndex = addMarker(
          {
            strokeColor: lineConnectorConf.editingStrokeColor,
            markerType: type,
          },
          markers
        );
        if (placement === "start") {
          lineConnectorConf.$markerStartUrl = `url(#${markerPrefix}${markerIndex})`;
          lineConnectorConf.$editingStartMarkerUrl = `url(#${markerPrefix}${editingMarkerIndex})`;
        } else {
          lineConnectorConf.$markerEndUrl = `url(#${markerPrefix}${markerIndex})`;
          lineConnectorConf.$editingEndMarkerUrl = `url(#${markerPrefix}${editingMarkerIndex})`;
        }
      }
    }

    const map = new WeakMap<EditableLineCell, ComputedEdgeLineConf>();
    for (const cell of cells) {
      const isEdge = isEdgeCell(cell);
      const isLineDecorator = isLineDecoratorCell(cell);

      let lineConf: ComputedEdgeLineConf;
      if (isEdge) {
        const computedLineConf =
          (Array.isArray(defaultEdgeLines)
            ? transformLineConf(
                defaultEdgeLines.find((item) =>
                  checkIfByTransform(item, { edge: cell })
                ),
                cell
              )
            : (
                __secret_internals.legacyDoTransform(
                  { edge: cell },
                  defaultEdgeLines
                ) as EdgeLineConf[]
              )?.find((item) => checkIfOfComputed(item))) ?? {};
        lineConf = {
          ...getDefaultLineConf(),
          ...omitBy(computedLineConf, isUndefined),
          ...omitBy(cell.view, isUndefined),
        } as ComputedEdgeLineConf;
        if (lineConf.parallelGap === undefined) {
          lineConf.parallelGap = lineConf.interactStrokeWidth;
        }
      } else {
        lineConf = {
          ...getDefaultLineConf(),
          showEndArrow: false,
          strokeColor: DEFAULT_DECORATOR_LINE_STROKE_COLOR,
          ...omitBy(cell.view, isUndefined),
        } as ComputedEdgeLineConf;
      }

      if (isEdge || isLineDecorator) {
        const lineMarkers: LineMarkerConf[] = getMarkers(lineConf);

        for (const marker of lineMarkers) {
          const { placement, type: _type } = marker;
          const type = _type ?? "arrow";
          const markerIndex = addMarker(
            {
              strokeColor: lineConf.strokeColor,
              markerType: type,
            },
            markers
          );
          if (placement === "start") {
            lineConf.$markerStartUrl = `url(#${markerPrefix}${markerIndex})`;
          } else {
            lineConf.$markerEndUrl = `url(#${markerPrefix}${markerIndex})`;
          }

          const activeStrokeColor = lineConf.overrides?.active?.strokeColor;
          if (activeStrokeColor && activeStrokeColor !== lineConf.strokeColor) {
            const activeMarkerIndex = addMarker(
              {
                strokeColor: activeStrokeColor,
                markerType: type,
              },
              markers
            );
            if (placement === "start") {
              lineConf.$activeMarkerStartUrl = `url(#${markerPrefix}${activeMarkerIndex})`;
            } else {
              lineConf.$activeMarkerEndUrl = `url(#${markerPrefix}${activeMarkerIndex})`;
            }
          }

          if (isEdge) {
            const activeRelatedStrokeColor =
              lineConf.overrides?.activeRelated?.strokeColor;
            if (
              activeRelatedStrokeColor &&
              activeRelatedStrokeColor !== lineConf.strokeColor
            ) {
              const activeRelatedMarkerIndex = addMarker(
                {
                  strokeColor: activeRelatedStrokeColor,
                  markerType: type,
                },
                markers
              );
              if (placement === "start") {
                lineConf.$activeRelatedMarkerStartUrl = `url(#${markerPrefix}${activeRelatedMarkerIndex})`;
              } else {
                lineConf.$activeRelatedMarkerEndUrl = `url(#${markerPrefix}${activeRelatedMarkerIndex})`;
              }
            }
          }
        }
        map.set(cell, lineConf);
      }
    }
    return (memoizedResult.current = {
      lineConfMap: map,
      lineConnectorConf,
      markers,
    });
  }, [cells, defaultEdgeLines, lineConnector, markerPrefix, useMemoizedResult]);
}

function transformLineConf(
  lineConf: EdgeLineConf | undefined,
  edge: EdgeCell
): EdgeLineConf {
  // Do not transform useBrick
  if (lineConf?.label?.useBrick) {
    const {
      label: { useBrick, ...restLabel },
      ...restConf
    } = lineConf;
    const computedRestConf = __secret_internals.legacyDoTransform(
      { edge },
      {
        ...restConf,
        label: restLabel,
      }
    ) as EdgeLineConf;
    return {
      ...computedRestConf,
      label: {
        ...computedRestConf.label,
        useBrick,
      },
    } as EdgeLineConf;
  }
  return __secret_internals.legacyDoTransform(
    { edge },
    lineConf
  ) as EdgeLineConf;
}

export function getMarkers(lineConf: ComputedEdgeLineConf): LineMarkerConf[] {
  let lineMarkers: LineMarkerConf[] = [];
  if (lineConf.markers) {
    lineMarkers = lineConf.markers;
  } else {
    if (lineConf.showStartArrow) {
      lineMarkers.push({
        type: "arrow",
        placement: "start",
      });
    }
    if (lineConf.showEndArrow) {
      lineMarkers.push({
        type: "arrow",
        placement: "end",
      });
    }
  }
  return lineMarkers;
}
function addMarker(marker: LineMarker, markers: LineMarker[]): number {
  let markerIndex = findIndex(markers, marker);
  if (markerIndex === -1) {
    markerIndex = markers.push(marker) - 1;
  }
  return markerIndex;
}

function getDefaultLineConf(): EdgeLineConf {
  return {
    type: "straight",
    dashed: false,
    strokeColor: DEFAULT_LINE_STROKE_COLOR,
    strokeWidth: DEFAULT_LINE_STROKE_WIDTH,
    interactStrokeWidth: DEFAULT_LINE_INTERACT_STROKE_WIDTH,
    showStartArrow: DEFAULT_LINE_INTERACT_SHOW_START_ARROW,
    showEndArrow: DEFAULT_LINE_INTERACT_SHOW_END_ARROW,
    animate: {
      useAnimate: false,
      duration: DEFAULT_LINE_INTERACT_ANIMATE_DURATION,
    },
    jumps: false,
  };
}
