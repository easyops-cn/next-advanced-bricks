import React from "react";
import { Attribute } from "../interfaces";
import styles from "./BusinessInstanceDetail.module.css";

import { WrappedInput, WrappedIcon, WrappedTag } from "../bricks";
import { EmptyState } from "./EmptyState";
import { K, t } from "../i18n";

interface BusinessInstanceDetailProps {
  instance: any;
  attrs: Attribute[];
  onAttrChange?: (attrId: string, value: any) => void;
}

interface FileInfo {
  name: string;
  uri?: string;
  mimeType?: string;
  size?: number;
}

export function BusinessInstanceDetail({
  instance,
  attrs,
  onAttrChange,
}: BusinessInstanceDetailProps) {
  // 按类型分组属性
  const fileAttrs = attrs?.filter((attr) => attr.type === "file");
  const textAttrs = attrs?.filter((attr) => attr.type === "text");
  const otherAttrs = attrs?.filter(
    (attr) => attr.type !== "file" && attr.type !== "text"
  );

  const handleInputChange = (attrId: string, value: string) => {
    onAttrChange?.(attrId, value);
  };

  const renderAttrValue = (attr: Attribute, value: any) => {
    // string 类型使用可编辑的 eo-input
    if (attr.type === "string" && !attr.isArray) {
      return (
        <WrappedInput
          value={value || ""}
          themeVariant="elevo"
          onValueChange={(e: CustomEvent) =>
            handleInputChange(attr.id, e.detail)
          }
        />
      );
    }

    // 数组类型
    if (attr.isArray && Array.isArray(value)) {
      return value.length === 0 ? null : attr.type === "file" ? (
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <WrappedIcon lib="lucide" icon="paperclip" />
          {value.length}
        </span>
      ) : (
        <span>{value.join(", ")}</span>
      );
    }

    // 单个文件类型
    if (attr.type === "file" && value) {
      return <WrappedIcon lib="lucide" icon="paperclip" />;
    }

    if (attr.type === "enum" && Array.isArray(value)) {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {value.map((item) => (
            <WrappedTag key={item}>{item}</WrappedTag>
          ))}
        </div>
      );
    }
    if (attr.type === "enum" && !Array.isArray(value)) {
      return <WrappedTag>{value}</WrappedTag>;
    }

    // 其他类型：文本展示
    return <span>{value}</span>;
  };

  if (!instance || !attrs) {
    return (
      <EmptyState
        className={styles.emptyState}
        title={t(K.NO_DETAIL)}
        description={t(K.NO_DETAIL_HINT)}
      />
    );
  }
  return (
    <div className={styles.instanceDetailWrapper}>
      <div className={styles.instanceDetailCard}>
        <h3 className={styles.instanceDetailTitle}>{t(K.INSTANCE_DETAIL)}</h3>
        <div className={styles.instanceDetailContainer}>
          <div className={styles.instanceDetailList}>
            {otherAttrs.map((attr) => (
              <div key={attr.id} className={styles.instanceDetailItem}>
                <span className={styles.instanceDetailLabel}>{attr.name}</span>
                <span className={styles.instanceDetailValue}>
                  {renderAttrValue(attr, instance[attr.id])}
                </span>
              </div>
            ))}
          </div>

          {fileAttrs.map((attr) =>
            !instance[attr.id] ||
            (Array.isArray(instance[attr.id]) &&
              instance[attr.id].length === 0) ? null : (
              <div key={attr.id} className={styles.instanceDetailSection}>
                <div className={styles.instanceDetailSectionHeader}>
                  <WrappedIcon
                    lib="lucide"
                    icon="paperclip"
                    className={styles.instanceDetailSectionIcon}
                  />
                  <span>{attr.name}</span>
                </div>
                <div className={styles.instanceDetailFileList}>
                  {(Array.isArray(instance[attr.id])
                    ? instance[attr.id]
                    : [instance[attr.id]]
                  ).map((file: FileInfo, idx: number) => (
                    <div key={idx} className={styles.instanceDetailFileItem}>
                      <WrappedIcon
                        lib="lucide"
                        icon="file-text"
                        className={styles.instanceDetailFileIcon}
                      />
                      <span className={styles.instanceDetailFileName}>
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {textAttrs.map((attr) =>
            !instance[attr.id] ? null : (
              <div key={attr.id} className={styles.instanceDetailSection}>
                <div className={styles.instanceDetailSectionHeader}>
                  {attr.name}
                </div>
                <div className={styles.instanceDetailTextContent}>
                  {instance[attr.id]}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
