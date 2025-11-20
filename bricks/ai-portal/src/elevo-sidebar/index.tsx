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
  type PersonalActionClickDetail,
  type Project,
  type ProjectActionClickDetail,
} from "./ChatHistory.js";
import { NavLink } from "./NavLink.js";
import type { SidebarLink } from "./interfaces.js";
import { SpaceNav, type SpaceNavProps } from "./SpaceNav.js";

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
  personalActions?: ActionType[];
  links?: SidebarLink[];
  canAddProject?: boolean;
  myLinks?: SidebarLink[];
  scope?: "default" | "space";
  spaceNav?: SpaceNavProps;
}

export type { ActionClickDetail, Project, ProjectActionClickDetail };

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
  accessor historyUrlTemplate: string | undefined;

  @property({ attribute: false })
  accessor historyActions: ActionType[] | undefined;

  @property()
  accessor projectUrlTemplate: string | undefined;

  @property({ attribute: false })
  accessor projectActions: ActionType[] | undefined;

  @property({ attribute: false })
  accessor personalActions: ActionType[] | undefined;

  @property({ attribute: false })
  accessor links: SidebarLink[] | undefined;

  @property({ type: Boolean })
  accessor canAddProject: boolean | undefined = true;

  @property({ attribute: false })
  accessor myLinks: SidebarLink[] | undefined;

  /**
   * @default "default"
   */
  @property()
  accessor scope: "default" | "space" | undefined;

  @property({ attribute: false })
  accessor spaceNav: SpaceNavProps | undefined;

  @event({ type: "logout" })
  accessor #logout!: EventEmitter<void>;

  #handleLogout = () => {
    this.#logout.emit();
  };

  /**
   * 点击对话历史操作按钮时触发
   */
  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionClickDetail>;

  #handleActionClick = (detail: ActionClickDetail) => {
    this.#actionClick.emit(detail);
  };

  /**
   * 点击项目操作按钮时触发
   */
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

  @event({ type: "add.serviceflow" })
  accessor #addServiceflow!: EventEmitter<void>;

  #handleAddServiceflow = () => {
    this.#addServiceflow.emit();
  };

  /**
   * 点击项目操作按钮时触发
   */
  @event({ type: "personal.action.click" })
  accessor #personalActionClick!: EventEmitter<PersonalActionClickDetail>;

  #handlePersonalActionClick = (detail: PersonalActionClickDetail) => {
    this.#personalActionClick.emit(detail);
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
        historyUrlTemplate={this.historyUrlTemplate}
        historyActions={this.historyActions}
        projectUrlTemplate={this.projectUrlTemplate}
        projectActions={this.projectActions}
        personalActions={this.personalActions}
        links={this.links}
        canAddProject={this.canAddProject}
        myLinks={this.myLinks}
        scope={this.scope}
        spaceNav={this.spaceNav}
        onLogout={this.#handleLogout}
        onActionClick={this.#handleActionClick}
        onProjectActionClick={this.#handleProjectActionClick}
        onAddProject={this.#handleAddProject}
        onAddServiceflow={this.#handleAddServiceflow}
        onPersonalActionClick={this.#handlePersonalActionClick}
      />
    );
  }
}

interface ElevoSidebarComponentProps extends ElevoSidebarProps {
  onLogout: () => void;
  onActionClick: (detail: ActionClickDetail) => void;
  onProjectActionClick: (detail: ProjectActionClickDetail) => void;
  onAddProject: () => void;
  onAddServiceflow: () => void;
  onPersonalActionClick: (detail: PersonalActionClickDetail) => void;
}

function LegacyElevoSidebarComponent(
  {
    userInstanceId,
    behavior,
    logoUrl,
    newChatUrl,
    newChatLinkWhenCollapsed,
    historyUrlTemplate,
    historyActions,
    projectUrlTemplate,
    projectActions,
    links,
    canAddProject,
    myLinks,
    scope,
    spaceNav,
    personalActions,
    onLogout,
    onActionClick,
    onProjectActionClick,
    onAddProject,
    onAddServiceflow,
    onPersonalActionClick,
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
          lib: "lucide",
          icon: "languages",
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
        <div className="main">
          {scope === "space" ? (
            <SpaceNav onAddServiceflow={onAddServiceflow} {...spaceNav!} />
          ) : (
            <>
              <WrappedLink className="new-chat" url={newChatUrl}>
                <WrappedIcon
                  className="new-chat-icon"
                  lib="easyops"
                  icon="new-chat"
                />
                {t(K.NEW_CHAT)}
              </WrappedLink>
              {links?.length ? (
                <>
                  {links.map((link, index) => (
                    <NavLink
                      key={index}
                      url={link.url}
                      activeIncludes={link.activeIncludes}
                      render={({ active }) => (
                        <WrappedLink
                          key={index}
                          className={classNames("link", { active })}
                          url={link.url}
                        >
                          <WrappedIcon className="icon" {...link.icon} />
                          <span className="title">{link.title}</span>
                        </WrappedLink>
                      )}
                    />
                  ))}
                  <div className="divider" />
                </>
              ) : null}
              <ChatHistory
                ref={historyRef}
                canAddProject={canAddProject}
                historyUrlTemplate={historyUrlTemplate}
                historyActions={historyActions}
                projectUrlTemplate={projectUrlTemplate}
                projectActions={projectActions}
                myLinks={myLinks}
                onActionClick={onActionClick}
                onHistoryClick={handleHistoryClick}
                onProjectActionClick={onProjectActionClick}
                onAddProject={onAddProject}
              />
            </>
          )}
        </div>
        <div className="footer">
          <WrappedDropdownActions
            className="dropdown"
            themeVariant="elevo"
            actions={personalActions || dropdownActions}
            onActionClick={async (e) => {
              if (personalActions) {
                onPersonalActionClick({ action: e.detail });
              } else if (e.detail.key === "logout") {
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
