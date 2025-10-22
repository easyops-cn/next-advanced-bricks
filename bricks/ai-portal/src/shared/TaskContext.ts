import { createContext, type Dispatch } from "react";
import type { SourceFile } from "@next-shared/tsx-parser";
import type { FeedbackDetail } from "../cruise-canvas/interfaces";
import type {
  ExampleProject,
  GeneratedView,
  Job,
  ShowCaseType,
} from "./interfaces";

export interface TaskContextValue {
  conversationId?: string;
  workspace?: string;
  previewUrlTemplate?: string;
  replay?: boolean;
  showCases?: ShowCaseType[];
  exampleProjects?: ExampleProject[];

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

  skipToResults?: () => void;
  watchAgain?: () => void;
  tryItOut?: () => void;
  separateInstructions?: boolean;
  viewLibs?: SourceFile[];
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
