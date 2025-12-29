import React, { useCallback, useContext, useState } from "react";
import { ElevoObjectApi_updateServiceObjectInstance } from "@next-api-sdk/llm-sdk";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  ChatInput,
  ChatInputMapEvents,
  ChatInputEvents,
  ChatInputProps,
} from "../../../chat-input";
import { http } from "@next-core/http";
import { handleHttpError } from "@next-core/runtime";
import { BusinessInstance, BusinessObject } from "../../interfaces";
import { InstFieldsView } from "../BusinessInstanceCard";
import { K, t } from "../../i18n";
import { WorkbenchContext } from "../../workbenchContext";
import type { ChatPayload, RequestStore } from "../../../shared/interfaces";
import { ActivityLogs } from "./ActivityLogs";

import styles from "./InstDetailManagement.module.css";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const WrappedChatInput = wrapBrick<
  ChatInput,
  ChatInputProps,
  ChatInputEvents,
  ChatInputMapEvents
>("ai-portal.chat-input", {
  onChatSubmit: "chat.submit",
  onTerminate: "terminate",
});

export interface InstDetailManagementProps {
  instance: BusinessInstance;
  businessObject: BusinessObject;
  onClose: () => void;
  onNewConversation: (initialRequest: RequestStore) => void;
  onInstanceUpdate?: (updatedInstance: BusinessInstance) => void;
}

export function InstDetailManagement({
  instance,
  businessObject,
  onClose,
  onNewConversation,
  onInstanceUpdate,
}: InstDetailManagementProps) {
  const { uploadOptions, spaceDetail } = useContext(WorkbenchContext);
  const [submitDisabled, setSubmitDisabled] = useState(false);

  const handleChatSubmit = useCallback(
    async (e: CustomEvent<ChatPayload>) => {
      setSubmitDisabled(true);
      try {
        const res = await http.post<{
          data: { conversationId: string };
        }>(
          "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
          {}
        );
        const newConversationId = res.data.conversationId;

        const requestPayload = {
          ...e.detail,
          agentId: "elevo-service_object_instance_manager",
          cmd: {
            type: "serviceObjectInstance-createOrEdit",
            payload: {
              spaceInstanceId: spaceDetail.instanceId,
              serviceObjectId: businessObject.objectId,
              instanceId: instance.instanceId,
            },
          },
          conversationId: newConversationId,
        } as RequestStore;

        // 触发新建 tab 并跳回 ChatArea
        onNewConversation(requestPayload);
      } catch (e) {
        handleHttpError(e);
      } finally {
        setSubmitDisabled(false);
      }
    },
    [
      businessObject.objectId,
      instance.instanceId,
      onNewConversation,
      spaceDetail.instanceId,
    ]
  );

  const handleAttrChange = useCallback(
    async (attrId: string, value: any) => {
      try {
        // 调用更新接口
        await ElevoObjectApi_updateServiceObjectInstance(
          businessObject.objectId,
          instance.instanceId,
          {
            data: {
              [attrId]: value,
            },
          } as any
        );

        // 更新成功后，创建更新后的实例对象并通知父组件
        const updatedInstance = {
          ...instance,
          [attrId]: value,
        };
        onInstanceUpdate?.(updatedInstance);
      } catch (error) {
        handleHttpError(error);
      }
    },
    [businessObject.objectId, instance, onInstanceUpdate]
  );

  return (
    <div className={styles.instanceDetailContainer}>
      {/* 头部区域 */}
      <div className={styles.instanceDetailHeader}>
        <h2 className={styles.instanceDetailTitle}>
          {businessObject.objectName}
        </h2>
        <button className={styles.closeButton} onClick={onClose}>
          <WrappedIcon lib="lucide" icon="x" />
        </button>
      </div>

      {/* 主体内容区域 */}
      <div className={styles.instanceDetailBody}>
        {/* 左侧: 实例详细字段信息 (70%) */}
        <div className={styles.instanceDetailLeft}>
          {/* 实例详情内容区域 - 可滚动 */}
          <div className={styles.instanceDetailLeftWrapper}>
            <div className={styles.instanceDetailContent}>
              <InstFieldsView
                instance={instance}
                attrs={businessObject.attributes || []}
                onAttrChange={handleAttrChange}
              />
            </div>
            {/* 底部: 会话区域 - 固定在底部 */}
            <div className={styles.instanceDetailFooter}>
              <WrappedChatInput
                placeholder={t(K.INSTANCE_DETAIL_CHAT_PLACEHOLDER)}
                uploadOptions={uploadOptions}
                submitDisabled={submitDisabled}
                onChatSubmit={handleChatSubmit}
              />
            </div>
          </div>
        </div>

        {/* 右侧: 活动记录 (30%) */}
        <div className={styles.instanceDetailRight}>
          <ActivityLogs
            objectId={businessObject.objectId}
            objectInstanceId={instance.instanceId}
            spaceId={spaceDetail.instanceId}
            onLinkConversation={onNewConversation}
          />
        </div>
      </div>
    </div>
  );
}
