import React, { useContext } from "react";
import { initializeI18n } from "@next-core/i18n";
import styles from "./NodeReplay.module.css";
import {
  WrappedButton,
  WrappedIcon,
  WrappedLink,
  WrappedShowCase,
} from "../../shared/bricks";
import { TaskContext } from "../../shared/TaskContext";
import { ICON_LOADING } from "../../shared/constants";
import { K, locales, NS, t } from "./i18n";
import projectIcon from "./project@2x.png";
import classNames from "classnames";

initializeI18n(NS, locales);

export interface NodeReplayProps {
  finished?: boolean;
  ui?: "chat" | "canvas";
}

export function NodeReplay({ finished, ui }: NodeReplayProps) {
  const {
    conversationId,
    showCases,
    exampleProjects,
    skipToResults,
    watchAgain,
    tryItOut,
  } = useContext(TaskContext);

  return (
    <div
      className={classNames(styles["node-replay"], {
        [styles.finished]: finished,
        [styles.chat]: ui === "chat",
      })}
    >
      <div className={styles.bar}>
        <div className={styles.label}>
          {finished ? t(K.CASE_REPLAY_FINISHED) : t(K.CASE_REPLAYING)}
        </div>
        <div className={styles.buttons}>
          {finished ? (
            <WrappedButton themeVariant="elevo" onClick={watchAgain}>
              {t(K.WATCH_AGAIN)}
            </WrappedButton>
          ) : (
            <WrappedButton themeVariant="elevo" onClick={skipToResults}>
              {t(K.SKIP_TO_RESULTS)}
            </WrappedButton>
          )}
          <WrappedButton type="primary" themeVariant="elevo" onClick={tryItOut}>
            {t(K.TRY_IT_OUT)}
          </WrappedButton>
        </div>
      </div>
      {finished && !!(showCases?.length || exampleProjects?.length) && (
        <div className={styles.content}>
          {!showCases ||
            (showCases.length > 0 && (
              <>
                <div className={styles.heading}>{t(K.OTHER_CASES)}</div>
                {showCases ? (
                  <ul className={styles.cases}>
                    {showCases
                      .filter((item) => item.conversationId !== conversationId)
                      .slice(0, 3)
                      .map((item) => (
                        <li key={item.conversationId}>
                          <WrappedShowCase
                            caseTitle={item.title}
                            summary={item.summary}
                            url={item.url}
                          />
                        </li>
                      ))}
                  </ul>
                ) : (
                  <WrappedIcon className={styles.loading} {...ICON_LOADING} />
                )}
              </>
            ))}
          {!exampleProjects ||
            (exampleProjects.length > 0 && (
              <>
                <div className={styles.heading}>
                  {t(K.GET_STARTED_WITH_PROJECTS_PREFIX)}
                  <span className={styles.tag}>{t(K.PROJECTS)}</span>
                  {t(K.GET_STARTED_WITH_PROJECTS_SUFFIX)}
                </div>
                <div className={styles.tips}>{t(K.PROJECT_TIPS)}</div>
                {exampleProjects ? (
                  <ul className={styles.projects}>
                    {exampleProjects.slice(0, 2).map((item) => (
                      <li key={item.instanceId}>
                        <WrappedLink className={styles.project} url={item.url}>
                          <img src={projectIcon} width={16} height={16} />
                          {item.name}
                        </WrappedLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <WrappedIcon className={styles.loading} {...ICON_LOADING} />
                )}
              </>
            ))}
        </div>
      )}
    </div>
  );
}
