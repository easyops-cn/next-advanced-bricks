import { createContext, type Dispatch } from "react";
import type { SizeTuple } from "./interfaces";

export interface CanvasContextValue {
  humanInput: (jobId: string, input: string) => void;
  onShare: () => void;
  onNodeResize: (id: string, size: SizeTuple | null) => void;
  activeToolCallJobId: string | null;
  setActiveToolCallJobId: Dispatch<React.SetStateAction<string | null>>;
}

export const CanvasContext = createContext<CanvasContextValue>({
  humanInput: () => {},
  onShare: () => {},
  onNodeResize: () => {},
  activeToolCallJobId: null,
  setActiveToolCallJobId: () => {},
});
