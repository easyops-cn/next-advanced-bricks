import React, { useEffect, useMemo, useRef, useState } from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { Button, ButtonProps } from "@next-bricks/basic/button";
import { NS, locales } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const WrapperIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrapperButton = wrapBrick<Button, ButtonProps>("eo-button");

const { defineElement, property, event } = createDecorators();

export interface ActionItem {
  text: string;
  key: string;
  icon?: GeneralIconProps;
  hidden?: boolean;
}

export interface ActionButtonsProps {
  items?: ActionItem[];
  activeKey?: string | null;
}

/**
 * 动作按钮组，支持选中状态切换，用于聊天框的功能入口。
 *
 * @description 动作按钮组，支持选中状态切换，用于聊天框的功能入口。
 * @category ai-portal
 */
export
@defineElement("ai-portal.action-buttons", {
  styleTexts: [styleText],
})
class ActionButtons extends ReactNextElement implements ActionButtonsProps {
  /**
   * 按钮列表配置，每项包含文本、唯一键值及可选图标
   */
  @property({
    attribute: false,
  })
  accessor items: ActionItem[] | undefined;

  /**
   * 当前选中按钮的键值，选中后显示删除图标，再次点击可取消选中
   */
  @property()
  accessor activeKey: string | null | undefined;

  /**
   * @detail { key: 按钮键值, text: 按钮文本, icon: 按钮图标 } | null — 选中时为选中的 ActionItem，取消选中时为 null
   * @description 选中或取消选中动作按钮时触发
   */
  @event({ type: "change" })
  accessor #change!: EventEmitter<ActionItem | null>;

  #handleChange = (action: ActionItem | null) => {
    this.activeKey = action ? action.key : null;
    this.#change.emit(action);
  };

  render() {
    return (
      <ActionButtonsComponent
        items={this.items}
        activeKey={this.activeKey}
        onChange={this.#handleChange}
      />
    );
  }
}

interface ActionButtonsComponentProps extends ActionButtonsProps {
  onChange: (action: ActionItem | null) => void;
}

function ActionButtonsComponent({
  items,
  activeKey: propActiveKey,
  onChange,
}: ActionButtonsComponentProps) {
  const [activeKey, setActiveKey] = useState<string | null>(
    propActiveKey ?? null
  );
  const initializedRef = useRef(false);

  useEffect(() => {
    setActiveKey(propActiveKey ?? null);
  }, [propActiveKey]);

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    onChange(
      activeKey
        ? (items?.find((item) => !item.hidden && item.key === activeKey) ??
            null)
        : null
    );
  }, [activeKey, items, onChange]);

  const filteredItems = useMemo(() => {
    return items?.filter(
      (item) => (!item.hidden && !activeKey) || item.key === activeKey
    );
  }, [items, activeKey]);

  return (
    <div className="button-container">
      {filteredItems?.map((item) => {
        const { text, icon, key } = item;
        return (
          <WrapperButton
            key={key}
            className={`action${activeKey ? " active" : ""}`}
            themeVariant="elevo"
            type="neutral"
            onClick={() => {
              if (!activeKey) {
                setActiveKey(key);
              }
            }}
          >
            {icon ? <WrapperIcon className="icon" {...icon} /> : null}
            {text}
            {activeKey ? (
              <WrapperIcon
                className="remove"
                lib="lucide"
                icon="x"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setActiveKey(null);
                }}
              />
            ) : null}
          </WrapperButton>
        );
      })}
    </div>
  );
}
