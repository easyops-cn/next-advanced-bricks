import { createContext, type Dispatch } from "react";
import type { FileInfo, SizeTuple } from "./interfaces";

export interface CanvasContextValue {
  humanInput: (jobId: string, input: string) => void;
  onShare: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onNodeResize: (id: string, size: SizeTuple | null) => void;
  activeToolCallJobId: string | null;
  setActiveToolCallJobId: Dispatch<React.SetStateAction<string | null>>;
  setActiveNodeId: Dispatch<React.SetStateAction<string | null>>;
  hoverOnScrollableContent: boolean;
  setHoverOnScrollableContent: Dispatch<React.SetStateAction<boolean>>;
  activeExpandedViewJobId: string | null;
  setActiveExpandedViewJobId: Dispatch<React.SetStateAction<string | null>>;
  supports?: Record<string, boolean>;
  setActiveFile: Dispatch<React.SetStateAction<FileInfo | null>>;
}

export const CanvasContext = createContext<CanvasContextValue>({
  humanInput: () => {},
  onShare: () => {},
  onPause: () => {},
  onResume: () => {},
  onCancel: () => {},
  onNodeResize: () => {},
  activeToolCallJobId: null,
  setActiveToolCallJobId: () => {},
  setActiveNodeId: () => {},
  hoverOnScrollableContent: false,
  setHoverOnScrollableContent: () => {},
  activeExpandedViewJobId: null,
  setActiveExpandedViewJobId: () => {},
  setActiveFile: () => {},
});
