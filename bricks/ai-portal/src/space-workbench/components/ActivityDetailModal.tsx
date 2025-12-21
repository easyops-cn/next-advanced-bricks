import React, { useState, useEffect } from "react";
import { wrapBrick } from "@next-core/react-element";
import { handleHttpError } from "@next-core/runtime";
import {
  ElevoApi_listElevoAiEmployees,
  ElevoApi_ListElevoAiEmployeesResponseItem,
} from "@next-api-sdk/llm-sdk";

import type {
  Modal,
  ModalProps,
  ModalEvents,
  ModalMapEvents,
} from "@next-bricks/containers/modal";
import {
  EoUserOrUserGroupSelect,
  EoUserOrUserGroupSelectProps,
} from "@next-bricks/form-platform/user-or-user-group-select";
import { Select, SelectProps } from "@next-bricks/form/select";
import {
  MarkdownDisplay,
  MarkdownDisplayProps,
} from "@next-bricks/markdown/markdown-display";
import type { Activity } from "../interfaces.js";
import styles from "./ActivityDetailModal.module.css";

const WrappedModal = wrapBrick<
  Modal,
  ModalProps & { noFooter?: boolean },
  ModalEvents,
  ModalMapEvents
>("eo-modal", {
  onClose: "close",
  onConfirm: "confirm",
  onCancel: "cancel",
  onOpen: "open",
});

interface EoUserOrUserGroupSelectEvents {
  change: CustomEvent<string>;
}

interface EoUserOrUserGroupSelectMapEvents {
  onValueChange: "change";
}

const WrappedUserOrUserGroupSelect = wrapBrick<
  EoUserOrUserGroupSelect,
  EoUserOrUserGroupSelectProps,
  EoUserOrUserGroupSelectEvents,
  EoUserOrUserGroupSelectMapEvents
>("eo-user-or-user-group-select", {
  onValueChange: "change",
});

interface SelectEvents {
  change: CustomEvent<string>;
}

interface SelectMapEvents {
  onValueChange: "change";
}

const WrappedSelect = wrapBrick<
  Select,
  SelectProps,
  SelectEvents,
  SelectMapEvents
>("eo-select", {
  onValueChange: "change",
});

// 使用 any 类型来包装 eo-markdown-display，因为没有明确的类型定义
const WrappedMarkdownDisplay = wrapBrick<MarkdownDisplay, MarkdownDisplayProps>(
  "eo-markdown-display"
);

export interface ActivityDetailModalProps {
  activity: Activity | null;
  visible: boolean;
  onClose: () => void;
  onChange?: (updates: Activity) => void;
}

/**
 * 活动详情模态框组件
 * 展示活动的完整定义信息，部分字段可编辑（负责数字人、HITL介入用户）
 */
export function ActivityDetailModal({
  activity: _activity,
  visible,
  onClose,
  onChange,
}: ActivityDetailModalProps): React.ReactElement | null {
  const [aiEmployees, setAiEmployees] = useState<
    ElevoApi_ListElevoAiEmployeesResponseItem[]
  >([]);
  const [activity, setActivity] = useState<Activity | null>(_activity);

  // 获取数字人列表
  useEffect(() => {
    if (!visible) return;

    const fetchAssignees = async () => {
      try {
        // 调用实际的 API 获取数字人列表
        const employeesData = await ElevoApi_listElevoAiEmployees({
          page: 1,
          page_size: 100,
        });
        const options = employeesData.list.filter((item) => item.employeeId);
        setAiEmployees(options);
      } catch (error) {
        handleHttpError(error);
      }
    };

    fetchAssignees();
  }, [visible]);

  // 当 activity 变化时，更新选中的值
  useEffect(() => {
    setActivity(_activity);
  }, [_activity]);

  // 处理负责数字人变更
  const handleAssigneeChange = (event: CustomEvent) => {
    const value = event.detail.value;
    const newActivity = { ...activity, aiEmployeeId: value } as Activity;
    setActivity(newActivity);
    onChange?.(newActivity);
  };

  // 处理 HITL 用户变更
  const handleUserChange = (event: CustomEvent) => {
    const value = event.detail[0];
    const newActivity = { ...activity, hilUser: value } as Activity;
    setActivity(newActivity);
    onChange?.(newActivity);
  };

  if (!activity) return null;

  return (
    <WrappedModal
      modalTitle={activity.name}
      width={700}
      visible={visible}
      onCancel={onClose}
      onClose={onClose}
      noFooter
      maskClosable
    >
      <div className={styles.content}>
        {/* 活动描述区域 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>活动描述</div>
          <div className={styles.descriptionContent}>
            {activity.description ? (
              <WrappedMarkdownDisplay content={activity.description} />
            ) : (
              <div className={styles.emptyDescription}>暂无描述</div>
            )}
          </div>
        </div>

        {/* 负责数字人 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>负责数字人</div>
          <WrappedSelect
            value={activity.aiEmployeeId}
            themeVariant="elevo"
            options={
              aiEmployees?.map((item) => ({
                label: item.name as string,
                value: item.employeeId as string,
              })) ?? []
            }
            placeholder="请选择负责数字人"
            onValueChange={handleAssigneeChange}
            className={styles.select}
          />
        </div>

        {/* HITL 规则 */}
        {activity.hilRules && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>HITL规则</div>
            <div className={styles.hitlRuleItem}>{activity.hilRules}</div>
          </div>
        )}

        {/* HITL 介入用户 */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>HITL介入用户</div>
          <WrappedUserOrUserGroupSelect
            value={[activity.hilUser ?? ""]}
            placeholder="请选择HITL介入用户"
            optionsMode="user"
            userKey="name"
            isMultiple={false}
            themeVariant="elevo"
            onValueChange={handleUserChange}
          />
        </div>
      </div>
    </WrappedModal>
  );
}
