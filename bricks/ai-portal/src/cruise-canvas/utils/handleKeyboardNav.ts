import { minBy } from "lodash";
import type { GraphNode, NodePosition, NodeRect } from "../interfaces";
import { IS_MAC } from "../constants";

export type KeyboardAction =
  | KeyboardActionSwitchActiveNode
  | KeyboardActionEnter
  | KeyboardActionScroll;

export interface KeyboardActionSwitchActiveNode {
  action: "switch-active-node";
  node: GraphNode;
}

export interface KeyboardActionEnter {
  action: "enter";
  node: GraphNode;
}

export interface KeyboardActionScroll {
  action: "scroll";
  direction: "up" | "down" | "left" | "right";
  range: "line" | "page" | "document";
  node?: undefined;
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

  const key = event.key;

  if (!activeNode) {
    if (event.ctrlKey || event.altKey) {
      return;
    }

    if (key === " " && !event.ctrlKey && !event.metaKey) {
      return {
        action: "scroll",
        direction: event.shiftKey ? "down" : "up",
        range: "page",
      };
    }

    if (event.shiftKey || (!IS_MAC && event.metaKey)) {
      return;
    }

    switch (key) {
      case "Home":
        return {
          action: "scroll",
          direction: "up",
          range: "document",
        };
      case "End":
        return {
          action: "scroll",
          direction: "down",
          range: "document",
        };
      case "ArrowUp":
      case "ArrowDown": {
        const direction = key === "ArrowUp" ? "up" : "down";
        if (event.metaKey) {
          return {
            action: "scroll",
            direction,
            range: "document",
          };
        }
        return {
          action: "scroll",
          direction,
          range: "line",
        };
      }
      case "ArrowLeft":
      case "ArrowRight":
        if (!event.metaKey) {
          return {
            action: "scroll",
            direction: key === "ArrowLeft" ? "left" : "right",
            range: "line",
          };
        }
    }

    // Move up or down by arrow keys

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

  let node: GraphNode | undefined;
  let action: "switch-active-node" | "enter" | undefined;

  switch (key) {
    case "ArrowLeft":
      action = "switch-active-node";
      node = moveOnAxis("x", -1);
      break;
    case "ArrowUp":
      action = "switch-active-node";
      node = moveOnAxis("y", -1);
      break;
    case "ArrowRight":
      action = "switch-active-node";
      node = moveOnAxis("x", 1);
      break;
    case "ArrowDown":
      action = "switch-active-node";
      node = moveOnAxis("y", 1);
      break;
    case "Enter":
      action = "enter";
      node = activeNode;
  }

  if (action && node) {
    return { action, node };
  }
}

function getCenterPosition(view: NodeRect): NodePosition {
  return {
    x: view.x + view.width / 2,
    y: view.y + view.height / 2,
  };
}
