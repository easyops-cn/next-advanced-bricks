import { get } from "lodash";
import type { SizeTuple } from "../../diagram/interfaces";
import type { Cell, InitialCell, LayoutOptions, NodeCell } from "../interfaces";
import { isInitialNodeCell } from "./asserts";
import { initaliContainerLayout } from "./initaliContainerLayout";

interface initializeConfig {
  defaultNodeSize: SizeTuple;
  layoutOptions?: LayoutOptions;
  isInitialize?: boolean;
}

export function initializeCells(
  initialCells: InitialCell[] | undefined,
  { defaultNodeSize, layoutOptions, isInitialize }: initializeConfig
): Cell[] {
  const originalCells = initialCells ?? [];
  if (isInitialize) {
    if (get(layoutOptions, "initialLayout") === "layered-architecture") {
      initaliContainerLayout(originalCells, { nodeLayout: "dagre" });
    } else if (get(layoutOptions, "initialLayout") === "layered-staggered") {
      initaliContainerLayout(originalCells, { nodeLayout: "staggered" });
    }
  }
  const finalCells: Cell[] = originalCells.map<Cell>((cell) => {
    if (
      !isInitialNodeCell(cell) ||
      (cell.view?.width !== undefined && cell.view?.height !== undefined)
    ) {
      return cell as NodeCell;
    }
    return {
      ...cell,
      view: {
        width: defaultNodeSize[0],
        height: defaultNodeSize[1],
        ...cell.view,
      },
    } as NodeCell;
  });
  return finalCells;
}
