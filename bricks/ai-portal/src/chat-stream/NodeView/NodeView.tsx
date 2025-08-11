// istanbul ignore file: experimental
import React, { useCallback, useState } from "react";
import classNames from "classnames";
import { CreatedView } from "../../shared/CreatedView/CreatedView";
import type { Job } from "../../cruise-canvas/interfaces";
import styles from "./NodeView.module.css";

export interface NodeViewProps {
  job: Job;
}

export function NodeView({ job }: NodeViewProps): JSX.Element {
  const [size, setSize] = useState<"medium" | "large">("medium");

  const handleSizeChange = useCallback((value: "medium" | "large") => {
    setSize(value);
  }, []);

  return (
    <div
      className={classNames(styles.view, {
        [styles.large]: size === "large",
      })}
    >
      <CreatedView job={job} onSizeChange={handleSizeChange} />
    </div>
  );
}
