import { createContext, type Dispatch } from "react";
import type { FeedbackDetail } from "../cruise-canvas/interfaces";
import type {
  ActiveDetail,
  ConversationError,
  ConversationState,
  ExampleProject,
  ExtraChatPayload,
  GeneratedView,
  Job,
  ShowCaseType,
  Task,
  UploadOptions,
} from "./interfaces";

export interface TaskContextValue {
  conversationId?: string;
  conversationState?: ConversationState;
  tasks: Task[];
  errors: ConversationError[];
  workspace?: string;
  previewUrlTemplate?: string;
  replay?: boolean;
  showCases?: ShowCaseType[];
  exampleProjects?: ExampleProject[];
  uploadOptions?: UploadOptions;

  humanInput: (
    input: string | null,
    action?: string,
    extra?: ExtraChatPayload
  ) => void;
  onShare: () => void;
  onTerminate: () => void;
  supports?: Record<string, boolean>;

  activeExpandedViewJobId: string | null;
  setActiveExpandedViewJobId: Dispatch<React.SetStateAction<string | null>>;
  activeDetail: ActiveDetail | null;
  setActiveDetail: Dispatch<React.SetStateAction<ActiveDetail | null>>;
  subActiveDetail: ActiveDetail | null;
  setSubActiveDetail: Dispatch<React.SetStateAction<ActiveDetail | null>>;

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
}

export const TaskContext = createContext<TaskContextValue>({
  tasks: [],
  errors: [],
  humanInput: () => {},
  onShare: () => {},
  onTerminate: () => {},
  activeExpandedViewJobId: null,
  setActiveExpandedViewJobId: () => {},
  activeDetail: null,
  setActiveDetail: () => {},
  subActiveDetail: null,
  setSubActiveDetail: () => {},
  submittingFeedback: false,
  submittedFeedback: false,
  onSubmitFeedback: () => {},
  setShowFeedback: () => {},
});
