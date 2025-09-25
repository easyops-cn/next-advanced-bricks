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

const { defineElement, property, event, method } = createDecorators();

interface ActionItem extends ButtonProps {
  text: string;
  key: string;
  icon?: GeneralIconProps;
  active?: boolean;
  event?: string;
  hidden?: boolean;
}

export interface ActionButtonsProps {
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
class ActionButtons extends ReactNextElement implements ActionButtonsProps {
  @property({
    attribute: false,
  })
  accessor items: ActionItem[] | undefined;

  @property({ type: Boolean })
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

  @method()
  setActive(key: string) {
    const action = this.items?.find((item) => item.key === key);
    if (!action || action.active) {
      return;
    }
    this.#handleActionClick(action);
  }

  render() {
    return (
      <ActionButtonsComponent
        items={this.items}
        multiple={this.multiple}
        onActionClick={this.#handleActionClick}
      />
    );
  }
}

interface ActionButtonsComponentProps extends ActionButtonsProps {
  onActionClick: (action: ActionItem) => void;
}

function ActionButtonsComponent({
  items,
  onActionClick,
}: ActionButtonsComponentProps) {
  const filteredItems = useMemo(() => {
    return items?.filter((item) => !item.hidden);
  }, [items]);

  return (
    <div className="button-container">
      {filteredItems?.map((item) => {
        const { event, text, active, key, ...rest } = item;
        return (
          <WrapperButton
            key={key}
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
