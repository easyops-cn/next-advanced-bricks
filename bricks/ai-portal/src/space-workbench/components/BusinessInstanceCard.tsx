import React, { useState, useEffect, useRef } from "react";
import { Attribute } from "../interfaces";
import styles from "./BusinessInstanceCard.module.css";
import classNames from "classnames";

import { WrappedInput, WrappedIcon, WrappedTag } from "../bricks";
import { EmptyState } from "./EmptyState";
import { K, t } from "../i18n";

interface BusinessInstanceCardProps {
  instance: any;
  attrs: Attribute[];
  title?: string;
  onAttrChange?: (attrId: string, value: any) => void;
}

interface InstFieldsViewProps {
  className?: string;
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

// 实例字段展示组件
export function InstFieldsView({
  instance,
  attrs,
  className,
  onAttrChange,
}: InstFieldsViewProps) {
  // 管理每个字段的编辑状态
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  // 存储编辑中的临时值
  const [editingValue, setEditingValue] = useState<string>("");
  // 存储编辑前的原始值，用于对比是否发生变化（使用 ref 避免不必要的重新渲染）
  const originalValueRef = useRef<string>("");
  const editingContainerRef = useRef<HTMLDivElement | null>(null);

  // 按类型分组属性
  const fileAttrs = attrs?.filter((attr) => attr.type === "file");
  const textAttrs = attrs?.filter((attr) => attr.type === "text");
  const otherAttrs = attrs?.filter(
    (attr) => attr.type !== "file" && attr.type !== "text"
  );

  // 点击外部关闭编辑模式
  useEffect(() => {
    if (!editingFieldId) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingContainerRef.current &&
        !editingContainerRef.current.contains(event.target as Node)
      ) {
        // 点击外部时，检查值是否变化，如果变化则保存
        if (editingValue !== originalValueRef.current) {
          onAttrChange?.(editingFieldId, editingValue);
        }
        setEditingFieldId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingFieldId, editingValue, onAttrChange]);

  const handleInputChange = (value: string) => {
    setEditingValue(value);
  };

  const handleEditClick = (attrId: string, currentValue: any) => {
    const stringValue = currentValue ?? "";
    setEditingFieldId(attrId);
    setEditingValue(stringValue);
    originalValueRef.current = stringValue;
  };

  const handleInputBlur = () => {
    // 失焦时，检查值是否变化，如果变化则保存
    if (editingFieldId && editingValue !== originalValueRef.current) {
      onAttrChange?.(editingFieldId, editingValue);
    }
    setEditingFieldId(null);
  };

  const renderAttrValue = (attr: Attribute, value: any) => {
    // string 类型使用可编辑的文本
    if (attr.type === "string" && !attr.isArray) {
      const isEditing = editingFieldId === attr.id;
      const displayValue = isEditing ? editingValue : (value ?? "");

      if (isEditing) {
        return (
          <div ref={editingContainerRef}>
            <WrappedInput
              value={displayValue}
              themeVariant="elevo"
              autoFocus
              onValueChange={(e: CustomEvent) => handleInputChange(e.detail)}
              onBlur={() => handleInputBlur()}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") {
                  handleInputBlur();
                }
              }}
            />
          </div>
        );
      }

      return (
        <span className={styles.fieldTextValue} title={String(displayValue)}>
          {displayValue}
        </span>
      );
    }

    // 数组类型
    if (attr.isArray && Array.isArray(value)) {
      if (value.length === 0)
        return <span className={styles.fieldTextValue}></span>;

      if (attr.type === "file") {
        return (
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <WrappedIcon lib="lucide" icon="paperclip" />
            {value.length}
          </span>
        );
      }

      return <span>{value.join(", ")}</span>;
    }

    // 单个文件类型
    if (attr.type === "file") {
      if (value == null) return <span className={styles.fieldTextValue}></span>;
      return <WrappedIcon lib="lucide" icon="paperclip" />;
    }

    if (attr.type === "enum" && value != null) {
      if (Array.isArray(value)) {
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {value.map((item) => (
              <WrappedTag key={item}>{item}</WrappedTag>
            ))}
          </div>
        );
      }
      return <WrappedTag>{value}</WrappedTag>;
    }

    // 其他类型：文本展示，空值通过 CSS 显示占位符
    const displayValue = value ?? "";
    return (
      <span className={styles.fieldTextValue} title={String(displayValue)}>
        {displayValue}
      </span>
    );
  };

  return (
    <div className={classNames(styles.fieldsViewContainer, className)}>
      <div className={styles.fieldsViewList}>
        {otherAttrs.map((attr) => {
          const isFileType =
            attr.type === "file" ||
            (attr.isArray &&
              Array.isArray(instance[attr.id]) &&
              instance[attr.id].some((item: any) => item?.name));
          const isStringEditable = attr.type === "string" && !attr.isArray;

          return (
            <div
              key={attr.id}
              className={`${styles.fieldsViewItem} ${isFileType ? styles.fullWidth : ""}`}
            >
              <div className={styles.fieldsViewLabelRow}>
                <span className={styles.fieldsViewLabel}>{attr.name}</span>
                {isStringEditable && (
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditClick(attr.id, instance[attr.id])}
                  >
                    <WrappedIcon lib="lucide" icon="edit" />
                  </button>
                )}
              </div>
              <div className={styles.fieldsViewValue}>
                {renderAttrValue(attr, instance[attr.id])}
              </div>
            </div>
          );
        })}
      </div>

      {fileAttrs.map((attr) =>
        !instance[attr.id] ||
        (Array.isArray(instance[attr.id]) &&
          instance[attr.id].length === 0) ? null : (
          <div key={attr.id} className={styles.fieldsViewSection}>
            <div className={styles.fieldsViewSectionHeader}>
              <WrappedIcon
                lib="lucide"
                icon="paperclip"
                className={styles.fieldsViewSectionIcon}
              />
              <span>{attr.name}</span>
            </div>
            <div className={styles.fieldsViewFileList}>
              {(Array.isArray(instance[attr.id])
                ? instance[attr.id]
                : [instance[attr.id]]
              ).map((file: FileInfo, idx: number) => (
                <div key={idx} className={styles.fieldsViewFileItem}>
                  <WrappedIcon
                    lib="lucide"
                    icon="file-text"
                    className={styles.fieldsViewFileIcon}
                  />
                  <span className={styles.fieldsViewFileName}>{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {textAttrs.map((attr) =>
        !instance[attr.id] ? null : (
          <div key={attr.id} className={styles.fieldsViewSection}>
            <div className={styles.fieldsViewSectionHeader}>{attr.name}</div>
            <div className={styles.fieldsViewTextContent}>
              {instance[attr.id]}
            </div>
          </div>
        )
      )}
    </div>
  );
}

export function BusinessInstanceCard({
  instance,
  attrs,
  title,
  onAttrChange,
}: BusinessInstanceCardProps) {
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
    <div className={styles.instanceCardWrapper}>
      <div className={styles.instanceCard}>
        {title && <h3 className={styles.instanceCardTitle}>{title}</h3>}
        <InstFieldsView
          instance={instance}
          attrs={attrs}
          onAttrChange={onAttrChange}
        />
      </div>
    </div>
  );
}
