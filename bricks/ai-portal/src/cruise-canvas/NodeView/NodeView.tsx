// istanbul ignore file: experimental
import React, { useEffect, useRef, useState } from "react";
import { unstable_createRoot } from "@next-core/runtime";
import classNames from "classnames";
import styles from "./NodeView.module.css";
import jobStyles from "../NodeJob/NodeJob.module.css";
// import sharedStyles from "../shared.module.css";
import type { Job } from "../interfaces";
import type { ViewWithInfo } from "../utils/converters/interfaces";
import { convertView } from "../utils/converters/convertView";

export interface NodeViewProps {
  job: Job;
  active?: boolean;
}

export function NodeView({ job, active }: NodeViewProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Awaited<
    ReturnType<typeof unstable_createRoot>
  > | null>(null);
  const [view, setView] = useState<ViewWithInfo | null>(null);

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

    let view: ViewWithInfo | null = null;

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
    }

    setView(view);
  }, [job.messages]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const convertedView = await convertView(view);
      if (ignore) {
        return;
      }
      rootRef.current?.render(convertedView ?? []);
    })();

    return () => {
      ignore = true;
    };
  }, [view]);

  useEffect(() => {
    rootRef.current?.render({
      brick: "eo-next-table",
      properties: {
        themeVariant: "elevo",
        pagination: false,
        columns: [
          {
            dataIndex: "name",
            key: "name",
            title: "Name",
          },
          {
            dataIndex: "age",
            key: "age",
            title: "Age",
          },
          {
            dataIndex: "address",
            key: "address",
            title: "Address",
          },
        ],
        dataSource: {
          pageSize: 5,
          page: 1,
          list: [
            {
              key: 0,
              name: "Jack",
              age: 18,
              address: "Guangzhou",
            },
            {
              key: 1,
              name: "Alex",
              age: 20,
              address: "Shanghai",
            },
            {
              key: 3,
              name: "Sam",
              age: 28,
              address: "Shenzhen",
            },
          ],
        },
      },
    });
  }, []);

  return (
    <div
      className={classNames(jobStyles["node-job"], {
        [jobStyles.active]: active,
        [jobStyles.large]: true,
      })}
    >
      <div className={jobStyles.background} />
      <div className={styles.heading}>
        <div className={styles.title}>{view?.title}</div>
      </div>
      <div className={styles.body} ref={ref} />
    </div>
  );
}
