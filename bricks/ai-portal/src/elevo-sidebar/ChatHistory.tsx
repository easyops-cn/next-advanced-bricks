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
import {
  ElevoApi_listElevoConversations,
  ElevoApi_getElevoProjects,
} from "@next-api-sdk/llm-sdk";
import type {
  ActionType,
  SimpleActionType,
} from "@next-bricks/basic/mini-actions";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { isEqual } from "lodash";
import { K, t } from "./i18n.js";
import type { TaskState } from "../cruise-canvas/interfaces.js";
import {
  WrappedIcon,
  WrappedLink,
  WrappedMiniActions,
  WrappedIconButton,
} from "./bricks.js";
import { DONE_STATES } from "../shared/constants.js";
import { parseTemplate } from "../shared/parseTemplate.js";

const ADD_ICON: GeneralIconProps = {
  lib: "antd",
  icon: "plus-circle",
};

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

export interface ProjectActionClickDetail {
  action: SimpleActionType;
  project: Project;
}

export interface Project {
  /** 实例ID */
  instanceId: string;
  /** 项目名称 */
  name: string;
  /** 项目描述 */
  description: string;
  /** 状态 */
  state: "active" | "inactive";
  /** 默认数字人ID */
  defaultAiEmployeeId: string;
  /** 创建者 */
  creator: string;
  /** 创建时间 */
  ctime: string;
  /** 修改时间 */
  mtime: string;
  /** 修改者 */
  modifier: string;
}

export interface ChatHistoryProps {
  username?: string;
  historyActiveId?: string;
  historyUrlTemplate?: string;
  historyActions?: ActionType[];
  projectActiveId?: string;
  projectUrlTemplate?: string;
  projectActions?: ActionType[];
  onActionClick: (detail: ActionClickDetail) => void;
  onHistoryClick: () => void;
  onProjectActionClick: (detail: ProjectActionClickDetail) => void;
  onAddProject: () => void;
}

export interface ChatHistoryRef {
  pull: () => void;
  removeProject?: (projectId: string) => void;
  addProject?: (project: Project) => void;
}

export const ChatHistory = forwardRef(LowLevelChatHistory);

export function LowLevelChatHistory(
  {
    username,
    historyActiveId,
    historyActions,
    historyUrlTemplate,
    projectActiveId,
    projectUrlTemplate,
    projectActions,
    onActionClick,
    onHistoryClick,
    onProjectActionClick,
    onAddProject,
  }: ChatHistoryProps,
  ref: React.Ref<ChatHistoryRef>
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [projectsCollapsed, setProjectsCollapsed] = useState(false);
  const [historyList, setHistoryList] = useState<HistoryItem[] | null>(null);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [loadNextToken, setLoadNextToken] = useState<string | undefined>();
  const initialRef = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const projects = await ElevoApi_getElevoProjects({
          page: 1,
          page_size: 3000,
        });
        setProjects(projects.list as Project[]);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error loading projects:", error);
        setProjects([]);
      }
    })();
  }, []);

  useEffect(() => {
    setNextToken(undefined);
    setLoadNextToken(undefined);
    setHistoryList(null);
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
      ...(initialRef.current
        ? []
        : [
            new Promise((resolve) => setTimeout(resolve, 500)), // Force a minimum delay
          ]),
    ])
      .then(([data]) => {
        initialRef.current = false;
        setHistoryList((prev) => [
          ...(prev ?? []),
          ...(data.conversations as HistoryItem[]),
        ]);
        setNextToken(data.nextToken);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("Error loading chat history:", error);
        setHistoryList([]);
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
    for (const item of historyList ?? []) {
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
  }, [historyList]);

  const [actionsVisible, setActionsVisible] = useState<string | null>(null);

  const nextRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next = nextRef.current;
    const root = rootRef.current;
    if (!next || !nextToken || !root || historyCollapsed) {
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
  }, [nextToken, historyCollapsed]);

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
      setHistoryList((prev) => {
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
      removeProject: (projectId: string) => {
        setProjects((prev) =>
          prev ? prev.filter((p) => p.instanceId !== projectId) : prev
        );
      },
      addProject: (project: Project) => {
        setProjects((prev) => (prev ? [...prev, project] : [project]));
      },
    }),
    [pull]
  );

  return (
    <div className="history" ref={rootRef}>
      <div className={classNames("section", { collapsed: projectsCollapsed })}>
        <div className="section-title">
          <div
            className="section-label"
            onClick={() => setProjectsCollapsed((prev) => !prev)}
          >
            {t(K.PROJECTS)}
            <WrappedIcon lib="fa" icon="caret-down" />
          </div>
          <WrappedIconButton
            icon={ADD_ICON}
            variant="mini"
            onClick={onAddProject}
          />
        </div>
        <ul className="items">
          {projects ? (
            projects.map((project) => (
              <li key={project.instanceId}>
                <WrappedLink
                  className={classNames("item", {
                    "actions-active": project.instanceId === actionsVisible,
                    active: project.instanceId === projectActiveId,
                  })}
                  onClick={onHistoryClick}
                  {...(projectUrlTemplate
                    ? { url: parseTemplate(projectUrlTemplate, project) }
                    : null)}
                >
                  <div className="item-title" title={project.name}>
                    {project.name}
                  </div>
                  <WrappedMiniActions
                    className="actions"
                    actions={projectActions}
                    onActionClick={(e) => {
                      onProjectActionClick({ action: e.detail, project });
                    }}
                    onVisibleChange={(e) => {
                      setActionsVisible(e.detail ? project.instanceId : null);
                    }}
                  />
                </WrappedLink>
              </li>
            ))
          ) : (
            <li className="loading">
              <WrappedIcon
                lib="antd"
                theme="outlined"
                icon="loading-3-quarters"
                spinning
              />
            </li>
          )}
        </ul>
      </div>
      <div className={classNames("section", { collapsed: historyCollapsed })}>
        <div className="section-title">
          <div
            className="section-label"
            onClick={() => setHistoryCollapsed((prev) => !prev)}
          >
            {t(K.HISTORY)}
            <WrappedIcon lib="fa" icon="caret-down" />
          </div>
        </div>
        <ul>
          {historyList ? (
            groups.map((group) => (
              <li key={group.title} className="group">
                <div className="group-title">{group.title}</div>
                <ul className="items">
                  {group.items.map((item) => (
                    <li key={item.conversationId}>
                      <WrappedLink
                        className={classNames("item", {
                          "actions-active":
                            item.conversationId === actionsVisible,
                          active: item.conversationId === historyActiveId,
                        })}
                        onClick={onHistoryClick}
                        {...(historyUrlTemplate
                          ? { url: parseTemplate(historyUrlTemplate, item) }
                          : null)}
                      >
                        <div className="item-title" title={item.title}>
                          {item.title}
                        </div>
                        <WrappedMiniActions
                          className="actions"
                          actions={historyActions}
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
            ))
          ) : (
            <li className="loading">
              <WrappedIcon
                lib="antd"
                theme="outlined"
                icon="loading-3-quarters"
                spinning
              />
            </li>
          )}
        </ul>
        {!historyCollapsed && nextToken && (
          <div className="load-more" ref={nextRef}>
            <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
          </div>
        )}
      </div>
    </div>
  );
}
