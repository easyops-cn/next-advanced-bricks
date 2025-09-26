import React, {
  useState,
  useEffect,
  forwardRef,
  createRef,
  useImperativeHandle,
  useMemo,
} from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import CardItemStyleText from "./CardItem/CardItem.shadow.css";
import styleText from "./styles.shadow.css";
import { GoalCardItem, GoalItem, GoalState } from "./CardItem/CardItem.js";
import { GeneralIcon, GeneralIconProps } from "@next-bricks/icons/general-icon";
import { uniqueId } from "lodash";

initializeI18n(NS, locales);

const { defineElement, property, event, method } = createDecorators();

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface GoalCardListProps {
  goalList?: GoalItem[];
  cardStyle?: React.CSSProperties;
  activeKey?: string;
}

const GoalCardListComponent = forwardRef(LegacyGoalCardListComponent);

/**
 * 构件 `ai-portal.goal-card-list`
 */
export
@defineElement("ai-portal.goal-card-list", {
  styleTexts: [styleText, CardItemStyleText],
})
class GoalCardList extends ReactNextElement implements GoalCardListProps {
  @property({
    attribute: false,
  })
  accessor goalList: GoalItem[] | undefined;

  @property({
    attribute: false,
  })
  accessor cardStyle: React.CSSProperties | undefined;

  @property()
  accessor activeKey: string | undefined;

  @event({ type: "item.click" })
  accessor #itemClickEvent!: EventEmitter<GoalItem>;
  #handleItemClick = (item: GoalItem) => {
    this.#itemClickEvent.emit(item);
  };

  @event({ type: "item.status.change" })
  accessor #itemStatusChangeEvent!: EventEmitter<GoalItem>;
  #handleItemStatusChange = (item: GoalItem) => {
    this.#itemStatusChangeEvent.emit(item);
  };

  @event({ type: "item.title.change" })
  accessor #itemTitleChangeEvent!: EventEmitter<GoalItem>;
  #handleTitleChange = (item: GoalItem) => {
    this.#itemTitleChangeEvent.emit(item);
  };

  @event({ type: "item.new.chat" })
  accessor #itemNewChatEvent!: EventEmitter<GoalItem>;
  #handleNewChat = (item: GoalItem) => {
    this.#itemNewChatEvent.emit(item);
  };

  #ref = createRef<GoalListRef>();

  @method()
  appendChildDone(pendingId: string, newItem: GoalItem) {
    this.#ref.current?.appendChildDone(pendingId, newItem);
  }

  render() {
    return (
      <GoalCardListComponent
        ref={this.#ref}
        goalList={this.goalList}
        cardStyle={this.cardStyle}
        onTitleChange={this.#handleTitleChange}
        onStatusChange={this.#handleItemStatusChange}
        onItemClick={this.#handleItemClick}
        onNewChat={this.#handleNewChat}
        activeKey={this.activeKey}
      />
    );
  }
}

interface GoalCardListComponentProps extends GoalCardListProps {
  onTitleChange?: (item: GoalItem) => void;
  onStatusChange?: (item: GoalItem) => void;
  onItemClick?: (item: GoalItem) => void;
  onNewChat?: (item: GoalItem) => void;
}

interface GoalListRef {
  appendChildDone: (pendingId: string, newItem: GoalItem) => void;
}

function LegacyGoalCardListComponent(
  {
    goalList: _goalList,
    cardStyle,
    onTitleChange,
    onStatusChange,
    onItemClick,
    onNewChat,
    activeKey,
  }: GoalCardListComponentProps,
  ref: React.Ref<GoalListRef>
) {
  const [goalList, setGoalList] = useState(_goalList);

  useEffect(() => {
    setGoalList(_goalList);
  }, [_goalList]);

  const updateGoalItem = <T extends keyof GoalItem>(
    item: GoalItem,
    field: T,
    value: GoalItem[T],
    callback?: (updatedItem: GoalItem) => void
  ) => {
    const updatedItem = {
      ...item,
      [field]: value,
    };

    setGoalList(
      goalList?.map((goalItem) =>
        goalItem.instanceId === updatedItem.instanceId ? updatedItem : goalItem
      )
    );

    callback?.(updatedItem);
  };

  const handleTitleChange = (newTitle: string, item: GoalItem) => {
    updateGoalItem(item, "title", newTitle, onTitleChange);
  };

  const handleStatusChange = (newStatus: GoalState, item: GoalItem) => {
    updateGoalItem(item, "state", newStatus, onStatusChange);
  };

  const handleAppendChild = (item: GoalItem) => {
    const newChild: GoalItem = {
      instanceId:
        process.env.NODE_ENV === "test"
          ? "test-pending-id"
          : uniqueId("pending-"),
      pending: true,
      id: 0,
      title: "",
      state: "ready",
      level: 1,
      pendingParentId: item.instanceId,
    };
    setGoalList((prevList) => {
      const index =
        prevList?.findIndex((goal) => goal.instanceId === item.instanceId) ??
        -1;
      if (index === -1) return prevList;
      const offsetIndex =
        prevList!.slice(index + 1).findIndex((goal) => goal.level === 0) + 1;
      if (offsetIndex === 0) {
        return [...prevList!, newChild];
      }
      return [
        ...prevList!.slice(0, index + offsetIndex),
        newChild,
        ...prevList!.slice(index + offsetIndex),
      ];
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      appendChildDone: (pendingId: string, newItem: GoalItem) => {
        setGoalList((prevList) =>
          prevList?.map((goal) =>
            goal.instanceId === pendingId
              ? { ...newItem, level: goal.level }
              : goal
          )
        );
      },
    }),
    []
  );

  const idWidth = useMemo(() => {
    const maxId =
      goalList?.reduce((max, item) => Math.max(max, item.id), 0) ?? 0;
    return 10 * (maxId.toString().length + 1);
  }, [goalList]);

  if (!goalList) {
    return (
      <div className="loading">
        <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
      </div>
    );
  }

  return (
    <div className="goal-container">
      {goalList?.map((item) => (
        <GoalCardItem
          key={item.instanceId}
          isActive={activeKey === item.instanceId}
          goalItem={item}
          idWidth={idWidth}
          cardStyle={cardStyle}
          onTitleChange={(v) => handleTitleChange(v, item)}
          onStatusChange={(v) => handleStatusChange(v, item)}
          onNewChat={() => onNewChat?.(item)}
          onClick={() => onItemClick?.(item)}
          onAppendChild={() => handleAppendChild(item)}
          onRevokeAppendChild={() => {
            setGoalList((prevList) =>
              prevList?.filter((goal) => goal.instanceId !== item.instanceId)
            );
          }}
        />
      ))}
    </div>
  );
}
