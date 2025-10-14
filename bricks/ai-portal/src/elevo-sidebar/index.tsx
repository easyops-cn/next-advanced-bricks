import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { i18n, initializeI18n } from "@next-core/i18n";
import { getHistory } from "@next-core/runtime";
import classNames from "classnames";
import type { DropdownActionsProps } from "@next-bricks/basic/dropdown-actions";
import type { ActionType } from "@next-bricks/basic/mini-actions";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
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
  type Project,
  type ProjectActionClickDetail,
} from "./ChatHistory.js";

initializeI18n(NS, locales);

const SIDEBAR_ICON: GeneralIconProps = {
  lib: "easyops",
  icon: "sidebar",
};

const WrappedElevoLogo = wrapBrick("ai-portal.elevo-logo");

const { defineElement, property, event, method } = createDecorators();

export interface ElevoSidebarProps {
  userInstanceId?: string;
  behavior?: "default" | "drawer";
  logoUrl?: string;
  newChatUrl?: string;
  newChatLinkWhenCollapsed?: boolean;
  historyActiveId?: string;
  historyUrlTemplate?: string;
  historyActions?: ActionType[];
  projectActiveId?: string;
  projectUrlTemplate?: string;
  projectActions?: ActionType[];
  links?: SidebarLink[];
  canAddProject?: boolean;
}

export interface SidebarLink {
  title: string;
  url: string;
  icon: GeneralIconProps;
}

const ElevoSidebarComponent = forwardRef(LegacyElevoSidebarComponent);

interface ElevoSidebarRef extends ChatHistoryRef {
  open: () => void;
  close: () => void;
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

  @property({ type: Boolean })
  accessor newChatLinkWhenCollapsed: boolean | undefined;

  @property()
  accessor historyActiveId: string | undefined;

  @property()
  accessor historyUrlTemplate: string | undefined;

  @property({ attribute: false })
  accessor historyActions: ActionType[] | undefined;

  @property()
  accessor projectActiveId: string | undefined;

  @property()
  accessor projectUrlTemplate: string | undefined;

  @property({ attribute: false })
  accessor projectActions: ActionType[] | undefined;

  @property({ attribute: false })
  accessor links: SidebarLink[] | undefined;

  @property({ type: Boolean })
  accessor canAddProject: boolean | undefined = true;

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

  @event({ type: "project.action.click" })
  accessor #projectActionClick!: EventEmitter<ProjectActionClickDetail>;

  #handleProjectActionClick = (detail: ProjectActionClickDetail) => {
    this.#projectActionClick.emit(detail);
  };

  @event({ type: "add.project" })
  accessor #addProject!: EventEmitter<void>;

  #handleAddProject = () => {
    this.#addProject.emit();
  };

  #ref = createRef<ElevoSidebarRef>();

  /**
   * @param delay Delay in milliseconds before pulling the latest chat history.
   */
  @method()
  pullHistory(delay: number) {
    // Wait several seconds to let the task title to be summarized.
    setTimeout(() => {
      this.#ref.current?.pull();
    }, delay);
  }

  @method()
  open() {
    this.#ref.current?.open();
  }

  @method()
  close() {
    this.#ref.current?.close();
  }

  @method()
  removeProject(projectId: string) {
    this.#ref.current?.removeProject?.(projectId);
  }

  @method()
  addProject(project: Project) {
    this.#ref.current?.addProject?.(project);
  }

  @method()
  moveConversation(conversationId: string) {
    this.#ref.current?.moveConversation?.(conversationId);
  }

  render() {
    return (
      <ElevoSidebarComponent
        ref={this.#ref}
        userInstanceId={this.userInstanceId}
        behavior={this.behavior}
        logoUrl={this.logoUrl}
        newChatUrl={this.newChatUrl}
        newChatLinkWhenCollapsed={this.newChatLinkWhenCollapsed}
        historyActiveId={this.historyActiveId}
        historyUrlTemplate={this.historyUrlTemplate}
        historyActions={this.historyActions}
        projectActiveId={this.projectActiveId}
        projectUrlTemplate={this.projectUrlTemplate}
        projectActions={this.projectActions}
        links={this.links}
        canAddProject={this.canAddProject}
        onLogout={this.#handleLogout}
        onActionClick={this.#handleActionClick}
        onProjectActionClick={this.#handleProjectActionClick}
        onAddProject={this.#handleAddProject}
      />
    );
  }
}

interface ElevoSidebarComponentProps extends ElevoSidebarProps {
  onLogout: () => void;
  onActionClick: (detail: ActionClickDetail) => void;
  onProjectActionClick: (detail: ProjectActionClickDetail) => void;
  onAddProject: () => void;
}

function LegacyElevoSidebarComponent(
  {
    userInstanceId,
    behavior,
    logoUrl,
    newChatUrl,
    newChatLinkWhenCollapsed,
    historyActiveId,
    historyUrlTemplate,
    historyActions,
    projectActiveId,
    projectUrlTemplate,
    projectActions,
    links,
    canAddProject,
    onLogout,
    onActionClick,
    onProjectActionClick,
    onAddProject,
  }: ElevoSidebarComponentProps,
  ref: React.Ref<ElevoSidebarRef>
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

  const historyRef = useRef<ChatHistoryRef>(null);

  useImperativeHandle(
    ref,
    () => ({
      close: () => {
        setCollapsed(true);
      },
      pull: () => {
        historyRef.current?.pull();
      },
      removeProject: (projectId: string) => {
        historyRef.current?.removeProject?.(projectId);
      },
      addProject: (project: Project) => {
        historyRef.current?.addProject?.(project);
      },
      moveConversation: (conversationId: string) => {
        historyRef.current?.moveConversation?.(conversationId);
      },
      open: () => {
        setCollapsed(false);
      },
    }),
    []
  );

  return (
    <div className={classNames("container", { collapsed })}>
      {behavior === "drawer" && !collapsed && (
        <div className="mask" onClick={handleClickMask} />
      )}
      <div className="alternative">
        <WrappedIconButton
          icon={SIDEBAR_ICON}
          variant="light"
          onClick={handleExpand}
        />
        {newChatLinkWhenCollapsed && (
          <WrappedLink className="new-chat" url={newChatUrl}>
            <WrappedIcon
              className="new-chat-icon"
              lib="easyops"
              icon="new-chat"
            />
            {t(K.NEW_CHAT)}
          </WrappedLink>
        )}
      </div>
      <div className="sidebar">
        <div className="logo-bar">
          <WrappedLink url={logoUrl} className="logo-link">
            <WrappedElevoLogo />
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
          ref={historyRef}
          canAddProject={canAddProject}
          historyActiveId={historyActiveId}
          historyUrlTemplate={historyUrlTemplate}
          historyActions={historyActions}
          projectActiveId={projectActiveId}
          projectUrlTemplate={projectUrlTemplate}
          projectActions={projectActions}
          onActionClick={onActionClick}
          onHistoryClick={handleHistoryClick}
          onProjectActionClick={onProjectActionClick}
          onAddProject={onAddProject}
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
    </div>
  );
}
