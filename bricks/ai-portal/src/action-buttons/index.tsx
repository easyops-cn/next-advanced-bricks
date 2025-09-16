import React, { useMemo } from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import styleText from "./styles.shadow.css";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { Button, ButtonProps } from "@next-bricks/basic/button";

initializeI18n(NS, locales);

const WrapperButton = wrapBrick<Button, ButtonProps>("eo-button");

const { defineElement, property, event } = createDecorators();

interface ActionItem extends ButtonProps {
  text: string;
  icon?: GeneralIconProps;
  active?: boolean;
  event?: string;
  hidden?: boolean;
}

export interface ActionsButtonsProps {
  items?: ActionItem[];
  multiple?: boolean; // 是否支持多选
}

/**
 * 构件 `ai-portal.action-buttons`
 */
export
@defineElement("ai-portal.action-buttons", {
  styleTexts: [styleText],
})
class ActionsButtons extends ReactNextElement implements ActionsButtonsProps {
  @property({
    attribute: false,
  })
  accessor items: ActionItem[] | undefined;

  @property({
    attribute: false,
  })
  accessor multiple: boolean | undefined;

  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionItem>;

  #handleActionClick = (action: ActionItem) => {
    const newItems = this.items?.map((item) => {
      if (item.text === action.text) {
        return { ...item, active: !item.active };
      }

      return this.multiple ? item : { ...item, active: false };
    });

    this.items = newItems;
    const current = newItems?.find((item) => item.text === action.text);
    this.#actionClick.emit(current!);
    if (action.event) {
      const customEvent = new CustomEvent(action.event, {
        detail: {
          current,
          actives: newItems?.filter((item) => item.active),
        },
      });
      this.dispatchEvent(customEvent);
    }
  };

  render() {
    return (
      <ActionsButtonsComponent
        items={this.items}
        multiple={this.multiple}
        onActionClick={this.#handleActionClick}
      />
    );
  }
}

interface ActionsButtonsComponentProps extends ActionsButtonsProps {
  onActionClick: (action: ActionItem) => void;
}

function ActionsButtonsComponent({
  items,
  onActionClick,
}: ActionsButtonsComponentProps) {
  const filteredItems = useMemo(() => {
    return items?.filter((item) => !item.hidden);
  }, [items]);

  return (
    <div className="button-container">
      {filteredItems?.map((item, index) => {
        const { event, text, active, ...rest } = item;
        return (
          <WrapperButton
            key={index}
            className={`action${active ? " active" : ""}`}
            themeVariant="elevo"
            type="neutral"
            {...rest}
            onClick={() => onActionClick(item)}
          >
            {text}
          </WrapperButton>
        );
      })}
    </div>
  );
}
