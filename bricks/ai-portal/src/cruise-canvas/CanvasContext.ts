import { createContext, type Dispatch } from "react";
import type { SizeTuple } from "./interfaces";

export interface CanvasContextValue {
  flagShowTaskActions?: boolean;
  humanInput: (jobId: string, input: string) => void;
  onShare: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onNodeResize: (id: string, size: SizeTuple | null) => void;
  activeToolCallJobId: string | null;
  setActiveToolCallJobId: Dispatch<React.SetStateAction<string | null>>;
}

export const CanvasContext = createContext<CanvasContextValue>({
  humanInput: () => {},
  onShare: () => {},
  onPause: () => {},
  onResume: () => {},
  onStop: () => {},
  onNodeResize: () => {},
  activeToolCallJobId: null,
  setActiveToolCallJobId: () => {},
});
