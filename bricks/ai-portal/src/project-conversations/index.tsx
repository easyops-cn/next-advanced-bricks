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
import type { AvatarProps, EoAvatar } from "@next-bricks/basic/avatar";
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
const WrappedAvatar = wrapBrick<EoAvatar, AvatarProps>("eo-avatar");
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
}

export interface Conversation {
  conversationId: string;
  title: string;
  startTime: number;
  description?: string;
  goal?: string;
}

export interface ActionClickDetail {
  action: SimpleActionType;
  item: Conversation;
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
      {list?.map((item) => (
        <li className="item" key={item.conversationId}>
          <ConversationLink
            conversation={item}
            urlTemplate={urlTemplate}
            actions={actions}
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
    "urlTemplate" | "actions" | "onGoalClick" | "onActionClick"
  > {
  conversation: Conversation;
}

function ConversationLink({
  conversation,
  urlTemplate,
  actions,
  onGoalClick,
  onActionClick,
}: ConversationLinkProps) {
  const goalRef = useRef<HTMLSpanElement>(null);

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
          <WrappedIcon className="icon" lib="lucide" icon="clock" />
          <span className="title">{conversation.title}</span>
          <span
            className={classNames("goal", {
              global: conversation.goal == null,
            })}
            ref={goalRef}
          >
            {conversation.goal ?? t(K.PROJECT_OVERALL)}
          </span>
        </div>
        {conversation.description && (
          <div className="description">{conversation.description}</div>
        )}
      </div>
      <div className="time">
        {humanizeTime(
          conversation.startTime * 1000,
          HumanizeTimeFormat.relative
        )}
      </div>
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
        <WrappedAvatar className="avatar" size="small" /* bordered */ />
      </div>
    </WrappedLink>
  );
}
