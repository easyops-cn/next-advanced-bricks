import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
} from "react";
import { JsonStorage } from "@next-shared/general/JsonStorage";
import { handleHttpError } from "@next-core/runtime";
import { http } from "@next-core/http";
import {
  ChatPanelContent,
  ChatPanelContentRef,
} from "../../../chat-panel/ChatPanelContent.js";
import styles from "./ChatArea.module.css";
import { K, t } from "../../i18n.js";
import { SpaceDetail } from "../../interfaces.js";
import type {
  ChatPayload,
  ConversationPatch,
  RequestStore,
} from "../../../shared/interfaces.js";
import { Tabs } from "./Tabs.js";
import { WorkbenchContext } from "../../workbenchContext.js";

export interface SessionTab {
  id: string;
  title: string;
  conversationId: string | null;
}

export interface ChatAreaProps {
  spaceDetail: SpaceDetail;
  onHistoryClick?: () => void;
  onChatSubmit?: (payload: ChatPayload) => void;
}

const STORAGE_KEY_ACTIVE_TABS = "space_workbench_active_tabs";

export function ChatArea(props: ChatAreaProps) {
  const { spaceDetail, onHistoryClick } = props;
  const [tabs, setTabs] = useState<SessionTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const chatPanelRef = useRef<ChatPanelContentRef>(null);

  const { uploadOptions } = useContext(WorkbenchContext);
  const storage = useMemo(() => new JsonStorage(localStorage), []);

  // 存储每个 tab 对应的 conversationId 和 initialRequest
  const [tabsData, setTabsData] = useState<
    Map<
      string,
      { conversationId: string | null; initialRequest: RequestStore | null }
    >
  >(new Map());

  const handleAddSession = useCallback(() => {
    const newTab: SessionTab = {
      id: `session_${Date.now()}`,
      title: t(K.NEW_SESSION),
      conversationId: null,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);

    // 初始化新 tab 的数据
    setTabsData((prev) => {
      const newMap = new Map(prev);
      newMap.set(newTab.id, {
        conversationId: null,
        initialRequest: null,
      });
      return newMap;
    });
  }, []);

  // 从 localStorage 加载 tabs
  useEffect(() => {
    const savedTabs = storage.getItem(STORAGE_KEY_ACTIVE_TABS);
    if (savedTabs?.length) {
      setTabs(savedTabs);
      setActiveTabId(savedTabs[0].id);

      // 初始化 tabsData
      const newTabsData = new Map();
      savedTabs.forEach((tab: SessionTab) => {
        newTabsData.set(tab.id, {
          conversationId: tab.conversationId,
          initialRequest: null,
        });
      });
      setTabsData(newTabsData);
    } else {
      handleAddSession();
    }
  }, [storage, handleAddSession]);

  // 保存 tabs 到 localStorage
  useEffect(() => {
    if (tabs.length > 0) {
      storage.setItem(STORAGE_KEY_ACTIVE_TABS, tabs);
    }
  }, [storage, tabs]);

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const newTabs = tabs.filter((tab) => tab.id !== tabId);

    setTabs(newTabs);

    // 清理 tabsData
    setTabsData((prev) => {
      const newMap = new Map(prev);
      newMap.delete(tabId);
      return newMap;
    });

    // 如果关闭的是当前活跃的 tab，切换到相邻的 tab
    if (activeTabId === tabId && newTabs.length > 0) {
      const nextIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[nextIndex].id);
    }

    // 如果所有 tab 都关闭了，创建一个新的
    if (newTabs.length === 0) {
      handleAddSession();
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleChatSubmit = useCallback(
    async (payload: ChatPayload) => {
      if (!activeTabId) return;

      const currentTabData = tabsData.get(activeTabId);

      // 如果当前 tab 还没有 conversationId，则创建新的会话
      if (!currentTabData?.conversationId) {
        setSubmitDisabled(true);
        try {
          const res = await http.post<{
            data: { conversationId: string };
          }>(
            "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
            {}
          );
          const conversationId = res.data.conversationId;

          // 更新 tabsData
          setTabsData((prev) => {
            const newMap = new Map(prev);
            newMap.set(activeTabId, {
              conversationId,
              initialRequest: {
                ...payload,
                agentId: "elevo-space_configuration",
                cmd: {
                  type: "space-config",
                  payload: {
                    spaceInstanceId: spaceDetail.instanceId,
                  },
                },
                conversationId,
              },
            });
            return newMap;
          });

          // 更新 tabs 中的 conversationId
          setTabs((prev) =>
            prev.map((tab) =>
              tab.id === activeTabId ? { ...tab, conversationId } : tab
            )
          );
        } catch (e) {
          handleHttpError(e);
        } finally {
          setSubmitDisabled(false);
        }
      }
    },
    [activeTabId, tabsData, spaceDetail.instanceId]
  );

  const handleData = useCallback((data: ConversationPatch) => {
    // TODO: 处理对话数据
    // eslint-disable-next-line no-console
    console.log("conversation data:", data);
  }, []);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const activeTabData = activeTabId ? tabsData.get(activeTabId) : undefined;

  return (
    <div className={styles.chatArea}>
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onAddSession={handleAddSession}
        onHistoryClick={onHistoryClick}
      />

      <div className={styles.chatContent}>
        {activeTab && (
          <ChatPanelContent
            key={activeTab.id}
            ref={chatPanelRef}
            conversationId={activeTabData?.conversationId || null}
            initialRequest={activeTabData?.initialRequest || null}
            uploadOptions={uploadOptions}
            submitDisabled={submitDisabled}
            onChatSubmit={handleChatSubmit}
            onData={handleData}
            placeholder={t(K.PLEASE_ENTER)}
            help={{
              useBrick: {
                brick: "ai-portal.space-chat-guide",
                properties: {
                  spaceDetail: spaceDetail,
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
}
