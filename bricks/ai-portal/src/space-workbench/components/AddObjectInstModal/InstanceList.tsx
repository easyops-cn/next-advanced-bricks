import React from "react";

import type { InstanceItem, BusinessObject } from "../../interfaces";
import { K, t } from "../../i18n.js";
import { EmptyState } from "../EmptyState";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";

import styles from "./InstanceList.module.css";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface InstanceListProps {
  instances: InstanceItem[];
  businessObject: BusinessObject;
  selectedInstanceId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function InstanceList({
  instances,
  businessObject,
  selectedInstanceId,
  onSelect,
  onDelete,
}: InstanceListProps): React.ReactElement {
  if (instances.length === 0) {
    return (
      <EmptyState
        title={t(K.NO_INSTANCES_IDENTIFIED)}
        description={t(K.NO_INSTANCES_IDENTIFIED_DESCRIPTION)}
      />
    );
  }

  return (
    <div className={styles.instanceList}>
      {instances.map((instance) => (
        <InstanceCard
          key={instance._id_}
          instance={instance}
          businessObject={businessObject}
          isSelected={selectedInstanceId === instance._id_}
          onSelect={() => onSelect(instance._id_)}
          onDelete={() => onDelete(instance._id_)}
        />
      ))}
    </div>
  );
}

export interface InstanceCardProps {
  instance: InstanceItem;
  businessObject: BusinessObject;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function InstanceCard({
  instance,
  businessObject,
  isSelected,
  onSelect,
  onDelete,
}: InstanceCardProps): React.ReactElement {
  // 获取第一个属性作为主标题
  const firstAttr = businessObject.attributes?.[0];
  const title = firstAttr ? instance[firstAttr.id] : instance._id_;

  // 获取状态属性
  const statusAttr = businessObject.attributes?.find(
    (attr) => attr.id === "status"
  );
  const status = statusAttr ? instance[statusAttr.id] : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`${styles.instanceCard} ${isSelected ? styles.selected : ""}`}
      onClick={onSelect}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{title}</span>
        <div className={styles.cardActions}>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            title={t(K.DELETE_INSTANCE)}
          >
            <WrappedIcon lib="antd" icon="delete" theme="outlined" />
          </button>
        </div>
      </div>
      {status && (
        <div className={styles.cardStatus}>
          <span className={styles.statusTag}>{status}</span>
        </div>
      )}
    </div>
  );
}
