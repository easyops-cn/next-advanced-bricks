// istanbul ignore file: experimental
import React, { createRef, forwardRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import type { Job, TaskBaseDetail, FeedbackDetail } from "./interfaces.js";
import { LegacyCruiseCanvasComponent } from "./LegacyCruiseCanvas.js";
import { CruiseCanvasComponent, type CruiseCanvasRef } from "./CruiseCanvas.js";
import type { RequestStore } from "../shared/interfaces.js";

initializeI18n(NS, locales);

const { defineElement, property, event, method } = createDecorators();

export interface CruiseCanvasProps {
  conversationId?: string;
  initialRequest?: RequestStore | null;
  taskId?: string;
  task?: TaskBaseDetail;
  jobs?: Job[];
  replay?: boolean;
  replayDelay?: number;
  supports?: Record<string, boolean>;
  showHiddenJobs?: boolean;
  showFeedback?: boolean;
  showFeedbackAfterFailed?: boolean;
  showUiSwitch?: boolean;
  showFeedbackOnView?: boolean;
  showJsxEditor?: boolean;
  previewUrlTemplate?: string;
}

export interface ConversationDetail {
  projectId?: string;
}

const ForwardedLegacyCruiseCanvasComponent = forwardRef(
  LegacyCruiseCanvasComponent
);

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

  @property()
  accessor taskId: string | undefined;

  @property({ attribute: false })
  accessor task: TaskBaseDetail | undefined;

  @property({ attribute: false })
  accessor jobs: Job[] | undefined;

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
    const Component = this.conversationId
      ? ForwardedCruiseCanvasComponent
      : ForwardedLegacyCruiseCanvasComponent;
    return (
      <Component
        conversationId={this.conversationId!}
        initialRequest={this.initialRequest}
        taskId={this.taskId}
        jobs={this.jobs}
        task={this.task}
        replay={this.replay}
        replayDelay={this.replayDelay}
        supports={this.supports}
        showHiddenJobs={this.showHiddenJobs}
        showFeedback={this.showFeedback}
        showFeedbackAfterFailed={this.showFeedbackAfterFailed}
        showUiSwitch={this.showUiSwitch}
        showFeedbackOnView={this.showFeedbackOnView}
        showJsxEditor={this.showJsxEditor}
        previewUrlTemplate={this.previewUrlTemplate}
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
