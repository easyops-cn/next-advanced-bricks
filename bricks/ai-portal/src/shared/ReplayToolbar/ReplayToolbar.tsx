import React from "react";
import { initializeI18n } from "@next-core/i18n";
import styles from "./ReplayToolbar.module.css";
import { WrappedButton } from "../../shared/bricks";
import { K, locales, NS, t } from "./i18n";

initializeI18n(NS, locales);

export interface ReplayToolbarProps {
  taskDone: boolean;
  skipToResults: () => void;
  watchAgain: () => void;
}

export function ReplayToolbar({
  taskDone,
  skipToResults,
  watchAgain,
}: ReplayToolbarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.replay}>
        <div className={styles.text}>
          {taskDone ? t(K.REPLAY_COMPLETED) : t(K.REPLAYING)}
        </div>
        {taskDone ? (
          <WrappedButton
            type="primary"
            themeVariant="elevo"
            className={styles.button}
            onClick={watchAgain}
          >
            {t(K.WATCH_AGAIN)}
          </WrappedButton>
        ) : (
          <WrappedButton
            type="primary"
            themeVariant="elevo"
            className={styles.button}
            onClick={skipToResults}
          >
            {t(K.SKIP_TO_RESULTS)}
          </WrappedButton>
        )}
      </div>
    </div>
  );
}
