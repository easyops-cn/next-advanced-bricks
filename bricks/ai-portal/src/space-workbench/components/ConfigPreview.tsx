import React, { useState } from "react";
import { BusinessObjectPreview } from "./BusinessObjectPreview";
import { BusinessFlowPreview } from "./BusinessFlowPreview";
import { EmptyState } from "./EmptyState";
import { BusinessObject, BusinessFlow, ViewType } from "../interfaces";
import { WrappedIcon } from "../../shared/bricks";
import styles from "./ConfigPreview.module.css";

export interface ConfigPreviewProps {
  businessObject?: BusinessObject | null;
  businessFlow?: BusinessFlow | null;
  viewType?: ViewType;
  onViewTypeChange?: (viewType: ViewType) => void;
}

/**
 * 配置预览容器组件
 * 参考设计图: node-id=125-1132, node-id=125-2022
 * 提供 Visual/JSON 视图切换功能，显示业务对象或业务流详情
 */
export function ConfigPreview({
  businessObject,
  businessFlow,
  viewType: externalViewType,
  onViewTypeChange,
}: ConfigPreviewProps): React.ReactElement {
  // 内部视图类型状态（当外部没有提供时使用）
  const [internalViewType, setInternalViewType] = useState<ViewType>("visual");
  const viewType = externalViewType ?? internalViewType;

  const handleViewTypeChange = (type: ViewType) => {
    if (onViewTypeChange) {
      onViewTypeChange(type);
    } else {
      setInternalViewType(type);
    }
  };

  // 判断是显示业务对象还是业务流
  const showBusinessObject = !!businessObject;
  const showBusinessFlow = !!businessFlow;
  const hasData = showBusinessObject || showBusinessFlow;

  return (
    <div className={styles.configPreviewContainer}>
      {/* 头部: Visual/JSON 视图切换 */}
      <div className={styles.configPreviewHeader}>
        <div className={styles.viewSwitcher}>
          <button
            className={`${styles.viewButton} ${viewType === "visual" ? styles.active : ""}`}
            onClick={() => handleViewTypeChange("visual")}
          >
            <WrappedIcon
              lib="antd"
              icon="eye"
              className={styles.viewButtonIcon}
            />
            Visual
          </button>
          <button
            className={`${styles.viewButton} ${viewType === "json" ? styles.active : ""}`}
            onClick={() => handleViewTypeChange("json")}
          >
            <WrappedIcon
              lib="antd"
              icon="code"
              className={styles.viewButtonIcon}
            />
            JSON
          </button>
        </div>
      </div>

      {/* 预览内容区域 */}
      <div className={styles.configPreviewBody}>
        {!hasData ? (
          <EmptyState
            title="暂无配置数据"
            description="请通过左侧对话引导 AI 生成配置"
          />
        ) : showBusinessObject ? (
          <BusinessObjectPreview data={businessObject} viewType={viewType} />
        ) : (
          <BusinessFlowPreview
            data={businessFlow ?? undefined}
            viewType={viewType}
          />
        )}
      </div>
    </div>
  );
}
