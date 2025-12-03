import React, { useMemo, useState } from "react";
import classNames from "classnames";
import styles from "./NodeChunk.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { WrappedIcon } from "../../shared/bricks.js";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown.js";
import type { Job } from "../../shared/interfaces.js";
import { ICON_UP, NON_WORKING_STATES } from "../../shared/constants.js";
import { K, t } from "../i18n";
import thinkingIcon from "../images/thinking@2x.png";

export interface NodeReasoningProps {
  job: Job;
}

export function NodeReasoning({ job }: NodeReasoningProps) {
  const reasoningMessages = useMemo(
    () => job.messages?.filter((message) => message.role === "assistant"),
    [job.messages]
  );
  const thinking = !reasoningMessages?.length;

  const [collapsed, setCollapsed] = useState(true);

  if (thinking) {
    return (
      <div className={styles.thinking}>
        <img src={thinkingIcon} width={16} height={16} />
        <span className={sharedStyles["shine-text"]}>{t(K.THINKING)}</span>
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.reasoning, {
        [styles.collapsed]: collapsed,
      })}
    >
      <div
        className={styles["reasoning-label"]}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <span
          className={classNames({
            [sharedStyles["shine-text"]]: !NON_WORKING_STATES.includes(
              job.state
            ),
          })}
        >
          {t(K.SHOW_THINKING)}
        </span>
        <WrappedIcon className={styles.chevron} {...ICON_UP} />
      </div>
      <div className={styles["reasoning-content"]}>
        {reasoningMessages?.map((message, index) => (
          <div
            key={index}
            className={classNames(styles.message, sharedStyles.markdown)}
          >
            {message.parts?.map((part, partIndex) => (
              <React.Fragment key={partIndex}>
                {part.type === "text" && (
                  <EnhancedMarkdown
                    className={classNames(
                      styles["message-part"],
                      sharedStyles["markdown-wrapper"]
                    )}
                    content={part.text}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
