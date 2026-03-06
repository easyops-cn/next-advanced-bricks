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
import type {
  AIEmployee,
  Command,
} from "../shared/ChatCompletions/useChatCompletions.js";

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
  aiEmployees?: AIEmployee[];
  commands?: Command[];
  uploadOptions?: UploadOptions;
  hideMermaid?: boolean;
}

export interface ConversationDetail {
  projectId?: string;
}

const ForwardedCruiseCanvasComponent = forwardRef(CruiseCanvasComponent);

/**
 * AI 任务执行画布，以节点图形式展示任务的执行过程，支持任务回放、反馈及 UI 切换等功能。
 *
 * @description AI 任务执行画布，以节点图形式展示任务的执行过程，支持任务回放、反馈及 UI 切换等功能。
 * @category ai-portal
 */
export
@defineElement("ai-portal.cruise-canvas", {
  // Will wrap v2 bricks which don't support in shadow DOM.
  shadowOptions: false,
})
class CruiseCanvas extends ReactNextElement implements CruiseCanvasProps {
  /**
   * 对话 ID
   */
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

  /**
   * 功能开关配置，键为功能名，值为是否启用
   */
  @property({ attribute: false })
  accessor supports: Record<string, boolean> | undefined;

  /**
   * 是否显示隐藏的 Job 节点
   */
  @property({ type: Boolean })
  accessor showHiddenJobs: boolean | undefined;

  /**
   * 是否显示 Human-in-the-loop 操作按钮
   */
  @property({ type: Boolean })
  accessor showHumanActions: boolean | undefined;

  /**
   * 是否显示反馈按钮
   */
  @property({ type: Boolean })
  accessor showFeedback: boolean | undefined;

  /**
   * 是否在任务失败时也显示反馈按钮
   */
  @property({ type: Boolean })
  accessor showFeedbackAfterFailed: boolean | undefined;

  /**
   * 是否在查看生成视图时显示反馈按钮
   */
  @property({ type: Boolean })
  accessor showFeedbackOnView: boolean | undefined;

  /**
   * 是否显示切换到对话流视图的按钮
   */
  @property({ type: Boolean })
  accessor showUiSwitch: boolean | undefined;

  /**
   * 是否隐藏 Mermaid 图表渲染，通过 CSS 属性选择器控制样式
   */
  @property({ type: Boolean, render: false })
  accessor hideMermaid: boolean | undefined;

  /**
   * 是否显示 JSX 编辑器按钮
   */
  @property({ type: Boolean })
  accessor showJsxEditor: boolean | undefined;

  /**
   * 生成视图预览页的 URL 模板，支持 {viewId} 等字段插值
   */
  @property()
  accessor previewUrlTemplate: string | undefined;

  /**
   * 示例场景列表，用于在空对话时展示快速入口
   */
  @property({ attribute: false })
  accessor showCases: ShowCaseType[] | undefined;

  /**
   * 示例项目列表，用于展示可参考的已有项目
   */
  @property({ attribute: false })
  accessor exampleProjects: ExampleProject[] | undefined;

  /**
   * "试一试"跳转 URL
   */
  @property()
  accessor tryItOutUrl: string | undefined;

  /**
   * 是否将任务说明独立展示，而非内联在节点中
   */
  @property({ type: Boolean })
  accessor separateInstructions: boolean | undefined;

  /**
   * 可 @ 提及的数字人列表
   */
  @property({ attribute: false })
  accessor aiEmployees: AIEmployee[] | undefined;

  /**
   * 命令列表，支持通过 / 或搜索触发联想
   */
  @property({ attribute: false })
  accessor commands: Command[] | undefined;

  /**
   * 文件上传配置
   */
  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

  /**
   * @detail void
   * @description 用户点击分享时触发
   */
  @event({ type: "share" })
  accessor #shareEvent!: EventEmitter<void>;

  #onShare = () => {
    this.#shareEvent.emit();
  };

  /**
   * @detail void
   * @description 用户点击终止任务时触发
   */
  @event({ type: "terminate" })
  accessor #terminateEvent!: EventEmitter<void>;

  #onTerminate = () => {
    this.#terminateEvent.emit();
  };

  /**
   * @detail { plan: 计划步骤列表, result: 结果列表, feedback: 反馈文本 }
   * @description 用户提交反馈时触发
   */
  @event({ type: "feedback.submit" })
  accessor #feedbackSubmitEvent!: EventEmitter<FeedbackDetail>;

  #onSubmitFeedback = (detail: FeedbackDetail) => {
    this.#feedbackSubmitEvent.emit(detail);
  };

  /**
   * @detail 生成视图的 viewId
   * @description 用户查看生成视图时的反馈事件触发
   */
  @event({ type: "feedback.on.view" })
  accessor #feedbackOnViewEvent!: EventEmitter<string>;

  #onFeedbackOnView = (viewId: string) => {
    this.#feedbackOnViewEvent.emit(viewId);
  };

  /**
   * @detail 切换目标 UI 模式，值为 "chat"
   * @description 用户点击切换到对话流视图按钮时触发
   */
  @event({ type: "ui.switch" })
  accessor #switch!: EventEmitter<"chat">;

  #onSwitchToChat = () => {
    this.#switch.emit("chat");
  };

  /**
   * @detail { projectId: 关联的项目 ID }
   * @description 对话详情信息变化时触发
   */
  @event({ type: "detail.change" })
  accessor #detailChange!: EventEmitter<ConversationDetail>;

  #onDetailChange = (detail: ConversationDetail) => {
    this.#detailChange.emit(detail);
  };

  #ref = createRef<CruiseCanvasRef>();

  /**
   * 通知组件任务已恢复，用于继续中断的对话
   */
  @method()
  resumed() {
    this.#ref.current?.resumed?.();
  }

  /**
   * 通知组件反馈提交成功
   */
  @method()
  feedbackSubmitDone() {
    this.#ref.current?.feedbackSubmitDone();
  }

  /**
   * 通知组件反馈提交失败
   */
  @method()
  feedbackSubmitFailed() {
    this.#ref.current?.feedbackSubmitFailed();
  }

  /**
   * 通知组件查看视图的反馈处理完成
   * @param viewId 对应的视图 ID
   */
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
        aiEmployees={this.aiEmployees}
        commands={this.commands}
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
