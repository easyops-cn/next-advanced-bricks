import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import {
  ChatViewContext,
  QuickAnswerConfig,
  snippet,
} from "./ChatViewContext.js";
import { MessageList } from "./components/MessageList.js";
import { useChatViewInfo } from "./hooks/useChatViewInfo.js";
import { SessionList } from "./components/SessionList.js";
import { SearchInput, SearchInputRef } from "./components/SearchInput.js";
import "@next-core/theme";
import "./host-context.css";
import "./index.css";
import { commandBrickConf } from "./ChatViewContext";
import { UseBrickConf } from "@next-core/types";
import { ChatBody } from "./ChatService.js";

const { defineElement, property, method, event } = createDecorators();

type InputToolbarBrick = { useBrick: UseBrickConf };

export interface ChatViewRef extends SearchInputRef {
  setConfig(config: Record<string, unknown> | undefined): void;
  setFormData(formData: Record<string, unknown> | undefined): void;
}

export interface ChatViewProps {
  agentId: string;
  robotId: string;
  sessionId?: string;
  readonly?: boolean;
  showAvatar?: boolean;
  showSessionList?: boolean;
  showLike?: boolean;
  showShare?: boolean;
  useSpiltWord?: boolean;
  quickAnswerConfig?: QuickAnswerConfig;
  snippetList?: snippet[];
  enterInterval?: number;
  debug?: boolean;
  commandBricks?: commandBrickConf;
  answerLanguage?: string;
  inputToolbarBrick?: InputToolbarBrick;
  showToolCalls?: boolean;
  onSessionIdChange: (sessionId: string | undefined) => void;
  onRobotIdChange: (robotId: string | undefined) => void;
  onQaFinish: (sessionId: string | undefined) => void;
}

export function LegacyChatViewComponent(
  {
    agentId,
    robotId,
    sessionId,
    showAvatar,
    showSessionList = true,
    readonly = false,
    showLike = true,
    showShare = true,
    quickAnswerConfig,
    snippetList,
    enterInterval,
    debug = false,
    useSpiltWord = false,
    commandBricks,
    answerLanguage,
    inputToolbarBrick,
    showToolCalls,
    onSessionIdChange,
    onRobotIdChange,
    onQaFinish,
  }: ChatViewProps,
  ref: React.Ref<ChatViewRef>
) {
  const {
    sessionEnd,
    sessionLoading,
    activeSessionId,
    msgEnd,
    msgLoading,
    msgList,
    sessionList,
    loading,
    chatting,
    searchStr,
    toolNames,
    setAgent,
    handleIsLike,
    handleChat,
    stopChat,
    createSession,
    deleteSession,
    updateSession,
    checkSession,
    setSearchStr,
    querySessionHistory,
    setConfig,
    setFormData,
  } = useChatViewInfo({
    agentId,
    robotId,
    sessionId,
    enterInterval,
    debug,
    answerLanguage,
    useSpiltWord,
    showToolCalls,
  });

  useEffect(() => {
    if (activeSessionId) {
      onSessionIdChange(activeSessionId);
      onRobotIdChange(
        sessionList.find((item) => item.conversationId === activeSessionId)
          ?.robotId
      );
    }
  }, [activeSessionId, onRobotIdChange, onSessionIdChange, sessionList]);

  useEffect(() => {
    if (!chatting && activeSessionId) {
      // 当此时存在activeSessionId，且chatting是从true变为false时触发，不需要加入activeSessionId的依赖判断
      onQaFinish(activeSessionId);
    }
  }, [chatting]);

  const inputRef = useRef<SearchInputRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      handleInsertQuestion(value) {
        return inputRef.current?.handleInsertQuestion(value);
      },
      sendMsg(msg) {
        return inputRef.current?.sendMsg(msg);
      },
      setConfig,
      setFormData,
    }),
    [setConfig, setFormData]
  );

  return (
    <ChatViewContext.Provider
      value={{
        sessionEnd,
        sessionLoading,
        activeSessionId,
        sessionList,
        msgEnd,
        msgLoading,
        msgList,
        chatting,
        loading,
        searchStr,
        showLike,
        showShare,
        readonly,
        quickAnswerConfig,
        snippetList,
        commandBricks,
        showToolCalls,
        toolNames,
        setAgent,
        handleIsLike,
        handleChat,
        stopChat,
        createSession,
        deleteSession,
        updateSession,
        checkSession,
        setSearchStr,
        querySessionHistory,
      }}
    >
      <div className="chat-view-container">
        {showSessionList && (
          <div className="chat-view-selector">
            <SessionList />
          </div>
        )}
        <div className="chat-view-content">
          <MessageList showAvatar={showAvatar} />
          {!readonly && (
            <SearchInput inputToolbarBrick={inputToolbarBrick} ref={inputRef} />
          )}
        </div>
      </div>
    </ChatViewContext.Provider>
  );
}

export const ChatViewComponent = forwardRef(LegacyChatViewComponent);

/**
 * AI 对话终端
 */
export
@defineElement("ai.chat-view", {
  // shadow 模式下，会导致 useBrick 样式丢失
  // 如：commandBricks 配置 cmdb-instances.instance-list
  shadowOptions: false,
})
class ChatView extends ReactNextElement {
  @property()
  accessor sessionId: string | undefined;

  /**
   * 智能体id
   */
  @property()
  accessor agentId!: string;

  /**
   * 机器人id
   */
  @property()
  accessor robotId!: string;

  /**
   * 指定智能体回答代码时所使用的语言
   */
  @property()
  accessor answerLanguage: string | undefined;

  /**
   * 是否为debug模式
   */
  @property({
    type: Boolean,
  })
  accessor debug: boolean | undefined;

  /**
   * 是否展示对话用户头像
   * @default true
   */
  @property({
    type: Boolean,
  })
  accessor showAvatar: boolean | undefined;

  /**
   * 是否展示历史会话信息
   * @default true
   */
  @property({
    type: Boolean,
  })
  accessor showSessionList: boolean | undefined;

  /**
   * 只读模式
   */
  @property({
    type: Boolean,
  })
  accessor readonly: boolean | undefined;

  /**
   * 是否展示点赞能力
   * @default true
   */
  @property({
    type: Boolean,
  })
  accessor showLike: boolean | undefined;

  /**
   * 是否展示分享能力
   * @default true
   */
  @property({
    type: Boolean,
  })
  accessor showShare: boolean | undefined;

  /**
   * 是否开启前端分词
   * @default false
   */
  @property({
    type: Boolean,
  })
  accessor useSpiltWord: boolean | undefined;

  /**
   * 输入间隔，设置为 -1 使用新的方式对大段消息进行模拟打字效果节流输出
   *
   * @default 50
   */
  @property({
    type: Number,
  })
  accessor enterInterval: number | undefined;

  /**
   * 快速入口列表
   */
  @property({
    attribute: false,
  })
  accessor quickAnswerConfig: QuickAnswerConfig | undefined;

  /**
   * 常用语列表
   */
  @property({
    attribute: false,
  })
  accessor snippetList: snippet[] | undefined;

  /**
   * 自定义语言配置
   */
  @property({
    attribute: false,
  })
  accessor commandBricks: commandBrickConf | undefined;

  /**
   * 输入框工具栏 useBrick
   */
  @property({
    attribute: false,
  })
  accessor inputToolbarBrick: InputToolbarBrick | undefined;

  /**
   * 是否显示工具调用过程
   */
  @property({ type: Boolean })
  accessor showToolCalls: boolean | undefined;

  /** 设置接口 config */
  @method()
  setConfig(config: Record<string, unknown> | undefined): void {
    this.#ref.current?.setConfig(config);
  }

  /** 设置接口 formData */
  @method()
  setFormData(formData: Record<string, unknown> | undefined): void {
    this.#ref.current?.setFormData(formData);
  }

  #ref = React.createRef<ChatViewRef>();

  @event({ type: "sessionId.change" })
  accessor #sessionIdChange!: EventEmitter<string | undefined>;

  #handleSessionIdChange = (activeSessionId: string | undefined) => {
    this.#sessionIdChange.emit(activeSessionId);
  };

  @event({ type: "robotId.change" })
  accessor #robotIdChange!: EventEmitter<string | undefined>;

  #handleRobotIdChange = (robotId: string | undefined) => {
    this.#robotIdChange.emit(robotId);
  };

  @event({ type: "qa.finish" })
  accessor #qaFinish!: EventEmitter<string | undefined>;

  #handleQaFinish = (activeSessionId: string | undefined) => {
    this.#qaFinish.emit(activeSessionId);
  };

  /**
   *
   * @description 调用方法进行提问
   */
  @method()
  insertQuestion(args: { value: string }): void {
    const { value } = args;
    if (!value) return;
    this.#ref.current?.handleInsertQuestion(value);
  }

  /**
   * @description 外部提问
   */
  @method()
  sendMsg(msg: string | ChatBody): void {
    this.#ref.current?.sendMsg(msg);
  }

  render() {
    return (
      <ChatViewComponent
        agentId={this.agentId}
        robotId={this.robotId}
        debug={this.debug}
        sessionId={this.sessionId}
        readonly={this.readonly}
        showAvatar={this.showAvatar}
        showSessionList={this.showSessionList}
        showLike={this.showLike}
        showShare={this.showShare}
        useSpiltWord={this.useSpiltWord}
        quickAnswerConfig={this.quickAnswerConfig}
        snippetList={this.snippetList}
        enterInterval={this.enterInterval}
        commandBricks={this.commandBricks}
        answerLanguage={this.answerLanguage}
        inputToolbarBrick={this.inputToolbarBrick}
        showToolCalls={this.showToolCalls}
        onSessionIdChange={this.#handleSessionIdChange}
        onRobotIdChange={this.#handleRobotIdChange}
        onQaFinish={this.#handleQaFinish}
        ref={this.#ref}
      />
    );
  }
}
