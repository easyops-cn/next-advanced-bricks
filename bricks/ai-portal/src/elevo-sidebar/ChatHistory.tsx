import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import moment from "moment";
import classNames from "classnames";
import { ElevoApi_listElevoConversations } from "@next-api-sdk/llm-sdk";
import type {
  ActionType,
  SimpleActionType,
} from "@next-bricks/basic/mini-actions";
import { get, isEqual } from "lodash";
import { K, t } from "./i18n.js";
import type { TaskState } from "../cruise-canvas/interfaces.js";
import { WrappedIcon, WrappedLink, WrappedMiniActions } from "./bricks.js";
import { DONE_STATES } from "../shared/constants.js";

export interface HistoryItem {
  conversationId: string;
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
  username?: string;
  activeId?: string;
  urlTemplate?: string;
  actions?: ActionType[];
  onActionClick: (detail: ActionClickDetail) => void;
  onHistoryClick: () => void;
}

export interface ChatHistoryRef {
  pull: () => void;
}

export const ChatHistory = forwardRef(LowLevelChatHistory);

export function LowLevelChatHistory(
  {
    username,
    activeId,
    actions,
    urlTemplate,
    onActionClick,
    onHistoryClick,
  }: ChatHistoryProps,
  ref: React.Ref<ChatHistoryRef>
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [list, setList] = useState<HistoryItem[] | null>(null);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [loadNextToken, setLoadNextToken] = useState<string | undefined>();

  useEffect(() => {
    setNextToken(undefined);
    setLoadNextToken(undefined);
    setList(null);
  }, [username]);

  useEffect(() => {
    Promise.all([
      ElevoApi_listElevoConversations(
        {
          token: loadNextToken,
          username,
          limit: 30,
        },
        {
          interceptorParams: {
            ignoreLoadingBar: true,
          },
        }
      ),
      new Promise((resolve) => setTimeout(resolve, 500)), // Force a minimum delay
    ])
      .then(([data]) => {
        setList((prev) => [
          ...(prev ?? []),
          ...(data.conversations as HistoryItem[]),
        ]);
        setNextToken(data.nextToken);
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "test") {
          // eslint-disable-next-line no-console
          console.error("Error loading chat history:", error);
        }
      });
  }, [loadNextToken, username]);

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

  const pullIdRef = useRef(0);

  const pull = useCallback(async () => {
    try {
      const pullId = ++pullIdRef.current;
      const tempList = await ElevoApi_listElevoConversations(
        { username, limit: 30 },
        {
          interceptorParams: {
            ignoreLoadingBar: true,
          },
        }
      );
      if (pullId !== pullIdRef.current) {
        // Ignore this pull if a newer one has been triggered
        return;
      }
      setList((prev) => {
        const prevList = prev ?? [];
        const newList = tempList.conversations as HistoryItem[];
        const newIds = new Set(newList.map((item) => item.conversationId));
        const newItemsMap = new Map(
          newList.map((item) => [item.conversationId, item])
        );

        let foundIntersection = false;
        let foundChanged = false;
        let isFirst = true;
        for (const item of prevList) {
          const newItem = newItemsMap.get(item.conversationId);
          if (newItem) {
            foundIntersection = true;
            foundChanged =
              (isFirst && newItem !== newList[0]) || !isEqual(newItem, item);
            if (foundChanged) {
              break;
            }
          } else {
            break;
          }
          isFirst = false;
        }

        if (!foundIntersection) {
          setNextToken(tempList.nextToken);
          return newList;
        }

        if (foundChanged) {
          return [
            ...newList,
            ...prevList.filter((item) => !newIds.has(item.conversationId)),
          ];
        }

        return prev;
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error pulling chat history:", error);
    }
  }, [username]);

  useImperativeHandle(
    ref,
    () => ({
      pull,
    }),
    [pull]
  );

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
                <li key={item.conversationId}>
                  <WrappedLink
                    className={classNames("item", {
                      "actions-active": item.conversationId === actionsVisible,
                      active: item.conversationId === activeId,
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
                        setActionsVisible(
                          e.detail ? item.conversationId : null
                        );
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

function parseTemplate(
  template: string | undefined,
  context: Record<string, any>
) {
  return template?.replace(/{{(.*?)}}/g, (_match: string, key: string) => {
    const value = get(context, key);
    return value;
  });
}
