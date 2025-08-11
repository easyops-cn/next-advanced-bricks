import { createContext, type Dispatch } from "react";
import type { FeedbackDetail, FileInfo, SizeTuple } from "./interfaces";

export interface CanvasContextValue {
  onNodeResize: (id: string, size: SizeTuple | null) => void;
  onSubmitFeedback: (detail: FeedbackDetail) => void;
  setActiveNodeId: Dispatch<React.SetStateAction<string | null>>;
  hoverOnScrollableContent: boolean;
  setHoverOnScrollableContent: Dispatch<React.SetStateAction<boolean>>;
  supports?: Record<string, boolean>;
  setActiveFile: Dispatch<React.SetStateAction<FileInfo | null>>;
  setShowFeedback: Dispatch<React.SetStateAction<boolean>>;
  submittingFeedback: boolean;
  submittedFeedback: boolean;
}

export const CanvasContext = createContext<CanvasContextValue>({
  onNodeResize: () => {},
  onSubmitFeedback: () => {},
  setActiveNodeId: () => {},
  hoverOnScrollableContent: false,
  setHoverOnScrollableContent: () => {},
  setActiveFile: () => {},
  setShowFeedback: () => {},
  submittingFeedback: false,
  submittedFeedback: false,
});
