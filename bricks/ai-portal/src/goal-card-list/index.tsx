import React, { useState, useEffect } from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import CardItemStyleText from "./CardItem/CardItem.shadow.css";
import styleText from "./styles.shadow.css";
import { GoalCardItem, GoalItem, GoalState } from "./CardItem/CardItem.js";

initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();

export interface GoalCardListProps {
  goalList?: GoalItem[];
  cardStyle?: React.CSSProperties;
}

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

  render() {
    return (
      <GoalCardListComponent
        goalList={this.goalList}
        cardStyle={this.cardStyle}
        onTitleChange={this.#handleTitleChange}
        onStatusChange={this.#handleItemStatusChange}
        onItemClick={this.#handleItemClick}
      />
    );
  }
}

interface GoalCardListComponentProps extends GoalCardListProps {
  onTitleChange?: (item: GoalItem) => void;
  onStatusChange?: (item: GoalItem) => void;
  onItemClick?: (item: GoalItem) => void;
}

function GoalCardListComponent({
  goalList: _goalList,
  cardStyle,
  onTitleChange,
  onStatusChange,
  onItemClick,
}: GoalCardListComponentProps) {
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

  return (
    <div className="goal-container">
      {goalList?.map((item) => (
        <GoalCardItem
          key={item.instanceId}
          goalItem={item}
          cardStyle={cardStyle}
          onTitleChange={(v) => handleTitleChange(v, item)}
          onStatusChange={(v) => handleStatusChange(v, item)}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}
