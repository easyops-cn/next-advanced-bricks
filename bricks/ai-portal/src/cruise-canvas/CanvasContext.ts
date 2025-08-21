import { createContext, type Dispatch } from "react";
import type { FileInfo, SizeTuple } from "./interfaces";

export interface CanvasContextValue {
  onNodeResize: (id: string, size: SizeTuple | null) => void;
  setActiveNodeId: Dispatch<React.SetStateAction<string | null>>;
  hoverOnScrollableContent: boolean;
  setHoverOnScrollableContent: Dispatch<React.SetStateAction<boolean>>;
  supports?: Record<string, boolean>;
  setActiveFile: Dispatch<React.SetStateAction<FileInfo | null>>;
}

export const CanvasContext = createContext<CanvasContextValue>({
  onNodeResize: () => {},
  setActiveNodeId: () => {},
  hoverOnScrollableContent: false,
  setHoverOnScrollableContent: () => {},
  setActiveFile: () => {},
});
