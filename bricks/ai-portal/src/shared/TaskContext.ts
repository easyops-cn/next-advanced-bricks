import { createContext, type Dispatch } from "react";
import type { FeedbackDetail } from "../cruise-canvas/interfaces";

export interface TaskContextValue {
  humanInput: (jobId: string, input: string) => void;
  onShare: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  supports?: Record<string, boolean>;

  activeExpandedViewJobId: string | null;
  setActiveExpandedViewJobId: Dispatch<React.SetStateAction<string | null>>;
  activeToolCallJobId: string | null;
  setActiveToolCallJobId: Dispatch<React.SetStateAction<string | null>>;

  submittingFeedback: boolean;
  submittedFeedback: boolean;
  onSubmitFeedback: (detail: FeedbackDetail) => void;
  setShowFeedback: Dispatch<React.SetStateAction<boolean>>;
}

export const TaskContext = createContext<TaskContextValue>({
  humanInput: () => {},
  onShare: () => {},
  onPause: () => {},
  onResume: () => {},
  onCancel: () => {},
  activeExpandedViewJobId: null,
  setActiveExpandedViewJobId: () => {},
  activeToolCallJobId: null,
  setActiveToolCallJobId: () => {},
  submittingFeedback: false,
  submittedFeedback: false,
  onSubmitFeedback: () => {},
  setShowFeedback: () => {},
});
