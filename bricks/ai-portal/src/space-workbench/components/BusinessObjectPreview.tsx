import React from "react";

import { WrappedIcon } from "../../shared/bricks";
import styles from "./BusinessObjectPreview.module.css";
import { BusinessObject } from "../interfaces";
import { ViewType } from "../interfaces";
import { wrapBrick } from "@next-core/react-element";
import type {
  MarkdownDisplayProps,
  MarkdownDisplay,
} from "@next-bricks/markdown/markdown-display";

export interface BusinessObjectPreviewProps {
  data?: BusinessObject;
  viewType?: ViewType;
}

const WrappedMarkdownDisplay = wrapBrick<MarkdownDisplay, MarkdownDisplayProps>(
  "eo-markdown-display"
);
/**
 * 业务对象预览组件
 * 参考设计图: node-id=125-1132
 * 展示业务对象的标题、字段定义和生命周期状态
 */
export function BusinessObjectPreview({
  data,
  viewType = "visual",
}: BusinessObjectPreviewProps): React.ReactElement | null {
  if (!data) {
    return null;
  }

  // JSON 视图
  if (viewType === "json") {
    return (
      <div className={styles.jsonView}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  // Visual 视图
  return (
    <div className={styles.businessObjectPreview}>
      {/* 标题区域 */}
      <div className={styles.objectHeader}>
        <div className={styles.objectTitleArea}>
          <div className={styles.objectTitle}>
            <span className={styles.objectName}>{data.objectName}</span>
          </div>
          <div className={styles.objectDescription}>{data.description}</div>
        </div>
        <span className={styles.objectBadge}>Active Object</span>
      </div>

      {/* 字段定义区域 */}
      <div className={styles.objectSection}>
        <div className={styles.sectionTitle}>
          <WrappedIcon
            lib="antd"
            icon="database"
            className={styles.sectionIcon}
          />
          <span>字段定义</span>
        </div>
        <div className={styles.fieldGrid}>
          {data?.attributes?.map((field) => (
            <div key={field.id} className={styles.fieldItem}>
              <span className={styles.fieldName}>{field.name}</span>
              <span className={styles.fieldType}>{field.type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 生命周期状态区域 */}
      {data.lifecycle && (
        <div className={styles.objectSection}>
          <div className={styles.sectionTitle}>
            <WrappedIcon
              lib="antd"
              icon="sync"
              className={styles.sectionIcon}
            />
            <span>生命周期状态</span>
          </div>
          <div className={styles.lifecycleContainer}>
            <WrappedMarkdownDisplay
              content={`\`\`\`mermaid\n${data.lifecycle}\n\`\`\``}
            />
          </div>
        </div>
      )}
    </div>
  );
}
