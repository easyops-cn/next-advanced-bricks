import { createContext, type Dispatch } from "react";
import type { FeedbackDetail, Job } from "../cruise-canvas/interfaces";
import type { GeneratedView } from "./interfaces";

export interface TaskContextValue {
  workspace?: string;
  previewUrlTemplate?: string;

  humanInput: (jobId: string, input: string | null, action?: string) => void;
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
  manuallyUpdatedViews?: Map<string, GeneratedView>;
  updateView?: (jobId: string, view: GeneratedView) => void;
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
