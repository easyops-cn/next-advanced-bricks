import React, { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import classNames from "classnames";
import { AgentFlowApi_searchTaskForAgentFlow } from "@next-api-sdk/llm-sdk";
import type {
  ActionType,
  SimpleActionType,
} from "@next-bricks/basic/mini-actions";
import { get } from "lodash";
import { K, t } from "./i18n.js";
import type { TaskState } from "../cruise-canvas/interfaces.js";
import { WrappedIcon, WrappedLink, WrappedMiniActions } from "./bricks.js";
import { DONE_STATES } from "../cruise-canvas/constants.js";

export interface HistoryItem {
  id: string;
  title: string;
  startTime: number;
  state?: TaskState;
}

export interface GroupedHistory {
  title: string;
  items: HistoryItem[];
}

export interface ActionClickDetail {
  action: SimpleActionType;
  item: HistoryItem;
}

export interface ChatHistoryProps {
  activeId?: string;
  urlTemplate?: string;
  actions?: ActionType[];
  onActionClick: (detail: ActionClickDetail) => void;
  onHistoryClick: () => void;
}

export function ChatHistory({
  activeId,
  actions,
  urlTemplate,
  onActionClick,
  onHistoryClick,
}: ChatHistoryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [list, setList] = useState<HistoryItem[] | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [loadNextToken, setLoadNextToken] = useState<string | undefined>();

  useEffect(() => {
    Promise.all([
      AgentFlowApi_searchTaskForAgentFlow({ next_token: loadNextToken }),
      new Promise((resolve) => setTimeout(resolve, 500)), // Force a minimum delay
    ])
      .then(([data]) => {
        setList((prev) => [...(prev ?? []), ...(data.data as HistoryItem[])]);
        setNextToken(data.next_token);
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "test") {
          // eslint-disable-next-line no-console
          console.error("Error loading chat history:", error);
        }
      });
  }, [loadNextToken]);

  const groups = useMemo(() => {
    const groupMap = new Map<string, GroupedHistory>();
    // Group history by
    //   - today
    //   - yesterday
    //   - previous 7 days
    //   - previous 30 days
    //   - each month this year
    //   - each year before.
    const now = moment();
    const startOfDay = now.clone().startOf("day");
    const yesterday = startOfDay.clone().subtract(1, "day");
    const sevenDaysAgo = startOfDay.clone().subtract(7, "days");
    const thirtyDaysAgo = startOfDay.clone().subtract(30, "days");
    const thisYear = now.clone().startOf("year");

    const timestamps = {
      startOfDay: +startOfDay / 1000,
      yesterday: +yesterday / 1000,
      sevenDaysAgo: +sevenDaysAgo / 1000,
      thirtyDaysAgo: +thirtyDaysAgo / 1000,
      thisYear: +thisYear / 1000,
    };
    for (const item of list ?? []) {
      let groupKey: string;
      if (item.startTime >= timestamps.startOfDay) {
        groupKey = t(K.TODAY);
      } else if (item.startTime >= timestamps.yesterday) {
        groupKey = t(K.YESTERDAY);
      } else if (item.startTime >= timestamps.sevenDaysAgo) {
        groupKey = t(K.PREVIOUS_7_DAYS);
      } else if (item.startTime >= timestamps.thirtyDaysAgo) {
        groupKey = t(K.PREVIOUS_30_DAYS);
      } else if (item.startTime >= timestamps.thisYear) {
        groupKey = moment(item.startTime * 1000).format("MMMM");
      } else {
        groupKey = moment(item.startTime * 1000).format("YYYY");
      }
      let group = groupMap.get(groupKey);
      if (!group) {
        groupMap.set(groupKey, (group = { title: groupKey, items: [] }));
      }
      group.items.push(item);
    }

    return [...groupMap.values()];
  }, [list]);

  const [actionsVisible, setActionsVisible] = useState<string | null>(null);

  const nextRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next = nextRef.current;
    const root = rootRef.current;
    if (!next || !nextToken || !root) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setLoadNextToken(nextToken);
          }
        }
      },
      { root }
    );
    observer.observe(next);
    return () => {
      observer.disconnect();
    };
  }, [nextToken]);

  if (!list) {
    return (
      <div className="history">
        <div className="loading">
          <WrappedIcon
            lib="antd"
            theme="outlined"
            icon="loading-3-quarters"
            spinning
          />
        </div>
      </div>
    );
  }

  return (
    <div className="history" ref={rootRef}>
      <ul>
        {groups.map((group) => (
          <li key={group.title} className="group">
            <div className="group-title">{group.title}</div>
            <ul className="items">
              {group.items.map((item) => (
                <li key={item.id}>
                  <WrappedLink
                    className={classNames("item", {
                      "actions-active": item.id === actionsVisible,
                      active: item.id === activeId,
                    })}
                    onClick={onHistoryClick}
                    {...(urlTemplate
                      ? { url: parseTemplate(urlTemplate, item) }
                      : null)}
                  >
                    <div className="item-title" title={item.title}>
                      {item.title}
                    </div>
                    <WrappedMiniActions
                      className="actions"
                      actions={actions}
                      onActionClick={(e) => {
                        onActionClick({ action: e.detail, item });
                      }}
                      onVisibleChange={(e) => {
                        setActionsVisible(e.detail ? item.id : null);
                      }}
                    />
                    {!DONE_STATES.includes(item.state!) && (
                      <div className="working"></div>
                    )}
                  </WrappedLink>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {nextToken && (
        <div className="load-more" ref={nextRef}>
          <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
        </div>
      )}
    </div>
  );
}

function parseTemplate(template: string, context: Record<string, any>) {
  return template?.replace(/{{(.*?)}}/g, (_match: string, key: string) => {
    const value = get(context, key);
    return value;
  });
}
