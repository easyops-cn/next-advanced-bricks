// istanbul ignore file: experimental
import React, { useCallback, useContext, useRef, useState } from "react";
import classNames from "classnames";
import jobStyles from "../NodeJob/NodeJob.module.css";
import type { Job } from "../interfaces";
import { CanvasContext } from "../CanvasContext";
import { CreatedView } from "../../shared/CreatedView/CreatedView";

export interface NodeViewProps {
  job: Job;
  active?: boolean;
}

export function NodeView({ job, active }: NodeViewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const { setHoverOnScrollableContent } = useContext(CanvasContext);

  const [size, setSize] = useState<"medium" | "large">("medium");

  const handleSizeChange = useCallback((value: "medium" | "large") => {
    setSize(value);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      let found = false;
      for (const el of e.nativeEvent.composedPath()) {
        if (el === ref.current) {
          break;
        }
        if (
          el instanceof HTMLElement &&
          el.classList.contains("ant-table") &&
          el.classList.contains("ant-table-scroll-horizontal")
        ) {
          found = true;
          break;
        }
      }
      setHoverOnScrollableContent(found);
    },
    [setHoverOnScrollableContent]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverOnScrollableContent(false);
  }, [setHoverOnScrollableContent]);

  return (
    <div
      className={classNames(jobStyles["node-job"], {
        [jobStyles.active]: active,
        [jobStyles.large]: size === "large",
      })}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={jobStyles.background} />
      <CreatedView job={job} onSizeChange={handleSizeChange} />
    </div>
  );
}
