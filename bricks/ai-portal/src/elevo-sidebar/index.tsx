import React, { useCallback, useEffect, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import type { DropdownActionsProps } from "@next-bricks/basic/dropdown-actions";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import ElevoLogo from "../elevo-logo/images/logo@2x.png";
import {
  WrappedDropdownActions,
  WrappedEasyopsAvatar,
  WrappedIcon,
  WrappedLink,
} from "./bricks.js";
import { ChatHistory, type ActionClickDetail } from "./ChatHistory.js";
import type { ActionType } from "@next-bricks/basic/mini-actions";

initializeI18n(NS, locales);

const dropdownActions: DropdownActionsProps["actions"] = [
  {
    icon: {
      lib: "fa",
      prefix: "fas",
      icon: "arrow-right-from-bracket",
    },
    text: t(K.LOGOUT),
  },
];

const { defineElement, property, event } = createDecorators();

export interface ElevoSidebarProps {
  userInstanceId?: string;
  behavior?: "default" | "drawer";
  logoUrl?: string;
  newChatUrl?: string;
  historyActiveId?: string;
  historyUrlTemplate?: string;
  historyActions?: ActionType[];
}

/**
 * 构件 `ai-portal.elevo-sidebar`
 */
export
@defineElement("ai-portal.elevo-sidebar", {
  styleTexts: [styleText],
})
class ElevoSidebar extends ReactNextElement implements ElevoSidebarProps {
  @property()
  accessor userInstanceId: string | undefined;

  @property()
  accessor behavior: "default" | "drawer" | undefined;

  @property()
  accessor logoUrl: string | undefined;

  @property()
  accessor newChatUrl: string | undefined;

  @property()
  accessor historyActiveId: string | undefined;

  @property()
  accessor historyUrlTemplate: string | undefined;

  @property({ attribute: false })
  accessor historyActions: ActionType[] | undefined;

  @event({ type: "logout" })
  accessor #logout!: EventEmitter<void>;

  #handleLogout = () => {
    this.#logout.emit();
  };

  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionClickDetail>;

  #handleActionClick = (detail: ActionClickDetail) => {
    this.#actionClick.emit(detail);
  };

  render() {
    return (
      <ElevoSidebarComponent
        userInstanceId={this.userInstanceId}
        behavior={this.behavior}
        logoUrl={this.logoUrl}
        newChatUrl={this.newChatUrl}
        historyActiveId={this.historyActiveId}
        historyUrlTemplate={this.historyUrlTemplate}
        historyActions={this.historyActions}
        onLogout={this.#handleLogout}
        onActionClick={this.#handleActionClick}
      />
    );
  }
}

interface ElevoSidebarComponentProps extends ElevoSidebarProps {
  onLogout: () => void;
  onActionClick: (detail: ActionClickDetail) => void;
}

function ElevoSidebarComponent({
  userInstanceId,
  behavior,
  logoUrl,
  newChatUrl,
  historyActiveId,
  historyUrlTemplate,
  historyActions,
  onLogout,
  onActionClick,
}: ElevoSidebarComponentProps) {
  const [collapsed, setCollapsed] = useState(behavior === "drawer");
  const handleCollapse = useCallback(() => {
    setCollapsed(true);
  }, []);
  const handleExpand = useCallback(() => {
    setCollapsed(false);
  }, []);

  useEffect(() => {
    if (behavior === "drawer") {
      setCollapsed(true);
    }
  }, [behavior]);

  const handleClickMask = useCallback(() => {
    setCollapsed(true);
  }, []);

  const handleHistoryClick = useCallback(() => {
    if (behavior === "drawer") {
      setCollapsed(true);
    }
  }, [behavior]);

  return (
    <div className={classNames("container", { collapsed })}>
      {behavior === "drawer" && !collapsed && (
        <div className="mask" onClick={handleClickMask} />
      )}
      <div className="sidebar">
        <div className="logo-bar">
          <WrappedLink url={logoUrl} className="logo-link">
            <img
              className="logo"
              alt="Elevo"
              src={ElevoLogo}
              width={95}
              height={26}
            />
          </WrappedLink>
          <button className="toggle" onClick={handleCollapse}>
            <WrappedIcon lib="easyops" icon="sidebar" />
          </button>
        </div>
        <WrappedLink className="new-chat" url={newChatUrl}>
          <WrappedIcon
            className="new-chat-icon"
            lib="easyops"
            icon="new-chat"
          />
          {t(K.NEW_CHAT)}
        </WrappedLink>
        <ChatHistory
          activeId={historyActiveId}
          urlTemplate={historyUrlTemplate}
          actions={historyActions}
          onActionClick={onActionClick}
          onHistoryClick={handleHistoryClick}
        />
        <div className="footer">
          <WrappedDropdownActions
            className="dropdown"
            actions={dropdownActions}
            onActionClick={onLogout}
          >
            <button className="account">
              <WrappedEasyopsAvatar
                nameOrInstanceId={userInstanceId}
                showName
                size="xs"
              />
            </button>
          </WrappedDropdownActions>
        </div>
      </div>
      <div className="alternative">
        <button className="toggle" onClick={handleExpand}>
          <WrappedIcon lib="easyops" icon="sidebar" />
        </button>
        <WrappedLink className="new-chat" url={newChatUrl}>
          <WrappedIcon
            className="new-chat-icon"
            lib="easyops"
            icon="new-chat"
          />
          {t(K.NEW_CHAT)}
        </WrappedLink>
      </div>
    </div>
  );
}
