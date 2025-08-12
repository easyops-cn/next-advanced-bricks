import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { i18n, initializeI18n } from "@next-core/i18n";
import { getHistory } from "@next-core/runtime";
import classNames from "classnames";
import type { DropdownActionsProps } from "@next-bricks/basic/dropdown-actions";
import type { ActionType } from "@next-bricks/basic/mini-actions";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import ElevoLogo from "../elevo-logo/images/logo@2x.png";
import {
  WrappedDropdownActions,
  WrappedEasyopsAvatar,
  WrappedIcon,
  WrappedIconButton,
  WrappedLink,
} from "./bricks.js";
import {
  ChatHistory,
  type ActionClickDetail,
  type ChatHistoryRef,
} from "./ChatHistory.js";

initializeI18n(NS, locales);

const SIDEBAR_ICON: GeneralIconProps = {
  lib: "easyops",
  icon: "sidebar",
};

const { defineElement, property, event, method } = createDecorators();

export interface ElevoSidebarProps {
  userInstanceId?: string;
  behavior?: "default" | "drawer";
  logoUrl?: string;
  newChatUrl?: string;
  historyActiveId?: string;
  historyUrlTemplate?: string;
  historyActions?: ActionType[];
  links?: SidebarLink[];
}

export interface SidebarLink {
  title: string;
  url: string;
  icon: GeneralIconProps;
}

const ElevoSidebarComponent = forwardRef(LegacyElevoSidebarComponent);

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

  @property({ attribute: false })
  accessor links: SidebarLink[] | undefined;

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

  #ref = createRef<ChatHistoryRef>();

  /**
   * @param delay Delay in milliseconds before pulling the latest chat history.
   */
  @method()
  pullHistory(delay: number) {
    // Wait 3 seconds to let the task title to be summarized.
    setTimeout(() => {
      this.#ref.current?.pull();
    }, delay);
  }

  render() {
    return (
      <ElevoSidebarComponent
        ref={this.#ref}
        userInstanceId={this.userInstanceId}
        behavior={this.behavior}
        logoUrl={this.logoUrl}
        newChatUrl={this.newChatUrl}
        historyActiveId={this.historyActiveId}
        historyUrlTemplate={this.historyUrlTemplate}
        historyActions={this.historyActions}
        links={this.links}
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

function LegacyElevoSidebarComponent(
  {
    userInstanceId,
    behavior,
    logoUrl,
    newChatUrl,
    historyActiveId,
    historyUrlTemplate,
    historyActions,
    links,
    onLogout,
    onActionClick,
  }: ElevoSidebarComponentProps,
  ref: React.Ref<ChatHistoryRef>
) {
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

  const dropdownActions = useMemo<DropdownActionsProps["actions"]>(
    () => [
      {
        key: "logout",
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "arrow-right-from-bracket",
        },
        text: t(K.LOGOUT),
      },
      {
        key: "switch-language",
        icon: {
          lib: "easyops",
          icon: "language",
        },
        text: t(K.SWITCH_LANGUAGE),
      },
    ],
    []
  );

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
          <WrappedIconButton
            icon={SIDEBAR_ICON}
            variant="light"
            onClick={handleCollapse}
          />
        </div>
        <WrappedLink className="new-chat" url={newChatUrl}>
          <WrappedIcon
            className="new-chat-icon"
            lib="easyops"
            icon="new-chat"
          />
          {t(K.NEW_CHAT)}
        </WrappedLink>
        {links?.length ? (
          <div className="links">
            {links.map((link, index) => (
              <WrappedLink className="link" key={index} url={link.url}>
                <WrappedIcon className="icon" {...link.icon} />
                <span className="title">{link.title}</span>
              </WrappedLink>
            ))}
          </div>
        ) : null}
        <ChatHistory
          ref={ref}
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
            onActionClick={async (e) => {
              if (e.detail.key === "logout") {
                onLogout();
              } else {
                await i18n.changeLanguage(
                  i18n.language && i18n.language.split("-")[0] === "en"
                    ? "zh"
                    : "en"
                );
                getHistory().reload();
              }
            }}
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
        <WrappedIconButton
          icon={SIDEBAR_ICON}
          variant="light"
          onClick={handleExpand}
        />
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
