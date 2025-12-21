import React, { useState, useCallback, useEffect } from "react";
import { handleHttpError } from "@next-core/runtime";
import { wrapBrick } from "@next-core/react-element";
import type {
  Modal,
  ModalProps,
  ModalEvents,
  ModalMapEvents,
} from "@next-bricks/containers/modal";
import { http } from "@next-core/http";
import { ElevoSpaceApi_importSpaceSchema } from "@next-api-sdk/llm-sdk";
import { ConfigContext } from "./ConfigContext";
import type {
  ChatPayload,
  ConversationPatch,
  RequestStore,
} from "../../../shared/interfaces";
import { ChatPanelContent } from "../../../chat-panel/ChatPanelContent";
import { BusinessManage } from "../BusinessManage";

import styles from "./SpaceConfigModal.module.css";
import { Activity, SpaceConfigSchema, SpaceDetail } from "../../interfaces";
import { mergeConfigSchema, handleModifyActivity } from "./utils";

const WrappedModal = wrapBrick<Modal, ModalProps, ModalEvents, ModalMapEvents>(
  "eo-modal",
  {
    onClose: "close",
    onConfirm: "confirm",
    onCancel: "cancel",
    onOpen: "open",
  }
);

export interface SpaceConfigModalProps {
  visible: boolean;
  spaceDetail: SpaceDetail;
  configSchema: SpaceConfigSchema;
  aiEmployeeId?: string;
  conversationId?: string;
  onSave?: (data: SpaceConfigSchema) => void;
  onCancel?: () => void;
}

export function SpaceConfigModal({
  visible,
  spaceDetail,
  configSchema: initialConfigSchema,
  aiEmployeeId,
  onSave,
  onCancel,
}: SpaceConfigModalProps): React.ReactElement {
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [configSchema, setConfigSchema] =
    useState<SpaceConfigSchema>(initialConfigSchema);

  const [initialRequest, setInitialRequest] = useState<RequestStore | null>(
    null
  );

  // 当外部传入的 configSchema 变化时，同步更新内部状态
  useEffect(() => {
    setConfigSchema(initialConfigSchema);
  }, [initialConfigSchema]);

  // 处理取消
  const handleCancel = () => {
    onCancel?.();
  };

  // 处理保存
  const handleSave = async () => {
    try {
      await ElevoSpaceApi_importSpaceSchema(
        spaceDetail.instanceId,
        configSchema
      );
      onSave?.(configSchema);
    } catch (error) {
      handleHttpError(error);
    }
  };

  const handleChatSubmit = useCallback(
    async (payload: ChatPayload) => {
      setSubmitDisabled(true);
      try {
        const res = await http.post<{
          data: { conversationId: string };
        }>(
          "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
          {}
        );
        const conversationId = res.data.conversationId;
        setConversationId(conversationId);
        setInitialRequest({
          ...payload,
          agentId: "elevo-service_object_schema",
          cmd: {
            type: "space-config",
            payload: {
              spaceInstanceId: spaceDetail.instanceId,
            },
          },
          ...(aiEmployeeId ? { aiEmployeeId } : null),
          conversationId: conversationId,
        });
      } catch (e) {
        handleHttpError(e);
      } finally {
        setSubmitDisabled(false);
      }
    },
    [aiEmployeeId, spaceDetail.instanceId]
  );

  const handleData = useCallback(
    (data: ConversationPatch) => {
      // 检查数据结构是否存在且类型匹配

      const firstPart = data?.tasks?.[0]?.jobs?.[0]?.messages?.[0]?.parts?.[0];

      // 检查是否是 DataPart 类型且 type 为 easy_cmd_business_object
      if (
        firstPart?.type === "data" &&
        firstPart.data?.type === "easy_cmd_business_object" &&
        firstPart.data?.content
      ) {
        // 解析 content 字段
        const contentStr = firstPart.data.content;
        let currentEditSchema: SpaceConfigSchema;
        try {
          currentEditSchema = JSON.parse(contentStr);
        } catch (error) {
          // 解析失败时静默返回，避免影响其他功能
          // eslint-disable-next-line no-console
          console.error(error);
          return;
        }
        const mergedConfigSchema = mergeConfigSchema(
          configSchema,
          currentEditSchema
        );

        // 更新 configSchema
        setConfigSchema(mergedConfigSchema);
      }
    },
    [configSchema]
  );

  const modifyActivity = useCallback(
    (stageName: string, newActivity: Activity) => {
      setConfigSchema((prevConfigSchema) => {
        const newConfigSchema = handleModifyActivity(
          prevConfigSchema,
          stageName,
          newActivity
        );
        return newConfigSchema;
      });
    },
    []
  );

  return (
    <ConfigContext.Provider value={{ modifyActivity }}>
      <WrappedModal
        themeVariant="elevo"
        headerBordered
        modalTitle="协作空间配置"
        width="90%"
        visible={visible}
        onCancel={handleCancel}
        onClose={handleCancel}
        onConfirm={handleSave}
        maskClosable={false}
        confirmText="保存配置"
        cancelText="取消"
      >
        <div className={styles.modalContent}>
          {/* 左侧: AI 助手对话区域 */}
          <div className={styles.aiAssistantArea}>
            <ChatPanelContent
              submitDisabled={submitDisabled}
              onChatSubmit={handleChatSubmit}
              conversationId={conversationId}
              initialRequest={initialRequest}
              onData={handleData}
              placeholder="请输入"
              help={{
                useBrick: {
                  brick: "ai-portal.chat-panel-welcome",
                  properties: {
                    text: "您好！我是协作空间配置助手。您可以告诉我描述你的业务流程，我会为你自动生成相关的业务对象和业务流，你也可以明确让我修改哪个业务对象或业务流。",
                  },
                },
              }}
            />
          </div>

          {/* 业务对象/业务流列表区域 和 配置详情预览区域 */}
          <BusinessManage configSchema={configSchema} />
        </div>
      </WrappedModal>
    </ConfigContext.Provider>
  );
}
