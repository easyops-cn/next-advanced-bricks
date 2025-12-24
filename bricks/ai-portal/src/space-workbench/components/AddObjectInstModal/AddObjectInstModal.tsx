import React, { useState, useCallback, useEffect, useContext } from "react";
import { handleHttpError } from "@next-core/runtime";
import { wrapBrick } from "@next-core/react-element";
import { ElevoObjectApi_importServiceObjectInstances } from "@next-api-sdk/llm-sdk";
import type {
  Modal,
  ModalProps,
  ModalEvents,
  ModalMapEvents,
} from "@next-bricks/containers/modal";
import { http } from "@next-core/http";
import type {
  ChatPayload,
  ConversationPatch,
  RequestStore,
} from "../../../shared/interfaces";
import { ChatPanelContent } from "../../../chat-panel/ChatPanelContent";
import { InstanceList } from "./InstanceList";

import styles from "./AddObjectInstModal.module.css";
import {
  SpaceDetail,
  BusinessObject,
  InstanceSchema,
  InstanceItem,
} from "../../interfaces";
import { K, t } from "../../i18n.js";
import { WorkbenchContext } from "../../workbenchContext";
import { BusinessInstanceDetail } from "../BusinessInstanceDetail";
import { mergeInstanceSchema } from "./utils";

const WrappedModal = wrapBrick<
  Modal,
  ModalProps & {
    themeVariant?: "default" | "elevo";
    headerBordered?: boolean;
  },
  ModalEvents,
  ModalMapEvents
>("eo-modal", {
  onClose: "close",
  onConfirm: "confirm",
  onCancel: "cancel",
  onOpen: "open",
});

export interface AddObjectInstModalProps {
  visible: boolean;
  spaceDetail: SpaceDetail;
  businessObject: BusinessObject;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddObjectInstModal({
  visible,
  spaceDetail,
  businessObject,
  onSuccess,
  onCancel,
}: AddObjectInstModalProps): React.ReactElement {
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );
  const [initialRequest, setInitialRequest] = useState<RequestStore | null>(
    null
  );
  const [instanceSchema, setInstanceSchema] = useState<InstanceSchema | null>(
    null
  );

  const { uploadOptions } = useContext(WorkbenchContext);

  // 从 instanceSchema.imports 获取实例列表
  const instances: InstanceItem[] = instanceSchema?.imports || [];

  // 重置状态
  useEffect(() => {
    if (visible) {
      setSelectedInstanceId(null);
      setConversationId(null);
      setInstanceSchema(null);
      setConfirmLoading(false);
    }
  }, [visible]);

  // 处理取消
  const handleCancel = () => {
    onCancel?.();
  };

  // 处理确认创建
  const handleConfirm = async () => {
    if (instances.length === 0) {
      return;
    }

    setConfirmLoading(true);
    try {
      // 过滤掉前端生成的 _id_ 字段
      const imports = instanceSchema?.imports?.map((instance) => {
        const { _id_, ...rest } = instance;
        return rest;
      });

      await ElevoObjectApi_importServiceObjectInstances(
        businessObject.objectId,
        {
          imports: imports,
          deletes: instanceSchema?.deletes,
        }
      );

      // 只有成功时才调用 onSuccess 关闭弹窗
      onSuccess?.();
    } catch (error) {
      // 失败时不关闭弹窗
      handleHttpError(error);
    } finally {
      setConfirmLoading(false);
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
          agentId: "elevo-service_object_instance_schema",
          cmd: {
            type: "serviceObjectInstance-createOrEdit",
            payload: {
              spaceInstanceId: spaceDetail.instanceId,
              serviceObjectId: businessObject.objectId,
            },
          },
          conversationId: conversationId,
        });
      } catch (e) {
        handleHttpError(e);
      } finally {
        setSubmitDisabled(false);
      }
    },
    [spaceDetail.instanceId, businessObject.objectId]
  );

  const handleData = useCallback((data: ConversationPatch) => {
    const firstPart = data?.tasks?.[0]?.jobs?.[0]?.messages?.[0]?.parts?.[0];

    // 检查是否是 DataPart 类型且 type 为 easy_cmd_instance
    if (
      firstPart?.type === "data" &&
      firstPart.data?.type === "easy_cmd_business_instance" &&
      firstPart.data?.content
    ) {
      const contentStr = firstPart.data.content;
      let currentInstanceSchema: InstanceSchema;
      try {
        currentInstanceSchema = JSON.parse(contentStr);
      } catch (error) {
        // 解析失败时静默返回，避免影响其他功能
        // eslint-disable-next-line no-console
        console.error(error);
        return;
      }

      setInstanceSchema((prevInstanceSchema) => {
        return mergeInstanceSchema(prevInstanceSchema, currentInstanceSchema);
      });
    }
  }, []);

  const handleDeleteInstance = useCallback((instanceId: string) => {
    setInstanceSchema((prev) => {
      if (!prev?.imports) return prev;
      return {
        ...prev,
        imports: prev.imports.filter((inst) => inst._id_ !== instanceId),
      };
    });
    setSelectedInstanceId((prev) => (prev === instanceId ? null : prev));
  }, []);

  const handleSelectInstance = useCallback((instanceId: string) => {
    setSelectedInstanceId(instanceId);
  }, []);

  // 根据 selectedInstanceId 获取选中的实例
  const selectedInstance = instances.find(
    (inst) => inst._id_ === selectedInstanceId
  );

  // 处理属性变更
  const handleAttrChange = useCallback(
    (attrId: string, value: any) => {
      if (!selectedInstanceId) return;

      setInstanceSchema((prev) => {
        if (!prev?.imports) return prev;
        return {
          ...prev,
          imports: prev.imports.map((inst) =>
            inst._id_ === selectedInstanceId
              ? { ...inst, [attrId]: value }
              : inst
          ),
        };
      });
    },
    [selectedInstanceId]
  );

  return (
    <WrappedModal
      themeVariant="elevo"
      headerBordered
      modalTitle={t(K.ADD_INSTANCE_MODAL_TITLE, {
        objectName: businessObject.objectName,
      })}
      width="90%"
      visible={visible}
      onCancel={handleCancel}
      onClose={handleCancel}
      closeWhenConfirm={false}
      onConfirm={handleConfirm}
      maskClosable={false}
      confirmText={t(K.CONFIRM_CREATE)}
      cancelText={t(K.CANCEL)}
      confirmDisabled={instances.length === 0 || confirmLoading}
    >
      <div className={styles.modalContent}>
        {/* 左侧: AI 助手对话区域 */}
        <div className={styles.aiAssistantArea}>
          <ChatPanelContent
            uploadOptions={uploadOptions}
            submitDisabled={submitDisabled}
            onChatSubmit={handleChatSubmit}
            conversationId={conversationId}
            initialRequest={initialRequest}
            onData={handleData}
            placeholder={t(K.PLEASE_ENTER)}
            help={{
              useBrick: {
                brick: "ai-portal.chat-panel-welcome",
                properties: {
                  text: t(K.ADD_INSTANCE_ASSISTANT_WELCOME),
                },
              },
            }}
          />
        </div>

        {/* 中间: 已识别实例列表 */}
        <div className={styles.instanceListArea}>
          <div className={styles.instanceListHeader}>
            <span className={styles.headerTitle}>
              {t(K.IDENTIFIED_INSTANCES)}
            </span>
            <div className={styles.instanceCount}>{instances.length}</div>
          </div>
          <InstanceList
            instances={instances}
            businessObject={businessObject}
            selectedInstanceId={selectedInstanceId}
            onSelect={handleSelectInstance}
            onDelete={handleDeleteInstance}
          />
        </div>

        {/* 右侧: 实例详情预览 */}
        <div className={styles.detailArea}>
          <BusinessInstanceDetail
            instance={selectedInstance}
            attrs={businessObject.attributes || []}
            onAttrChange={handleAttrChange}
          />
        </div>
      </div>
    </WrappedModal>
  );
}
