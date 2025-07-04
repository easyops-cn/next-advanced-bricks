import { minBy } from "lodash";
import type { GraphNode } from "../interfaces";

export function handleKeyboardNav(
  event: KeyboardEvent,
  {
    activeNodeId,
    nodes,
  }: {
    activeNodeId: string | null;
    nodes: GraphNode[];
  }
): GraphNode | undefined {
  const activeNode = activeNodeId
    ? nodes.find((node) => node.id === activeNodeId)
    : null;

  if (!activeNode) {
    return;
  }

  const moveOnAxis = (axis: "x" | "y", direction: 1 | -1) => {
    const oppositeAxis = axis === "x" ? "y" : "x";
    let diff: number;
    const candidates = nodes.filter(
      (node) =>
        node !== activeNode &&
        node.type !== "start" &&
        node.type !== "instruction" &&
        ((diff = (node.view![axis] - activeNode.view![axis]) * direction),
        diff > 0) &&
        diff >
          Math.abs(activeNode.view![oppositeAxis] - node.view![oppositeAxis])
    );
    return minBy(
      candidates,
      (node) =>
        (activeNode.view![oppositeAxis] - node.view![oppositeAxis]) ** 2 +
        (activeNode.view![axis] - node.view![axis]) ** 2
    );
  };

  const key =
    event.key ||
    /* istanbul ignore next: compatibility */ event.keyCode ||
    /* istanbul ignore next: compatibility */ event.which;
  let nextNode: GraphNode | undefined;

  switch (key) {
    case "ArrowLeft":
    case 37: {
      nextNode = moveOnAxis("x", -1);
      break;
    }
    case "ArrowUp":
    case 38: {
      nextNode = moveOnAxis("y", -1);
      break;
    }
    case "ArrowRight":
    case 39: {
      nextNode = moveOnAxis("x", 1);
      break;
    }
    case "ArrowDown":
    case 40: {
      nextNode = moveOnAxis("y", 1);
      break;
    }
  }

  return nextNode;
}
