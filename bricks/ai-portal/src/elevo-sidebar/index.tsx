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

export type { SidebarLink, SpaceNavProps };

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
  showProjects?: boolean;
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
 * Elevo AI 侧边栏，包含 Logo 导航、新建对话、历史记录、项目列表及个人账户操作，支持折叠和抽屉两种行为模式。
 *
 * @category layout-component
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

  @property({ type: Boolean })
  accessor showProjects: boolean | undefined;

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

  /**
   * @detail void
   * @description 点击退出登录时触发
   */
  @event({ type: "logout" })
  accessor #logout!: EventEmitter<void>;

  #handleLogout = () => {
    this.#logout.emit();
  };

  /**
   * 点击对话历史操作按钮时触发
   * @detail { action: 点击的操作项（含 project 等扩展字段）, item: 当前对话历史记录项, project: 关联的项目（可选） }
   * @description 点击对话历史操作按钮时触发
   */
  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionClickDetail>;

  #handleActionClick = (detail: ActionClickDetail) => {
    this.#actionClick.emit(detail);
  };

  /**
   * 点击项目操作按钮时触发
   * @detail { action: 点击的操作项, project: 当前项目对象 }
   * @description 点击项目操作按钮时触发
   */
  @event({ type: "project.action.click" })
  accessor #projectActionClick!: EventEmitter<ProjectActionClickDetail>;

  #handleProjectActionClick = (detail: ProjectActionClickDetail) => {
    this.#projectActionClick.emit(detail);
  };

  /**
   * @detail void
   * @description 点击新建项目按钮时触发
   */
  @event({ type: "add.project" })
  accessor #addProject!: EventEmitter<void>;

  #handleAddProject = () => {
    this.#addProject.emit();
  };

  /**
   * @detail void
   * @description 点击新建服务流按钮时触发（scope 为 space 时有效）
   */
  @event({ type: "add.serviceflow" })
  accessor #addServiceflow!: EventEmitter<void>;

  #handleAddServiceflow = () => {
    this.#addServiceflow.emit();
  };

  /**
   * 点击个人操作按钮时触发
   * @detail { action: 点击的操作项 }
   * @description 点击个人操作按钮时触发
   */
  @event({ type: "personal.action.click" })
  accessor #personalActionClick!: EventEmitter<PersonalActionClickDetail>;

  #handlePersonalActionClick = (detail: PersonalActionClickDetail) => {
    this.#personalActionClick.emit(detail);
  };

  #ref = createRef<ElevoSidebarRef>();

  /**
   * 延迟一段时间后拉取最新对话历史
   * @param delay 拉取前的等待时长（毫秒），用于等待任务标题生成完成
   */
  @method()
  pullHistory(delay: number) {
    // Wait several seconds to let the task title to be summarized.
    setTimeout(() => {
      this.#ref.current?.pull();
    }, delay);
  }

  /** 展开侧边栏（behavior 为 drawer 时有效） */
  @method()
  open() {
    this.#ref.current?.open();
  }

  /** 折叠侧边栏（behavior 为 drawer 时有效） */
  @method()
  close() {
    this.#ref.current?.close();
  }

  /**
   * 从历史列表中移除指定项目及其对话
   * @param projectId 要移除的项目 instanceId
   */
  @method()
  removeProject(projectId: string) {
    this.#ref.current?.removeProject?.(projectId);
  }

  /**
   * 向项目列表中追加一个新项目
   * @param project 要追加的项目对象
   */
  @method()
  addProject(project: Project) {
    this.#ref.current?.addProject?.(project);
  }

  /**
   * 将指定对话标记为已移入项目，从历史列表中隐藏
   * @param conversationId 要移动的对话 ID
   */
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
        showProjects={this.showProjects}
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
    showProjects,
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
                showProjects={showProjects}
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
