// istanbul ignore file: experimental
import React, { useCallback, useContext } from "react";
import { getBasePath } from "@next-core/runtime";
import { initializeI18n } from "@next-core/i18n";
import styles from "./ViewToolbar.module.css";
import { WrappedIcon } from "../../shared/bricks";
import { K, locales, NS, t } from "./i18n";
import { TaskContext } from "../TaskContext";
import { ICON_FEEDBACK } from "../constants";
import { useViewFeedbackDone } from "../useViewFeedbackDone";
import { parseTemplate } from "../parseTemplate";
import type { Job } from "../interfaces";

initializeI18n(NS, locales);

export interface ViewToolbarProps {
  job: Job;
  canFeedback?: boolean;
}

export function ViewToolbar({
  job,
  canFeedback: propCanFeedback,
}: ViewToolbarProps) {
  const {
    previewUrlTemplate,
    showJsxEditor,
    setActiveExpandedViewJobId,
    setActiveJsxEditorJob,
    manuallyUpdatedViews,
    showFeedbackOnView,
    onFeedbackOnView,
    feedbackDoneViews,
  } = useContext(TaskContext);

  const generatedView = manuallyUpdatedViews?.get(job.id) ?? job.generatedView!;
  const feedbackDone =
    useViewFeedbackDone(generatedView.viewId, showFeedbackOnView) ||
    feedbackDoneViews?.has(generatedView.viewId);
  const canFeedback =
    propCanFeedback &&
    !!generatedView.viewId &&
    generatedView.from !== "config";

  const handleExpandClick = useCallback(() => {
    setActiveExpandedViewJobId(job.id);
  }, [job.id, setActiveExpandedViewJobId]);

  return (
    <div className={styles["view-toolbar"]}>
      {showJsxEditor && (
        <button
          className={styles.button}
          onClick={() => {
            setActiveJsxEditorJob?.(job);
          }}
        >
          <WrappedIcon lib="antd" icon="bug" />
        </button>
      )}
      {showFeedbackOnView && !feedbackDone && canFeedback && (
        <button
          className={`${styles.button} ${styles["button-lucide"]}`}
          title={t(K.FEEDBACK)}
          onClick={() => onFeedbackOnView?.(generatedView.viewId)}
        >
          <WrappedIcon {...ICON_FEEDBACK} />
        </button>
      )}
      {!!(
        generatedView.viewId &&
        !generatedView.withContexts &&
        previewUrlTemplate
      ) && (
        <button
          className={`${styles.button} ${styles["button-lucide"]}`}
          title={t(K.OPEN_PREVIEW)}
          onClick={() => {
            window.open(
              `${getBasePath().slice(0, -1)}${parseTemplate(
                previewUrlTemplate,
                {
                  viewId: generatedView.viewId,
                }
              )}`,
              "_blank"
            );
          }}
        >
          <WrappedIcon lib="lucide" icon="external-link" />
        </button>
      )}
      <button
        className={styles.button}
        title={t(K.FULLSCREEN)}
        onClick={handleExpandClick}
      >
        <WrappedIcon lib="easyops" icon="expand" />
      </button>
    </div>
  );
}
