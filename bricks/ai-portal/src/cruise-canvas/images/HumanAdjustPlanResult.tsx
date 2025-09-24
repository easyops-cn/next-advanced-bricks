import React, { useMemo } from "react";
import type { Job } from "../interfaces";
import styles from "../NodeJob/NodeJob.module.css";

export interface HumanAdjustPlanResultProps {
  job: Job;
}

export function HumanAdjustPlanResult({
  job,
}: HumanAdjustPlanResultProps): JSX.Element {
  const response = useMemo(() => {
    const msg = job.messages?.find((msg) => {
      return msg.role === "tool";
    });
    if (msg) {
      const text = msg.parts?.find((part) => part.type === "text")?.text;
      if (text) {
        try {
          return JSON.parse(text) as { type: "plan"; steps: string[] };
        } catch {
          // Fallback to original text
        }
      }
    }
    return null;
  }, [job.messages]);

  if (response?.type === "plan" && Array.isArray(response.steps)) {
    return (
      <div className={`${styles.message} ${styles["role-user"]}`}>
        <ol
          style={{
            paddingLeft: `${Math.floor(Math.log10(response.steps.length + 1)) * 0.5 + 1.5}em`,
          }}
        >
          {response.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className={`${styles.message} ${styles["role-user"]}`}>
      Something went wrong.
    </div>
  );
}
