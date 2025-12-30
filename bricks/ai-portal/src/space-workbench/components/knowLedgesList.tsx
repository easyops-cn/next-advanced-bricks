import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, t } from "../i18n.js";
import styles from "./knowLedgesList.module.css";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import { EmptyState } from "./EmptyState.js";
import moment from "moment";
import type { KnowledgeItem } from "../interfaces.js";
import { getFileTypeAndIcon } from "../../cruise-canvas/utils/file.js";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export interface KnowledgesListProps {
  knowledges?: KnowledgeItem[];
  onKnowledgeClick?: (knowledge: KnowledgeItem) => void;
  onAddKnowledge?: () => void;
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
        <EmptyState title={t(K.NO_KNOWLEDGE)} />
      ) : (
        <div className={styles.knowledgesList}>
          {knowledges.map((knowledge) => {
            const [type, icon] = getFileTypeAndIcon(undefined, knowledge.name);

            return (
              <div
                key={knowledge.instanceId}
                className={styles.knowledgeCard}
                onClick={() => handleKnowledgeClick(knowledge)}
              >
                <img src={icon} alt={type} className={styles.fileIcon} />
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
