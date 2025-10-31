// istanbul ignore file: experimental
import React, { createRef, forwardRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import type { FeedbackDetail } from "./interfaces.js";
import { CruiseCanvasComponent, type CruiseCanvasRef } from "./CruiseCanvas.js";
import type {
  ExampleProject,
  RequestStore,
  ShowCaseType,
  UploadOptions,
} from "../shared/interfaces.js";

initializeI18n(NS, locales);

const { defineElement, property, event, method } = createDecorators();

export interface CruiseCanvasProps {
  conversationId?: string;
  initialRequest?: RequestStore | null;
  replay?: boolean;
  replayDelay?: number;
  supports?: Record<string, boolean>;
  showHiddenJobs?: boolean;
  showHumanActions?: boolean;
  showFeedback?: boolean;
  showFeedbackAfterFailed?: boolean;
  showUiSwitch?: boolean;
  showFeedbackOnView?: boolean;
  showJsxEditor?: boolean;
  previewUrlTemplate?: string;
  showCases?: ShowCaseType[];
  exampleProjects?: ExampleProject[];
  tryItOutUrl?: string;
  separateInstructions?: boolean;
  uploadOptions?: UploadOptions;
}

export interface ConversationDetail {
  projectId?: string;
}

const ForwardedCruiseCanvasComponent = forwardRef(CruiseCanvasComponent);

/**
 * 构件 `ai-portal.cruise-canvas`
 */
export
@defineElement("ai-portal.cruise-canvas", {
  // Will wrap v2 bricks which don't support in shadow DOM.
  shadowOptions: false,
})
class CruiseCanvas extends ReactNextElement implements CruiseCanvasProps {
  @property()
  accessor conversationId: string | undefined;

  /** 初始请求数据。仅初始设置有效。 */
  @property({ attribute: false, render: false })
  accessor initialRequest: RequestStore | undefined | null;

  /** 是否启用回放。仅初始设置有效。 */
  @property({ type: Boolean, render: false })
  accessor replay: boolean | undefined;

  /**
   * 设置回放时消息之间的时间间隔，单位为秒。仅初始设置有效。
   *
   * @default 2
   */
  @property({ type: Number, render: false })
  accessor replayDelay: number | undefined;

  @property({ attribute: false })
  accessor supports: Record<string, boolean> | undefined;

  @property({ type: Boolean })
  accessor showHiddenJobs: boolean | undefined;

  @property({ type: Boolean })
  accessor showHumanActions: boolean | undefined;

  @property({ type: Boolean })
  accessor showFeedback: boolean | undefined;

  @property({ type: Boolean })
  accessor showFeedbackAfterFailed: boolean | undefined;

  @property({ type: Boolean })
  accessor showFeedbackOnView: boolean | undefined;

  @property({ type: Boolean })
  accessor showUiSwitch: boolean | undefined;

  @property({ type: Boolean, render: false })
  accessor hideMermaid: boolean | undefined;

  @property({ type: Boolean })
  accessor showJsxEditor: boolean | undefined;

  @property()
  accessor previewUrlTemplate: string | undefined;

  @property({ attribute: false })
  accessor showCases: ShowCaseType[] | undefined;

  @property({ attribute: false })
  accessor exampleProjects: ExampleProject[] | undefined;

  @property()
  accessor tryItOutUrl: string | undefined;

  @property({ type: Boolean })
  accessor separateInstructions: boolean | undefined;

  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

  @event({ type: "share" })
  accessor #shareEvent!: EventEmitter<void>;

  #onShare = () => {
    this.#shareEvent.emit();
  };

  @event({ type: "terminate" })
  accessor #terminateEvent!: EventEmitter<void>;

  #onTerminate = () => {
    this.#terminateEvent.emit();
  };

  @event({ type: "feedback.submit" })
  accessor #feedbackSubmitEvent!: EventEmitter<FeedbackDetail>;

  #onSubmitFeedback = (detail: FeedbackDetail) => {
    this.#feedbackSubmitEvent.emit(detail);
  };

  @event({ type: "feedback.on.view" })
  accessor #feedbackOnViewEvent!: EventEmitter<string>;

  #onFeedbackOnView = (viewId: string) => {
    this.#feedbackOnViewEvent.emit(viewId);
  };

  @event({ type: "ui.switch" })
  accessor #switch!: EventEmitter<"chat">;

  #onSwitchToChat = () => {
    this.#switch.emit("chat");
  };

  @event({ type: "detail.change" })
  accessor #detailChange!: EventEmitter<ConversationDetail>;

  #onDetailChange = (detail: ConversationDetail) => {
    this.#detailChange.emit(detail);
  };

  #ref = createRef<CruiseCanvasRef>();

  @method()
  resumed() {
    this.#ref.current?.resumed?.();
  }

  @method()
  feedbackSubmitDone() {
    this.#ref.current?.feedbackSubmitDone();
  }

  @method()
  feedbackSubmitFailed() {
    this.#ref.current?.feedbackSubmitFailed();
  }

  @method()
  feedbackOnViewDone(viewId: string) {
    this.#ref.current?.feedbackOnViewDone(viewId);
  }

  render() {
    return (
      <ForwardedCruiseCanvasComponent
        conversationId={this.conversationId!}
        initialRequest={this.initialRequest}
        replay={this.replay}
        replayDelay={this.replayDelay}
        supports={this.supports}
        showHiddenJobs={this.showHiddenJobs}
        showHumanActions={this.showHumanActions}
        showFeedback={this.showFeedback}
        showFeedbackAfterFailed={this.showFeedbackAfterFailed}
        showUiSwitch={this.showUiSwitch}
        showFeedbackOnView={this.showFeedbackOnView}
        showJsxEditor={this.showJsxEditor}
        previewUrlTemplate={this.previewUrlTemplate}
        showCases={this.showCases}
        exampleProjects={this.exampleProjects}
        tryItOutUrl={this.tryItOutUrl}
        separateInstructions={this.separateInstructions}
        uploadOptions={this.uploadOptions}
        onShare={this.#onShare}
        onTerminate={this.#onTerminate}
        onSubmitFeedback={this.#onSubmitFeedback}
        onSwitchToChat={this.#onSwitchToChat}
        onFeedbackOnView={this.#onFeedbackOnView}
        onDetailChange={this.#onDetailChange}
        ref={this.#ref}
      />
    );
  }
}
