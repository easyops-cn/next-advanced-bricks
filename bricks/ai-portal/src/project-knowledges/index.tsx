import React, { useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
// import { initializeI18n } from "@next-core/i18n";
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
// import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { parseTemplate } from "../shared/parseTemplate.js";

// initializeI18n(NS, locales);

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

export interface ProjectKnowledgesProps {
  list?: Knowledge[];
  urlTemplate?: string;
  actions?: ActionType[];
}

export interface Knowledge {
  knowledgeId: string;
  title: string;
  time: number;
  description?: string;
}

export interface ActionClickDetail {
  action: SimpleActionType;
  item: Knowledge;
}

/**
 * 构件 `ai-portal.project-knowledges`
 */
export
@defineElement("ai-portal.project-knowledges", {
  styleTexts: [styleText],
})
class ProjectKnowledges
  extends ReactNextElement
  implements ProjectKnowledgesProps
{
  @property({ attribute: false })
  accessor list: Knowledge[] | undefined;

  @property()
  accessor urlTemplate: string | undefined;

  @property({ attribute: false })
  accessor actions: ActionType[] | undefined;

  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionClickDetail>;

  #handleActionClick = (detail: ActionClickDetail) => {
    this.#actionClick.emit(detail);
  };

  render() {
    return (
      <ProjectKnowledgesComponent
        list={this.list}
        urlTemplate={this.urlTemplate}
        actions={this.actions}
        onActionClick={this.#handleActionClick}
      />
    );
  }
}

interface ProjectKnowledgesComponentProps extends ProjectKnowledgesProps {
  onActionClick: (detail: ActionClickDetail) => void;
}

function ProjectKnowledgesComponent({
  list,
  urlTemplate,
  actions,
  onActionClick,
}: ProjectKnowledgesComponentProps) {
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
        <li className="item" key={item.knowledgeId}>
          <KnowledgeLink
            knowledge={item}
            urlTemplate={urlTemplate}
            actions={actions}
            onActionClick={onActionClick}
          />
        </li>
      ))}
    </ul>
  );
}

interface KnowledgeLinkProps
  extends Pick<
    ProjectKnowledgesComponentProps,
    "urlTemplate" | "actions" | "onActionClick"
  > {
  knowledge: Knowledge;
}

function KnowledgeLink({
  knowledge,
  urlTemplate,
  actions,
  onActionClick,
}: KnowledgeLinkProps) {
  const [actionsVisible, setActionsVisible] = useState(false);

  return (
    <WrappedLink
      className={classNames("link", { "actions-active": actionsVisible })}
      url={parseTemplate(urlTemplate, knowledge)}
    >
      <div className="main">
        <div className="header">
          <WrappedIcon className="icon" lib="lucide" icon="clock" />
          <span className="title">{knowledge.title}</span>
          <WrappedIcon className="attachment" lib="lucide" icon="paperclip" />
        </div>
        {knowledge.description && (
          <div className="description">{knowledge.description}</div>
        )}
      </div>
      <div className="time">
        {humanizeTime(knowledge.time * 1000, HumanizeTimeFormat.relative)}
      </div>
      <div className="operations">
        <WrappedMiniActions
          className="actions"
          actions={actions}
          onActionClick={(e) => {
            onActionClick({ action: e.detail, item: knowledge });
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
