import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, t } from "../i18n.js";
import styles from "./knowLedgesList.module.css";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import moment from "moment";
import type { KnowledgeItem } from "../interfaces.js";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export interface KnowledgesListProps {
  knowledges?: KnowledgeItem[];
  onKnowledgeClick?: (knowledge: KnowledgeItem) => void;
  onAddKnowledge?: () => void;
}

// 文件类型图标映射
const FILE_TYPE_ICONS: Record<
  string,
  { lib: "fa"; icon: string; prefix?: string }
> = {
  pdf: { lib: "fa", icon: "file-pdf", prefix: "fas" },
  doc: { lib: "fa", icon: "file-word", prefix: "fas" },
  docx: { lib: "fa", icon: "file-word", prefix: "fas" },
  xls: { lib: "fa", icon: "file-excel", prefix: "fas" },
  xlsx: { lib: "fa", icon: "file-excel", prefix: "fas" },
  txt: { lib: "fa", icon: "file-alt", prefix: "fas" },
  md: { lib: "fa", icon: "file-alt", prefix: "fas" },
  default: { lib: "fa", icon: "file", prefix: "fas" },
};

// 根据文件名或内容类型判断文件类型
function getFileType(knowledge: KnowledgeItem): string {
  const name = knowledge.name?.toLowerCase() || "";

  // 从名称中提取扩展名
  const ext = name.split(".").pop();
  if (ext && FILE_TYPE_ICONS[ext]) {
    return ext;
  }

  // 如果有 OpenAPI URL,判断为在线文档
  if (knowledge.openApiUrl) {
    return "online";
  }

  return "default";
}

export function KnowledgesList(props: KnowledgesListProps) {
  const { knowledges, onKnowledgeClick, onAddKnowledge } = props;

  const handleKnowledgeClick = (knowledge: KnowledgeItem) => {
    onKnowledgeClick?.(knowledge);
  };

  const handleAddKnowledge = () => {
    onAddKnowledge?.();
  };

  if (!knowledges) {
    return (
      <div className={styles.loadingContainer}>
        <WrappedIcon
          lib="antd"
          icon="loading"
          theme="outlined"
          className={styles.loadingIcon}
        />
        <span className={styles.loadingText}>{t(K.LOADING)}</span>
      </div>
    );
  }

  return (
    <>
      <WrappedButton
        className={styles.addKnowledgeButton}
        type="dashed"
        onClick={() => handleAddKnowledge()}
        icon={{ lib: "lucide", icon: "plus" }}
      >
        {t(K.ADD_KNOWLEDGE)}
      </WrappedButton>
      {!knowledges.length ? (
        <div className={styles.emptyState}>
          <span>{t(K.NO_KNOWLEDGE)}</span>
        </div>
      ) : (
        <div className={styles.knowledgesList}>
          {knowledges.map((knowledge) => {
            const fileType = getFileType(knowledge);
            const iconConfig =
              FILE_TYPE_ICONS[fileType] || FILE_TYPE_ICONS.default;

            return (
              <div
                key={knowledge.instanceId}
                className={styles.knowledgeCard}
                onClick={() => handleKnowledgeClick(knowledge)}
              >
                <div className={styles.iconContainer}>
                  <WrappedIcon
                    lib="fa"
                    icon={iconConfig.icon}
                    prefix={iconConfig.prefix}
                    className={styles.fileIcon}
                  />
                </div>
                <div className={styles.knowledgeInfo}>
                  <div className={styles.knowledgeName}>{knowledge.name}</div>
                  <div className={styles.knowledgeMeta}>
                    {moment(knowledge.mtime || knowledge.ctime).format(
                      "YYYY-MM-DD"
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
