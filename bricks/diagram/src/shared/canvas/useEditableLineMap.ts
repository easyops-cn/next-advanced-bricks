import { useMemo } from "react";
import type {
  Cell,
  ComputedEdgeLineConf,
  DecoratorCell,
  DecoratorLineView,
  EdgeCell,
  EditableLine,
} from "../../draw-canvas/interfaces";
import {
  isEdgeCell,
  isLineDecoratorCell,
  isStraightType,
} from "../../draw-canvas/processors/asserts";
import { findNodeOrAreaDecorator } from "../../draw-canvas/processors/findNodeOrAreaDecorator";
import { getSmartLinePoints } from "./processors/getSmartLinePoints";
import { collectLineJumpsFactory } from "./collectLineJumpsFactory";

export function useEditableLineMap({
  cells,
  lineConfMap,
}: {
  cells: Cell[];
  lineConfMap: WeakMap<EdgeCell | DecoratorCell, ComputedEdgeLineConf>;
}): WeakMap<EdgeCell | DecoratorCell, EditableLine> {
  return useMemo(() => {
    const map = new WeakMap<EdgeCell | DecoratorCell, EditableLine>();

    const collectLineJumps = collectLineJumpsFactory();

    for (const cell of cells) {
      if (isEdgeCell(cell)) {
        const lineConf = lineConfMap.get(cell);
        // istanbul ignore next: defensive check
        if (!lineConf) {
          continue;
        }

        const sourceNode = findNodeOrAreaDecorator(cells, cell.source);
        const targetNode = findNodeOrAreaDecorator(cells, cell.target);

        const hasOppositeEdge =
          isStraightType(cell.view?.type) &&
          cells.some(
            (c) =>
              isEdgeCell(c) &&
              c.source === c.target &&
              c.target === c.source &&
              isStraightType(c.view?.type)
          );
        const parallelGap = hasOppositeEdge ? lineConf.parallelGap : 0;

        const points =
          sourceNode &&
          targetNode &&
          sourceNode.view.x != null &&
          targetNode.view.x != null
            ? getSmartLinePoints(
                sourceNode.view,
                targetNode.view,
                cell.view,
                parallelGap,
                cell.type
              )
            : null;

        if (points) {
          const jumpsMap = collectLineJumps(points, lineConf);

          map.set(cell, {
            edge: cell,
            points,
            source: sourceNode!,
            target: targetNode!,
            parallelGap,
            jumpsMap,
          });
        }
      } else if (isLineDecoratorCell(cell)) {
        const lineConf = lineConfMap.get(cell);
        // istanbul ignore next: defensive check
        if (!lineConf) {
          continue;
        }

        const { source, target } = cell.view as DecoratorLineView;

        const points =
          source && target
            ? getSmartLinePoints(
                { ...source, width: 0, height: 0 },
                { ...target, width: 0, height: 0 },
                cell.view,
                0,
                cell.type
              )
            : null;

        if (points) {
          const jumpsMap = collectLineJumps(points, lineConf);

          map.set(cell, {
            decorator: cell,
            points,
            parallelGap: 0,
            jumpsMap,
          });
        }
      }
    }
    return map;
  }, [cells, lineConfMap]);
}
