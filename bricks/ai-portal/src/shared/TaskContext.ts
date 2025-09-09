import { createContext, type Dispatch } from "react";
import type {
  ConstructedView,
  FeedbackDetail,
  Job,
} from "../cruise-canvas/interfaces";

export interface TaskContextValue {
  humanInput: (jobId: string, input: string, action?: string) => void;
  onShare: () => void;
  onTerminate: () => void;
  supports?: Record<string, boolean>;

  activeExpandedViewJobId: string | null;
  setActiveExpandedViewJobId: Dispatch<React.SetStateAction<string | null>>;
  activeToolCallJobId: string | null;
  setActiveToolCallJobId: Dispatch<React.SetStateAction<string | null>>;

  submittingFeedback: boolean;
  submittedFeedback: boolean;
  onSubmitFeedback: (detail: FeedbackDetail) => void;
  setShowFeedback: Dispatch<React.SetStateAction<boolean>>;

  showJsxEditor?: boolean;
  activeJsxEditorJob?: Job;
  setActiveJsxEditorJob?: Dispatch<React.SetStateAction<Job | undefined>>;
  manuallyUpdatedViews?: Map<string, ConstructedView>;
  updateView?: (jobId: string, view: ConstructedView) => void;
  showFeedbackOnView?: boolean;
  onFeedbackOnView?: (viewId: string) => void;
  feedbackDoneViews?: Set<string>;
}

export const TaskContext = createContext<TaskContextValue>({
  humanInput: () => {},
  onShare: () => {},
  onTerminate: () => {},
  activeExpandedViewJobId: null,
  setActiveExpandedViewJobId: () => {},
  activeToolCallJobId: null,
  setActiveToolCallJobId: () => {},
  submittingFeedback: false,
  submittedFeedback: false,
  onSubmitFeedback: () => {},
  setShowFeedback: () => {},
});
