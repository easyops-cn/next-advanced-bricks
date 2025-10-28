import { createContext, type Dispatch } from "react";
import type { SizeTuple } from "./interfaces";

export interface CanvasContextValue {
  onNodeResize: (id: string, size: SizeTuple | null) => void;
  setActiveNodeId: Dispatch<React.SetStateAction<string | null>>;
  hoverOnScrollableContent: boolean;
  setHoverOnScrollableContent: Dispatch<React.SetStateAction<boolean>>;
  supports?: Record<string, boolean>;
}

export const CanvasContext = createContext<CanvasContextValue>({
  onNodeResize: () => {},
  setActiveNodeId: () => {},
  hoverOnScrollableContent: false,
  setHoverOnScrollableContent: () => {},
});
