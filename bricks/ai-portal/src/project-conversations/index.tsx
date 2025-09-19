import React, { useEffect, useRef, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import type {
  ActionType,
  EoMiniActions,
  EoMiniActionsEvents,
  EoMiniActionsEventsMapping,
  EoMiniActionsProps,
  SimpleActionType,
} from "@next-bricks/basic/mini-actions";
import { humanizeTime, HumanizeTimeFormat } from "@next-shared/datetime";
import classNames from "classnames";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { parseTemplate } from "../shared/parseTemplate.js";

initializeI18n(NS, locales);

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedAvatar = wrapBrick<EoEasyopsAvatar, EoEasyopsAvatarProps>(
  "eo-easyops-avatar"
);
const WrappedMiniActions = wrapBrick<
  EoMiniActions,
  EoMiniActionsProps,
  EoMiniActionsEvents,
  EoMiniActionsEventsMapping
>("eo-mini-actions", {
  onActionClick: "action.click",
  onVisibleChange: "visible.change",
});

const { defineElement, property, event } = createDecorators();

export interface ProjectConversationsProps {
  list?: Conversation[];
  urlTemplate?: string;
  actions?: ActionType[];
  goals?: Goal[];
}

export interface Conversation {
  conversationId: string;
  title: string;
  startTime: number;
  description?: string;
  goalInstanceId?: string;
  username?: string;
}

export interface ActionClickDetail {
  action: SimpleActionType;
  item: Conversation;
}

export interface Goal {
  instanceId: string;
  title: string;
}

/**
 * 构件 `ai-portal.project-conversations`
 */
export
@defineElement("ai-portal.project-conversations", {
  styleTexts: [styleText],
})
class ProjectConversations
  extends ReactNextElement
  implements ProjectConversationsProps
{
  @property({ attribute: false })
  accessor list: Conversation[] | undefined;

  @property()
  accessor urlTemplate: string | undefined;

  @property({ attribute: false })
  accessor actions: ActionType[] | undefined;

  @property({ attribute: false })
  accessor goals: Goal[] | undefined;

  @event({ type: "goal.click" })
  accessor #goalClick!: EventEmitter<Conversation>;

  #handleGoalClick = (conversation: Conversation) => {
    this.#goalClick.emit(conversation);
  };

  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionClickDetail>;

  #handleActionClick = (detail: ActionClickDetail) => {
    this.#actionClick.emit(detail);
  };

  render() {
    return (
      <ProjectConversationsComponent
        list={this.list}
        urlTemplate={this.urlTemplate}
        actions={this.actions}
        goals={this.goals}
        onGoalClick={this.#handleGoalClick}
        onActionClick={this.#handleActionClick}
      />
    );
  }
}

interface ProjectConversationsComponentProps extends ProjectConversationsProps {
  onGoalClick: (conversation: Conversation) => void;
  onActionClick: (detail: ActionClickDetail) => void;
}

function ProjectConversationsComponent({
  list,
  urlTemplate,
  actions,
  goals,
  onGoalClick,
  onActionClick,
}: ProjectConversationsComponentProps) {
  if (!list) {
    return (
      <div className="loading">
        <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
      </div>
    );
  }

  return (
    <ul>
      {list.map((item) => (
        <li className="item" key={item.conversationId}>
          <ConversationLink
            conversation={item}
            urlTemplate={urlTemplate}
            actions={actions}
            goals={goals}
            onGoalClick={onGoalClick}
            onActionClick={onActionClick}
          />
        </li>
      ))}
    </ul>
  );
}

interface ConversationLinkProps
  extends Pick<
    ProjectConversationsComponentProps,
    "urlTemplate" | "actions" | "goals" | "onGoalClick" | "onActionClick"
  > {
  conversation: Conversation;
}

function ConversationLink({
  conversation,
  urlTemplate,
  actions,
  goals,
  onGoalClick,
  onActionClick,
}: ConversationLinkProps) {
  const goalRef = useRef<HTMLDivElement>(null);

  // <eo-link> handles click manually,
  // so we need to stop propagation and prevent default manually.
  useEffect(() => {
    const el = goalRef.current;
    if (!el) return;
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onGoalClick(conversation);
    };
    el.addEventListener("click", handleClick);
    return () => {
      el.removeEventListener("click", handleClick);
    };
  }, [conversation, onGoalClick]);

  const [actionsVisible, setActionsVisible] = useState(false);

  return (
    <WrappedLink
      className={classNames("link", { "actions-active": actionsVisible })}
      url={parseTemplate(urlTemplate, conversation)}
    >
      <div className="main">
        <div className="header">
          <WrappedIcon
            className="icon"
            lib="easyops"
            category="common"
            icon="clock"
          />
          <div className="title">{conversation.title}</div>
        </div>
        {conversation.description && (
          <div className="description">{conversation.description}</div>
        )}
      </div>
      {goals && (
        <div
          className={classNames("goal", {
            global: !conversation.goalInstanceId,
          })}
          ref={goalRef}
        >
          {conversation.goalInstanceId
            ? goals.find((g) => g.instanceId === conversation.goalInstanceId)
                ?.title
            : t(K.PROJECT_OVERALL)}
        </div>
      )}
      <WrappedAvatar
        className="avatar"
        size="small"
        nameOrInstanceId={conversation.username}
      />
      <div className="operations">
        <WrappedMiniActions
          className="actions"
          actions={actions}
          onActionClick={(e) => {
            onActionClick({ action: e.detail, item: conversation });
          }}
          onVisibleChange={(e) => {
            setActionsVisible(e.detail);
          }}
        />
        <div
          className="time"
          title={
            humanizeTime(
              conversation.startTime * 1000,
              HumanizeTimeFormat.full
            )!
          }
        >
          {humanizeTime(
            conversation.startTime * 1000,
            HumanizeTimeFormat.relative
          )}
        </div>
      </div>
    </WrappedLink>
  );
}
