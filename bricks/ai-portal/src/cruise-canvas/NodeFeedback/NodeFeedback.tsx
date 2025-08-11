// istanbul ignore file: experimental
import React, { useCallback, useContext, useRef, useState } from "react";
import styles from "./NodeFeedback.module.css";
import { K, t } from "../i18n";
import { WrappedButton, WrappedIconButton } from "../../shared/bricks";
import { ICON_CLOSE } from "../constants";
import classNames from "classnames";
import { CanvasContext } from "../CanvasContext";

let checks:
  | Array<{
      label: string;
      value: string;
      group: "plan" | "result";
    }>
  | undefined;

function getChecks() {
  if (!checks) {
    checks = [
      {
        label: `1. ${t(K.IS_THE_TASK_PLAN_COMPLETE)}`,
        value: "计划完备",
        group: "plan",
      },
      {
        label: `2. ${t(K.IS_THE_TASK_PLAN_LOGICALLY_CORRECT)}`,
        value: "逻辑正确",
        group: "plan",
      },
      {
        label: `3. ${t(K.ARE_THE_TASK_PLAN_STEPS_CONCISE)}`,
        value: "步骤精简",
        group: "plan",
      },
      {
        label: `4. ${t(K.ARE_THE_ANALYTICAL_CONCLUSIONS_ACCURATE)}`,
        value: "结论准确",
        group: "result",
      },
      {
        label: `5. ${t(K.IS_THE_EVIDENCE_SUPPORTING_THE_CONCLUSIONS_SUFFICIENT)}`,
        value: "支撑证据充足",
        group: "result",
      },
    ];
  }
  return checks;
}

export function NodeFeedback(): JSX.Element {
  const {
    submittingFeedback,
    submittedFeedback,
    setShowFeedback,
    onSubmitFeedback,
  } = useContext(CanvasContext);
  const formRef = useRef<HTMLFormElement>(null);
  const checks = getChecks();
  const [triedSubmit, setTriedSubmit] = useState(false);

  const handleSubmit = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setTriedSubmit(true);
      if (!formRef.current?.reportValidity()) {
        return;
      }
      const formData = new FormData(formRef.current!);
      const plan: string[] = [];
      const result: string[] = [];
      for (let i = 0; i < checks.length; i++) {
        const value = formData.get(`feedback-check-${i}`);
        if (value) {
          if (checks[i].group === "plan") {
            plan.push(value as string);
          } else {
            result.push(value as string);
          }
        }
      }
      onSubmitFeedback({
        plan,
        result,
        feedback: (formData.get("feedback") ?? "") as string,
      });
    },
    [checks, onSubmitFeedback]
  );

  const handleReset = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setTriedSubmit(false);
    formRef.current?.reset();
  }, []);

  if (submittedFeedback) {
    return (
      <div className={`${styles["node-feedback"]} ${styles.submitted}`}>
        {t(K.THANKS_FOR_YOUR_FEEDBACK)}
      </div>
    );
  }

  return (
    <div className={styles["node-feedback"]}>
      <div className={styles.heading}>
        <div className={styles.title}>{t(K.FEEDBACK_NODE_TITLE)}</div>
        <WrappedIconButton
          icon={ICON_CLOSE}
          variant="mini"
          onClick={() => setShowFeedback(false)}
        />
      </div>
      <form
        className={classNames(styles.form, { [styles.validate]: triedSubmit })}
        ref={formRef}
      >
        {checks.map((check, index) => (
          <div
            key={index}
            className={`${styles["form-item"]} ${styles.horizontal}`}
          >
            <div className={styles.label}>{check.label}</div>
            <div className={styles.options}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  required
                  name={`feedback-check-${index}`}
                  value={check.value}
                />
                <span>{t(K.YES)}</span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  required
                  name={`feedback-check-${index}`}
                  value=""
                />
                <span>{t(K.NO)}</span>
              </label>
            </div>
          </div>
        ))}
        <div className={`${styles["form-item"]} ${styles.vertical}`}>
          <label htmlFor="feedback-content">{t(K.PROBLEM_FEEDBACK)}</label>
          <textarea
            id="feedback-content"
            name="feedback"
            placeholder={t(K.PROBLEM_FEEDBACK_PLACEHOLDER)}
            rows={2}
          />
        </div>
        <div className={styles.submit}>
          <WrappedButton themeVariant="elevo" type="text" onClick={handleReset}>
            {t(K.RESET)}
          </WrappedButton>
          <WrappedButton
            themeVariant="elevo"
            type="primary"
            shape="round"
            onClick={handleSubmit}
            disabled={submittingFeedback}
          >
            {t(K.SUBMIT)}
          </WrappedButton>
        </div>
      </form>
    </div>
  );
}
