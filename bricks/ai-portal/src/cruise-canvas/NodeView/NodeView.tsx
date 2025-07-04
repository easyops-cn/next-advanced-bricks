// istanbul ignore file: experimental
import React, { useEffect, useRef } from "react";
import { unstable_createRoot } from "@next-core/runtime";
import classNames from "classnames";
// import styles from "./NodeView.module.css";
import jobStyles from "../NodeJob/NodeJob.module.css";
// import sharedStyles from "../shared.module.css";
import type { Job } from "../interfaces";
import type { ViewWithInfo } from "../utils/converters/interfaces";
import {
  convertView,
  type BrickConfWithContext,
} from "../utils/converters/convertView";

export interface NodeViewProps {
  job: Job;
  active?: boolean;
}

export function NodeView({ job, active }: NodeViewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const [storyboard, setStoryboard] =
    React.useState<BrickConfWithContext | null>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) {
      return;
    }
    const root = unstable_createRoot(container, {
      supportsUseChildren: true,
    } as any);
    rootRef.current = root;

    return () => {
      root.unmount();
      rootRef.current = null;
    };
  }, []);

  useEffect(() => {
    const toolCallMessages = job.messages?.filter((msg) => msg.role === "tool");

    let view: ViewWithInfo | undefined;

    loop: for (const message of toolCallMessages ?? []) {
      for (const part of message.parts) {
        if (part.type === "text") {
          try {
            view = JSON.parse(part.text);
            break loop;
          } catch {
            // Do nothing, continue to next part
          }
        }
      }
    }

    if (!view) {
      // eslint-disable-next-line no-console
      console.error("No valid view found in tool call messages.");
      return;
    }

    let ignore = false;
    (async () => {
      const convertedView = await convertView(view);
      if (ignore) {
        return;
      }
      setStoryboard(convertedView);
      rootRef.current?.render(convertedView as any);
    })();

    return () => {
      ignore = true;
    };
  }, [job]);

  return (
    <div
      className={classNames(jobStyles["node-job"], {
        [jobStyles.active]: active,
      })}
    >
      <div ref={ref}></div>
      <pre>{JSON.stringify(storyboard, null, 2)}</pre>
    </div>
  );
}
