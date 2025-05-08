// istanbul ignore file: experimental
import React, { useMemo, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import moment from "moment";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  ActionType,
  EoMiniActions,
  EoMiniActionsEvents,
  EoMiniActionsEventsMapping,
  EoMiniActionsProps,
  SimpleActionType,
} from "@next-bricks/basic/mini-actions";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import type { TaskState } from "../cruise-canvas/interfaces.js";
import classNames from "classnames";
import { DONE_STATES } from "../cruise-canvas/constants.js";

initializeI18n(NS, locales);

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedMiniActions = wrapBrick<
  EoMiniActions,
  EoMiniActionsProps,
  EoMiniActionsEvents,
  EoMiniActionsEventsMapping
>("eo-mini-actions", {
  onActionClick: "action.click",
  onVisibleChange: "visible.change",
});

const { defineElement, property, event } = createDecorators();

export interface ChatHistoryProps {
  list?: HistoryItem[];
  actions?: ActionType[];
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  startTime: number;
  state?: TaskState;
}

export interface ActionClickDetail {
  action: SimpleActionType;
  item: HistoryItem;
}

/**
 * 构件 `ai-portal.chat-history`
 */
export
@defineElement("ai-portal.chat-history", {
  styleTexts: [styleText],
})
class ChatHistory extends ReactNextElement implements ChatHistoryProps {
  @property({ attribute: false })
  accessor list: HistoryItem[] | undefined;

  @property({ attribute: false })
  accessor actions: ActionType[] | undefined;

  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionClickDetail>;

  #handleActionClick = (detail: ActionClickDetail) => {
    this.#actionClick.emit(detail);
  };

  render() {
    return (
      <ChatHistoryComponent
        list={this.list}
        actions={this.actions}
        onActionClick={this.#handleActionClick}
      />
    );
  }
}

export interface ChatHistoryComponentProps extends ChatHistoryProps {
  onActionClick?: (detail: ActionClickDetail) => void;
}

interface GroupedHistory {
  title: string;
  items: HistoryItem[];
}

export function ChatHistoryComponent({
  list,
  actions,
  onActionClick,
}: ChatHistoryComponentProps) {
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
    const startOfDay = now.startOf("day");
    const yesterday = startOfDay.clone().subtract(1, "day");
    const sevenDaysAgo = startOfDay.clone().subtract(7, "days");
    const thirtyDaysAgo = startOfDay.clone().subtract(30, "days");
    const thisYear = now.year();

    const timestamps = {
      startOfDay: +startOfDay / 1000,
      yesterday: +yesterday / 1000,
      sevenDaysAgo: +sevenDaysAgo / 1000,
      thirtyDaysAgo: +thirtyDaysAgo / 1000,
      thisYear,
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

  return (
    <ul>
      {groups.map((group) => (
        <li key={group.title} className="group">
          <div className="group-title">{group.title}</div>
          <ul className="items">
            {group.items.map((item) => (
              <li key={item.id}>
                <WrappedLink
                  className={classNames("item", {
                    active: actionsVisible === item.id,
                  })}
                  url={item.url}
                >
                  <div className="item-title">{item.title}</div>
                  <WrappedMiniActions
                    className="actions"
                    actions={actions}
                    onActionClick={(e) => {
                      onActionClick?.({ action: e.detail, item });
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
  );
}
