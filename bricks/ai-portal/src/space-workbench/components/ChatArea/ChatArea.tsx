import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
  forwardRef,
  useImperativeHandle,
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
import type {
  ChatPayload,
  ConversationPatch,
  RequestStore,
} from "../../../shared/interfaces.js";
import { Tabs } from "./Tabs.js";
import { WorkbenchContext } from "../../workbenchContext.js";
import { HistoryDrawer } from "../HistoryDrawer.js";
import { ConversationItem } from "../../interfaces.js";

export interface SessionTab {
  id: string;
  title: string;
  conversationId: string | null;
}

export interface ChatAreaProps {
  onChatSubmit?: (payload: ChatPayload) => void;
}

export interface ChatAreaRef {
  addNewSession: (initialRequest: RequestStore) => void;
  sendMessage: (payload: ChatPayload) => void;
}

const STORAGE_KEY_ACTIVE_TABS = "space_workbench_active_tabs";
const STORAGE_KEY_ACTIVE_TAB_ID = "space_workbench_active_tab_id";

export const ChatArea = forwardRef<ChatAreaRef, ChatAreaProps>(
  function ChatArea(_props, ref) {
    const [tabs, setTabs] = useState<SessionTab[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const chatPanelRef = useRef<ChatPanelContentRef>(null);
    const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);

    const processedConversationIdsRef = useRef<Set<string>>(new Set());

    const { uploadOptions, spaceDetail } = useContext(WorkbenchContext);
    const storage = useMemo(() => new JsonStorage(localStorage), []);
    const storageActiveTabsKey = `${STORAGE_KEY_ACTIVE_TABS}_${spaceDetail.instanceId}`;
    const storageActiveTabIdKey = `${STORAGE_KEY_ACTIVE_TAB_ID}_${spaceDetail.instanceId}`;

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

      return newTab.id;
    }, []);

    // 从 localStorage 加载 tabs
    useEffect(() => {
      const savedTabs = storage.getItem(storageActiveTabsKey);
      if (savedTabs?.length) {
        setTabs(savedTabs);

        // 尝试恢复之前激活的 tab
        const savedActiveTabId = storage.getItem(storageActiveTabIdKey);
        const tabExists = savedTabs.some(
          (tab: SessionTab) => tab.id === savedActiveTabId
        );

        // 如果保存的 tabId 存在于列表中则激活它,否则激活第一个
        setActiveTabId(tabExists ? savedActiveTabId : savedTabs[0].id);

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
    }, [
      storage,
      handleAddSession,
      storageActiveTabsKey,
      storageActiveTabIdKey,
    ]);

    // 保存 tabs 到 localStorage
    useEffect(() => {
      if (tabs.length > 0) {
        storage.setItem(storageActiveTabsKey, tabs);
      }
    }, [storage, tabs, storageActiveTabsKey]);

    // 保存当前激活的 tab id 到 localStorage
    useEffect(() => {
      if (activeTabId) {
        storage.setItem(storageActiveTabIdKey, activeTabId);
      }
    }, [storage, activeTabId, storageActiveTabIdKey]);

    const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
      const closingTab = tabs.find((tab) => tab.id === tabId);
      const newTabs = tabs.filter((tab) => tab.id !== tabId);

      setTabs(newTabs);

      // 清理 tabsData
      setTabsData((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tabId);
        return newMap;
      });

      // 清理 processedConversationIdsRef
      if (closingTab?.conversationId) {
        processedConversationIdsRef.current.delete(closingTab.conversationId);
      }

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
      async (payload: ChatPayload, targetTabId?: string) => {
        // 使用传入的 targetTabId 负责使用当前的 activeTabId
        const tabId = targetTabId || activeTabId;
        if (!tabId) return;

        const currentTabData = tabsData.get(tabId);

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
              newMap.set(tabId, {
                conversationId,
                initialRequest: {
                  ...payload,
                  conversationId,
                  spaceId: spaceDetail.instanceId,
                },
              });
              return newMap;
            });

            // 更新 tabs 中的 conversationId
            setTabs((prev) =>
              prev.map((tab) =>
                tab.id === tabId ? { ...tab, conversationId } : tab
              )
            );
          } catch (e) {
            handleHttpError(e);
          } finally {
            setSubmitDisabled(false);
          }
        }
      },
      [activeTabId, tabsData]
    );

    // 暴露 addNewSession 方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        addNewSession: (initialRequest: RequestStore) => {
          const newTabId = handleAddSession();

          // 如果 initialRequest 有 conversationId 但没有 content,说明是要加载已有会话
          // 这种情况下,conversationId 保存到 tab,但 initialRequest 设为 null
          // 这样 useConversationDetail 会进入 resume 模式
          const conversationId = initialRequest?.conversationId || null;
          const hasContent = initialRequest?.content;

          // 更新新 tab 的 initialRequest 和 conversationId
          setTabsData((prev) => {
            const newMap = new Map(prev);
            newMap.set(newTabId, {
              conversationId,
              // 只有当有 content 时才传递 initialRequest,否则传 null 触发 resume 模式
              initialRequest: hasContent ? initialRequest : null,
            });
            return newMap;
          });

          // 更新 tabs 中的 conversationId
          setTabs((prev) =>
            prev.map((tab) =>
              tab.id === newTabId
                ? {
                    ...tab,
                    conversationId,
                  }
                : tab
            )
          );
        },
        sendMessage: async (payload: ChatPayload) => {
          const newTabId = handleAddSession();
          await handleChatSubmit(payload, newTabId);
        },
      }),
      [handleAddSession, handleChatSubmit]
    );

    const handleData = useCallback((data: ConversationPatch) => {
      // 如果收到了会话标题,更新对应的 tab 标题
      if (data.title && data.id) {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.conversationId === data.id
              ? { ...tab, title: data.title! }
              : tab
          )
        );
      }

      // 当收到数据时,将该 conversationId 标记为已处理
      // 使用 ref 而不是 state，这样不会触发重新渲染，也不会中断 SSE 流
      // 当组件重新挂载时，我们会根据这个 ref 决定传 null 还是 initialRequest
      if (data.id) {
        processedConversationIdsRef.current.add(data.id);
      }
    }, []);

    const handleHistoryClick = () => {
      setHistoryDrawerVisible(true);
    };

    const handleHistoryDrawerClose = () => {
      setHistoryDrawerVisible(false);
    };

    const handleConversationClick = useCallback(
      (conversation: ConversationItem) => {
        // 检查是否已存在该 conversationId 的 tab
        const existingTab = tabs.find(
          (tab) => tab.conversationId === conversation.conversationId
        );

        if (existingTab) {
          // 如果已存在,直接激活该 tab
          setActiveTabId(existingTab.id);
        } else {
          // 如果不存在,创建新的 tab
          const newTab: SessionTab = {
            id: `session_${Date.now()}`,
            title: conversation.title || t(K.NEW_SESSION),
            conversationId: conversation.conversationId || null,
          };

          // 添加新 tab
          setTabs((prev) => [...prev, newTab]);
          setActiveTabId(newTab.id);

          // 初始化新 tab 的数据
          setTabsData((prev) => {
            const newMap = new Map(prev);
            newMap.set(newTab.id, {
              conversationId: conversation.conversationId || null,
              initialRequest: null,
            });
            return newMap;
          });
        }

        // 关闭历史抽屉
        setHistoryDrawerVisible(false);
      },
      [tabs]
    );

    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    const activeTabData = activeTabId ? tabsData.get(activeTabId) : undefined;

    // 计算有效的 initialRequest
    // 如果该 conversationId 已经被处理过（已发送过初始消息），则返回 null
    // 这样组件重新挂载时会进入 resume 模式
    const effectiveInitialRequest = useMemo(() => {
      const conversationId = activeTabData?.conversationId;
      const initialRequest = activeTabData?.initialRequest;

      // 如果没有 conversationId 或 initialRequest，直接返回 null
      if (!conversationId || !initialRequest) {
        return null;
      }

      // 如果该 conversationId 已经被处理过，返回 null 进入 resume 模式
      if (processedConversationIdsRef.current.has(conversationId)) {
        return null;
      }

      return initialRequest;
    }, [activeTabData?.conversationId, activeTabData?.initialRequest]);

    return (
      <div className={styles.chatArea}>
        <Tabs
          tabs={tabs}
          activeTabId={activeTabId}
          onTabClick={handleTabClick}
          onTabClose={handleCloseTab}
          onAddSession={handleAddSession}
          onHistoryClick={handleHistoryClick}
        />

        <div className={styles.chatContent}>
          {activeTab && (
            <ChatPanelContent
              key={activeTab.id}
              ref={chatPanelRef}
              conversationId={activeTabData?.conversationId || null}
              initialRequest={effectiveInitialRequest}
              uploadOptions={uploadOptions}
              submitDisabled={submitDisabled}
              onChatSubmit={handleChatSubmit}
              onData={handleData}
              placeholder={t(K.PLEASE_ENTER)}
              help={{
                useBrick: {
                  brick: "ai-portal.space-chat-guide",
                  properties: {
                    spaceDetail,
                  },
                },
              }}
            />
          )}
        </div>

        <HistoryDrawer
          visible={historyDrawerVisible}
          onClose={handleHistoryDrawerClose}
          onConversationClick={handleConversationClick}
        />
      </div>
    );
  }
);
