// istanbul ignore file
import React, { useState, useCallback, useEffect } from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ElevoSpaceApi_listServiceFlow } from "@next-api-sdk/llm-sdk";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import {
  NS as ChatStreamNS,
  locales as ChatStreamLocales,
} from "../chat-stream/i18n.js";
import styles from "./styles.module.css";
import type { NoticeItem } from "../notice-dropdown/index.js";
import {
  SpaceDetail,
  BusinessInstance,
  BusinessObject,
  InstanceUpdateTrigger,
} from "./interfaces.js";
import type { UploadOptions, RequestStore } from "../shared/interfaces.js";
import { SpaceNav } from "./components/SpaceNav.js";
import { SpaceSidebar } from "./components/SpaceSidebar.js";
import { ChatArea, ChatAreaRef } from "./components/ChatArea/ChatArea.js";

import { WorkbenchContext } from "./workbenchContext.js";
import type { BusinessFlow, KnowledgeItem } from "./interfaces.js";
import { InstDetailManagement } from "./components/InstDetailManagement/InstDetailManagement.js";
import { ServiceFlows } from "./components/ServiceFlows.js";
import { K, t } from "./i18n.js";

initializeI18n(NS, locales);
initializeI18n(ChatStreamNS, ChatStreamLocales);

const { defineElement, property, event } = createDecorators();

export interface SpaceWorkbenchProps {
  notifyCenterUrl: string;
  spaceDetail: SpaceDetail;
  notices?: NoticeItem[];
  knowledges?: KnowledgeItem[];
  uploadOptions?: UploadOptions;
}

/**
 * 构件 `ai-portal.space-workbench`
 *
 * 协作空间工作台，集成顶部导航、侧边栏（知识库、业务实例）、聊天区域和服务流等核心功能的一体化工作台构件。
 */
export
@defineElement("ai-portal.space-workbench", {
  shadowOptions: false,
})
class SpaceWorkbench extends ReactNextElement implements SpaceWorkbenchProps {
  /** 消息通知列表 */
  @property({ attribute: false })
  accessor notices: NoticeItem[] | undefined;

  /** 知识库列表 */
  @property({ attribute: false })
  accessor knowledges: KnowledgeItem[] | undefined;

  /** 空间详情信息，必填 */
  @property({ attribute: false })
  accessor spaceDetail!: SpaceDetail;

  /** 消息中心跳转链接，必填 */
  @property()
  accessor notifyCenterUrl!: string;

  /** 文件上传配置选项 */
  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

  /**
   * @description 点击返回按钮时触发
   */
  @event({ type: "go.back" })
  accessor #_goBackEvent!: EventEmitter<void>;

  /**
   * @description 点击成员按钮时触发
   */
  @event({ type: "members.click" })
  accessor #_membersClickEvent!: EventEmitter<void>;

  /**
   * @description 点击消息通知项时触发
   * @detail { id: 消息ID, type: 消息类型, isRead: 是否已读, title: 标题, time: 时间戳 }
   */
  @event({ type: "notice.click" })
  accessor #_noticeClickEvent!: EventEmitter<NoticeItem>;

  /**
   * @description 点击全部已读按钮时触发
   */
  @event({ type: "mark.all.read" })
  accessor #_markAllReadEvent!: EventEmitter<void>;

  /**
   * @description 点击编辑空间按钮时触发
   */
  @event({ type: "space.edit" })
  accessor #_spaceEditEvent!: EventEmitter<void>;

  /**
   * @description 点击知识条目时触发
   * @detail 知识条目数据
   */
  @event({ type: "knowledge.click" })
  accessor #_knowledgeClickEvent!: EventEmitter<KnowledgeItem>;

  /**
   * @description 点击添加知识按钮时触发
   */
  @event({ type: "knowledge.add" })
  accessor #_knowledgeAddEvent!: EventEmitter<void>;

  render() {
    return (
      <SpaceWorkbenchComponent
        spaceDetail={this.spaceDetail}
        knowledges={this.knowledges}
        notices={this.notices}
        uploadOptions={this.uploadOptions}
        notifyCenterUrl={this.notifyCenterUrl}
        onBack={() => this.#_goBackEvent.emit()}
        onMembersClick={() => this.#_membersClickEvent.emit()}
        onNoticeClick={(notice) => this.#_noticeClickEvent.emit(notice)}
        onMarkAllRead={() => this.#_markAllReadEvent.emit()}
        onSpaceEdit={() => this.#_spaceEditEvent.emit()}
        onKnowledgeClick={(knowledge) =>
          this.#_knowledgeClickEvent.emit(knowledge)
        }
        onKnowledgeAdd={() => this.#_knowledgeAddEvent.emit()}
      />
    );
  }
}

interface SpaceWorkbenchComponentProps extends SpaceWorkbenchProps {
  onBack: () => void;
  onMembersClick: () => void;
  onMarkAllRead: () => void;
  onNoticeClick: (notice: NoticeItem) => void;
  onSpaceEdit: () => void;
  onKnowledgeClick: (knowledge: KnowledgeItem) => void;
  onKnowledgeAdd: () => void;
}

function SpaceWorkbenchComponent(props: SpaceWorkbenchComponentProps) {
  const {
    spaceDetail,
    knowledges,
    notices = [],
    notifyCenterUrl,
    uploadOptions,
    onBack,
    onMembersClick,
    onMarkAllRead,
    onNoticeClick,
    onSpaceEdit,
    onKnowledgeClick,
    onKnowledgeAdd,
  } = props;

  // 视图状态管理: 'chat' | 'instance-detail'
  const [currentView, setCurrentView] = useState<"chat" | "instance-detail">(
    "chat"
  );
  const [selectedInstance, setSelectedInstance] =
    useState<BusinessInstance | null>(null);
  const [selectedBusinessObject, setSelectedBusinessObject] =
    useState<BusinessObject | null>(null);

  // 实例更新触发器
  const [instanceUpdateTrigger, setInstanceUpdateTrigger] = useState<
    InstanceUpdateTrigger | undefined
  >(undefined);

  const [businessFlows, setBusinessFlows] = useState<
    BusinessFlow[] | undefined
  >(undefined);

  // 添加一个用于触发新会话的回调引用
  const chatAreaRef = React.useRef<ChatAreaRef>(null);

  // 处理点击实例卡片
  const handleInstanceClick = useCallback(
    (instance: BusinessInstance, businessObject: BusinessObject) => {
      setSelectedInstance(instance);
      setSelectedBusinessObject(businessObject);
      setCurrentView("instance-detail");
    },
    []
  );

  // 处理关闭实例详情
  const handleCloseInstanceDetail = useCallback(() => {
    setCurrentView("chat");
    setSelectedInstance(null);
    setSelectedBusinessObject(null);
  }, []);

  // 处理从实例详情页新建会话
  const handleNewConversation = useCallback((initialRequest: RequestStore) => {
    // 先切换回聊天视图
    setCurrentView("chat");
    setSelectedInstance(null);
    setSelectedBusinessObject(null);

    // 通知 ChatArea 创建新 tab
    // ChatArea 会根据 initialRequest.content 判断是新建会话还是加载已有会话
    setTimeout(() => {
      chatAreaRef.current?.addNewSession(initialRequest);
    });
  }, []);

  // 处理实例数据更新
  const handleInstanceUpdate = useCallback(
    (updatedInstance: BusinessInstance) => {
      if (!selectedBusinessObject) return;

      // 更新当前选中的实例
      setSelectedInstance(updatedInstance);

      // 触发 BusinessCategoryPanel 更新 objectInstancesMap
      setInstanceUpdateTrigger({
        objectId: selectedBusinessObject.objectId,
        instanceId: updatedInstance.instanceId,
        updatedData: updatedInstance,
        timestamp: Date.now(),
      });
    },
    [selectedBusinessObject]
  );

  // 处理业务流卡片点击
  const handleFlowClick = useCallback((flow: BusinessFlow) => {
    const message = t(K.INITIATING_SERVICE_FLOW, { name: flow.name });
    chatAreaRef.current?.sendMessage({ content: message });
  }, []);

  useEffect(() => {
    const fetchBusinessFlows = async () => {
      const res = await ElevoSpaceApi_listServiceFlow(spaceDetail.instanceId, {
        page: 1,
        pageSize: 1000,
      });
      setBusinessFlows(res.list as BusinessFlow[]);
    };
    fetchBusinessFlows();
  }, [spaceDetail.instanceId]);

  return (
    <WorkbenchContext.Provider value={{ spaceDetail, uploadOptions }}>
      <div className={styles.container}>
        <div className={styles.spaceWorkbenchContainer}>
          <SpaceNav
            spaceDetail={spaceDetail}
            notifyCenterUrl={notifyCenterUrl}
            notices={notices}
            onBack={onBack}
            onMembersClick={onMembersClick}
            onMarkAllRead={onMarkAllRead}
            onNoticeClick={onNoticeClick}
            onSpaceEdit={onSpaceEdit}
          />
          <div className={styles.spaceWorkbenchContent}>
            <SpaceSidebar
              knowledgeList={knowledges}
              onKnowledgeClick={onKnowledgeClick}
              onKnowledgeAdd={onKnowledgeAdd}
              onInstanceClick={handleInstanceClick}
              instanceUpdateTrigger={instanceUpdateTrigger}
            />
            {currentView === "chat" ? (
              <>
                <ChatArea ref={chatAreaRef} />
                <ServiceFlows
                  businessFlows={businessFlows}
                  onFlowClick={handleFlowClick}
                />
              </>
            ) : (
              selectedInstance &&
              selectedBusinessObject && (
                <InstDetailManagement
                  instance={selectedInstance}
                  businessObject={selectedBusinessObject}
                  onClose={handleCloseInstanceDetail}
                  onNewConversation={handleNewConversation}
                  onInstanceUpdate={handleInstanceUpdate}
                />
              )
            )}
          </div>
        </div>
      </div>
    </WorkbenchContext.Provider>
  );
}
