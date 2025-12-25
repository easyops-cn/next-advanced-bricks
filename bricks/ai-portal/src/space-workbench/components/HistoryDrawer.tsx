import React, { useState, useEffect, useRef, useContext } from "react";
import {
  ElevoApi_listElevoConversations,
  type ElevoApi_ListElevoConversationsRequestParams,
} from "@next-api-sdk/llm-sdk";
import moment from "moment";
import { WrappedDrawer, WrappedIcon, WrappedLink } from "../bricks.js";
import { ConversationItem } from "../interfaces.js";
import { WorkbenchContext } from "../workbenchContext.js";

import styles from "./HistoryDrawer.module.css";
import { K, t } from "../i18n.js";

export interface HistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  onConversationClick?: (conversation: ConversationItem) => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function HistoryDrawer(props: HistoryDrawerProps) {
  const { visible, onClose, onConversationClick } = props;
  const { spaceDetail } = useContext(WorkbenchContext);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const listRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef(true);

  const loadInitialHistory = async () => {
    setLoading(true);
    try {
      const data = await ElevoApi_listElevoConversations(
        {
          spaceInstanceId: spaceDetail?.instanceId,
          onlyOwner: true,
          limit: DEFAULT_PAGE_SIZE,
        } as ElevoApi_ListElevoConversationsRequestParams,
        {
          interceptorParams: {
            ignoreLoadingBar: true,
          },
        }
      );

      setConversations((data.conversations as ConversationItem[]) || []);
      setNextToken(data.nextToken);
      setHasMore(!!data.nextToken);
      initialRef.current = false;
    } catch (_error) {
      setConversations([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (visible && initialRef.current) {
      loadInitialHistory();
    }
  }, [visible]);

  const loadMore = async () => {
    if (loading || !hasMore || !nextToken) return;

    setLoading(true);
    try {
      const data = await ElevoApi_listElevoConversations(
        {
          spaceInstanceId: spaceDetail?.instanceId,
          token: nextToken,
          onlyOwner: true,
          limit: DEFAULT_PAGE_SIZE,
        } as ElevoApi_ListElevoConversationsRequestParams,
        {
          interceptorParams: {
            ignoreLoadingBar: true,
          },
        }
      );

      setConversations((prev) => [
        ...prev,
        ...((data.conversations as ConversationItem[]) || []),
      ]);
      setNextToken(data.nextToken);
      setHasMore(!!data.nextToken);
    } catch (_error) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation: ConversationItem) => {
    onConversationClick?.(conversation);
    onClose();
  };

  return (
    <WrappedDrawer
      visible={visible}
      width="400px"
      themeVariant="elevo"
      placement="right"
      onClose={onClose}
      customTitle={t(K.HISTORY_SESSIONS)}
      className={styles.drawer}
    >
      <div className={styles.historyList} ref={listRef}>
        {conversations.length === 0 && !loading ? (
          <div className={styles.emptyState}>
            <WrappedIcon
              lib="antd"
              icon="inbox"
              theme="outlined"
              className={styles.emptyStateIcon}
            />
            <p className={styles.emptyStateText}>{t(K.NO_HISTORY)}</p>
          </div>
        ) : (
          <>
            {conversations.map((conversation) => (
              <div
                key={conversation.conversationId}
                className={styles.historyItem}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className={styles.historyItemHeader}>
                  <span className={styles.historyItemTitle}>
                    {conversation.title}
                  </span>
                </div>
                {conversation.description && (
                  <p className={styles.historyItemPreview}>
                    {conversation.description}
                  </p>
                )}
                <div className={styles.historyItemFooter}>
                  <WrappedIcon
                    lib="antd"
                    icon="clock-circle"
                    theme="outlined"
                    className={styles.timeIcon}
                  />
                  <span className={styles.historyItemTime}>
                    {moment
                      .unix(
                        (conversation.updatedAt ||
                          conversation.startTime) as number
                      )
                      .format("YYYY-MM-DD HH:mm:ss")}
                  </span>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <WrappedLink type="text" disabled={loading} onClick={loadMore}>
                  {loading ? t(K.LOADING) : t(K.LOAD_MORE)}
                </WrappedLink>
              </div>
            )}
          </>
        )}
      </div>
    </WrappedDrawer>
  );
}
