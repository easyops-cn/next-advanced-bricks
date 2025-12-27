import React, { useState, useEffect, useCallback } from "react";
import { handleHttpError } from "@next-core/runtime";
import { auth } from "@next-core/easyops-runtime";
import { humanizeTime, HumanizeTimeFormat } from "@next-shared/datetime";
import {
  ElevoSpaceApi_listActivityLogs,
  ElevoSpaceApi_createActivityLog,
} from "@next-api-sdk/llm-sdk";
import { WrappedTextarea, WrappedIcon } from "../../bricks";
import type { RequestStore } from "../../../shared/interfaces";
import { K, t } from "../../i18n";
import styles from "./ActivityLogs.module.css";

export interface ActivityLogsProps {
  objectId: string;
  objectInstanceId: string;
  spaceId: string;
  onLinkConversation: (initialRequest: RequestStore) => void;
}

interface ActivityLog {
  activityId: string;
  spaceId: string;
  objectId: string;
  objectInstanceId: string;
  conversationId: string;
  actionType:
    | "create_instance"
    | "edit_instance"
    | "comment"
    | "start_conversation"
    | "status_change";
  userName: string;
  payload: Record<string, any>;
  createTime: number;
}

export function ActivityLogs({
  objectId,
  objectInstanceId,
  spaceId,
  onLinkConversation,
}: ActivityLogsProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [commentValue, setCommentValue] = useState("");

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ElevoSpaceApi_listActivityLogs(spaceId, {
        objectId,
        objectInstanceId,
        limit: 200,
      });
      setActivities((res.list || []) as ActivityLog[]);
      setTotalCount(res.list?.length || 0);
    } catch (error) {
      handleHttpError(error);
    } finally {
      setLoading(false);
    }
  }, [spaceId, objectId, objectInstanceId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCommentSubmit = useCallback(async () => {
    if (!commentValue.trim()) {
      return;
    }

    setSubmitDisabled(true);
    try {
      const authInfo = auth.getAuth();
      const username = authInfo.username || "Anonymous";
      await ElevoSpaceApi_createActivityLog(spaceId, {
        objectId,
        objectInstanceId,
        actionType: "comment",
        userName: username,
        payload: { content: commentValue },
      });

      // 清空输入框
      setCommentValue("");
      // 刷新列表
      await fetchActivities();
    } catch (error) {
      handleHttpError(error);
    } finally {
      setSubmitDisabled(false);
    }
  }, [spaceId, objectId, objectInstanceId, commentValue, fetchActivities]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCommentSubmit();
      }
    },
    [handleCommentSubmit]
  );

  const formatTime = (timestamp: number): string => {
    const result = humanizeTime(timestamp * 1000, HumanizeTimeFormat.relative);
    return result || "";
  };

  const formatActivityText = (
    activity: ActivityLog
  ): { title: string; description: string; time: string } => {
    const { actionType, userName, payload } = activity;
    const time = formatTime(activity.createTime);

    switch (actionType) {
      case "create_instance":
        return {
          title: t(K.CREATED_INSTANCE),
          description: `${userName} ${t(K.CREATED_INSTANCE)}`,
          time,
        };

      case "edit_instance": {
        // 提取所有变更的字段名
        const changedFields = Object.keys(payload?.new || {});
        const fieldNames = changedFields.join(",");
        return {
          title: t(K.EDITED_INSTANCE),
          description: `${userName} ${t(K.EDITED_INSTANCE)}${fieldNames ? `-${fieldNames}` : ""}`,
          time,
        };
      }

      case "comment":
        return {
          title: t(K.COMMENTED),
          description: `${userName} ${t(K.COMMENTED)}: ${payload?.content || ""}`,
          time,
        };

      case "start_conversation":
        return {
          title: t(K.STARTED_CONVERSATION),
          description: `${userName} ${t(K.STARTED_CONVERSATION)}: ${payload?.title || ""}`,
          time,
        };

      case "status_change":
        return {
          title: t(K.STATUS_CHANGED),
          description: `${payload.conversationTitle || t(K.CONVERSATION)} ${t(K.CHANGED_STATUS_TO)}${payload.status || ""}`,
          time,
        };

      default:
        return { title: "", description: "", time: "" };
    }
  };

  const handleCardClick = (activity: ActivityLog) => {
    if (
      activity.actionType === "start_conversation" &&
      activity.conversationId
    ) {
      // 传递一个只有 conversationId 的对象,不包含 content
      // 这会让 ChatArea 以 null 作为 initialRequest,触发 resume 模式加载历史记录
      onLinkConversation({
        conversationId: activity.conversationId,
      } as RequestStore);
    }
  };

  const isClickable = (activity: ActivityLog): boolean => {
    return activity.actionType === "start_conversation";
  };

  const getIconType = (activity: ActivityLog): "info" | "conversation" => {
    return activity.actionType === "start_conversation"
      ? "conversation"
      : "info";
  };

  return (
    <div className={styles.container}>
      {/* 标题和计数 */}
      <div className={styles.header}>
        <h3 className={styles.title}>{t(K.ACTIVITY_RECORD)}</h3>
        {totalCount > 0 && (
          <span className={styles.countBadge}>{totalCount}</span>
        )}
      </div>

      {/* 活动记录列表 */}
      {loading ? (
        <div className={styles.loadingState}>{t(K.LOADING)}</div>
      ) : (
        <div className={styles.listContainer}>
          {activities.map((activity) => {
            const clickable = isClickable(activity);
            const iconType = getIconType(activity);
            const { title, description, time } = formatActivityText(activity);

            return (
              <div
                key={activity.activityId}
                className={`${styles.activityCard} ${
                  clickable ? styles.clickable : styles.disabled
                }`}
                onClick={() => clickable && handleCardClick(activity)}
              >
                {/* 图标 */}
                <div className={`${styles.iconWrapper} ${styles[iconType]}`}>
                  <WrappedIcon
                    lib="lucide"
                    icon={
                      iconType === "conversation" ? "message-square" : "info"
                    }
                    style={{ fontSize: "18px" }}
                  />
                </div>

                {/* 内容 */}
                <div className={styles.content}>
                  <div className={styles.titleRow}>
                    <div className={styles.activityTitle}>{title}</div>
                    <div className={styles.timeText}>{time}</div>
                  </div>
                  <div className={styles.activityDesc} title={description}>
                    {description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 评论输入框 */}
      <div className={styles.footer}>
        <WrappedTextarea
          themeVariant="elevo"
          placeholder={t(K.ADD_COMMENT_PLACEHOLDER)}
          value={commentValue}
          disabled={submitDisabled}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onValueChange={(e: CustomEvent<string>) => setCommentValue(e.detail)}
          onKeyDown={(e) =>
            handleKeyDown(
              e as unknown as React.KeyboardEvent<HTMLTextAreaElement>
            )
          }
        />
      </div>
    </div>
  );
}
