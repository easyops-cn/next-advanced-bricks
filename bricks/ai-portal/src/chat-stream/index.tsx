// istanbul ignore file: experimental
import React, { createRef, forwardRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import type { FeedbackDetail } from "../cruise-canvas/interfaces.js";
import { LegacyChatStreamComponent } from "./LegacyChatStream.js";
import { ChatStreamComponent } from "./ChatStream.js";
import type { RequestStore } from "../shared/interfaces.js";

initializeI18n(NS, locales);

const { defineElement, property, event, method } = createDecorators();

export interface ChatStreamProps {
  conversationId?: string;
  initialRequest?: RequestStore | null;
  taskId?: string;
  replay?: boolean;
  replayDelay?: number;
  supports?: Record<string, boolean>;
  showFeedback?: boolean;
  showFeedbackAfterFailed?: boolean;
  showFeedbackOnView?: boolean;
  showUiSwitch?: boolean;
}

const ForwardedLegacyChatStreamComponent = forwardRef(
  LegacyChatStreamComponent
);

const ForwardedChatStreamComponent = forwardRef(ChatStreamComponent);

/**
 * 构件 `ai-portal.chat-stream`
 */
export
@defineElement("ai-portal.chat-stream", {
  // Will wrap v2 bricks which don't support in shadow DOM.
  shadowOptions: false,
})
class ChatStream extends ReactNextElement implements ChatStreamProps {
  @property()
  accessor conversationId: string | undefined;

  /** 初始请求数据。仅初始设置有效。 */
  @property({ attribute: false, render: false })
  accessor initialRequest: RequestStore | undefined | null;

  @property()
  accessor taskId: string | undefined;

  /** 是否启用回放。仅初始设置有效。 */
  @property({ type: Boolean })
  accessor replay: boolean | undefined;

  /**
   * 设置回放时消息之间的时间间隔，单位为秒。仅初始设置有效。
   *
   * @default 2
   */
  @property({ type: Number })
  accessor replayDelay: number | undefined;

  @property({ attribute: false })
  accessor supports: Record<string, boolean> | undefined;

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
  accessor #switch!: EventEmitter<"canvas">;

  #onSwitchToCanvas = () => {
    this.#switch.emit("canvas");
  };

  #ref = createRef<ChatStreamRef>();

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
      ? ForwardedChatStreamComponent
      : ForwardedLegacyChatStreamComponent;
    return (
      <Component
        conversationId={this.conversationId!}
        initialRequest={this.initialRequest}
        taskId={this.taskId}
        replay={this.replay}
        replayDelay={this.replayDelay}
        supports={this.supports}
        showFeedback={this.showFeedback}
        showFeedbackAfterFailed={this.showFeedbackAfterFailed}
        showFeedbackOnView={this.showFeedbackOnView}
        showUiSwitch={this.showUiSwitch}
        onShare={this.#onShare}
        onTerminate={this.#onTerminate}
        onSubmitFeedback={this.#onSubmitFeedback}
        onSwitchToCanvas={this.#onSwitchToCanvas}
        onFeedbackOnView={this.#onFeedbackOnView}
      />
    );
  }
}

export interface ChatStreamRef {
  resumed?: () => void;
  feedbackSubmitDone: () => void;
  feedbackSubmitFailed: () => void;
  feedbackOnViewDone: (viewId: string) => void;
}
