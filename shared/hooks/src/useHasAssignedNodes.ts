import { useEffect, useState, type RefObject } from "react";

export function useHasAssignedNodes(slotRef: RefObject<HTMLSlotElement>) {
  const [hasAssignedNodes, setHasAssignedNodes] = useState(false);

  useEffect(() => {
    const slotElement = slotRef.current;

    if (!slotElement) {
      return;
    }

    const listener = () => {
      setHasAssignedNodes(slotElement.assignedNodes().length > 0);
    };

    listener();
    slotElement.addEventListener("slotchange", listener);

    return () => {
      slotElement.removeEventListener("slotchange", listener);
    };
  }, [slotRef]);

  return hasAssignedNodes;
}
