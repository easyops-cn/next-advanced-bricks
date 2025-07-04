import { minBy } from "lodash";
import type { GraphNode, NodePosition, NodeRect } from "../interfaces";

export type KeyboardAction =
  | KeyboardActionSwitchActiveNode
  | KeyboardActionEnter;

export interface KeyboardActionSwitchActiveNode {
  action: "switch-active-node";
  node: GraphNode;
}

export interface KeyboardActionEnter {
  action: "enter";
  node: GraphNode;
}

export function handleKeyboardNav(
  event: KeyboardEvent,
  {
    activeNodeId,
    nodes,
  }: {
    activeNodeId: string | null;
    nodes: GraphNode[];
  }
): KeyboardAction | undefined {
  const activeNode = activeNodeId
    ? nodes.find((node) => node.id === activeNodeId)
    : null;

  if (!activeNode) {
    return;
  }

  const moveOnAxis = (axis: "x" | "y", direction: 1 | -1) => {
    const oppositeAxis = axis === "x" ? "y" : "x";
    const activePosition = getCenterPosition(activeNode.view!);
    const candidates = nodes.filter((node) => {
      let diff: number;
      let position: NodePosition;
      return (
        node !== activeNode &&
        node.type !== "start" &&
        node.type !== "instruction" &&
        ((position = getCenterPosition(node.view!)),
        (diff = (position[axis] - activePosition[axis]) * direction),
        diff > 0) &&
        diff > Math.abs(activePosition[oppositeAxis] - position[oppositeAxis])
      );
    });
    return minBy(candidates, (node) => {
      const position = getCenterPosition(node.view!);
      return (
        (activePosition[oppositeAxis] - position[oppositeAxis]) ** 2 +
        (activePosition[axis] - position[axis]) ** 2
      );
    });
  };

  const key =
    event.key ||
    /* istanbul ignore next: compatibility */ event.keyCode ||
    /* istanbul ignore next: compatibility */ event.which;
  let node: GraphNode | undefined;
  let action: KeyboardAction["action"] | undefined;

  switch (key) {
    case "ArrowLeft":
    case 37: {
      action = "switch-active-node";
      node = moveOnAxis("x", -1);
      break;
    }
    case "ArrowUp":
    case 38: {
      action = "switch-active-node";
      node = moveOnAxis("y", -1);
      break;
    }
    case "ArrowRight":
    case 39: {
      action = "switch-active-node";
      node = moveOnAxis("x", 1);
      break;
    }
    case "ArrowDown":
    case 40: {
      action = "switch-active-node";
      node = moveOnAxis("y", 1);
      break;
    }
    case "Enter":
    case 13:
      action = "enter";
      node = activeNode;
  }

  if (action) {
    return { action, node } as KeyboardAction;
  }
}

function getCenterPosition(view: NodeRect): NodePosition {
  return {
    x: view.x + view.width / 2,
    y: view.y + view.height / 2,
  };
}
