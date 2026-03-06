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
import {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";

// initializeI18n(NS, locales);

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

export interface ProjectKnowledgesProps {
  list?: Knowledge[];
  urlTemplate?: string;
  actions?: ActionType[];
}

export interface Knowledge {
  instanceId: string;
  name: string;
  description?: string;
  time: number;
  user?: string;
}

export interface ActionClickDetail {
  action: SimpleActionType;
  item: Knowledge;
}

/**
 * 构件 `ai-portal.project-knowledges`
 *
 * 项目知识库列表构件，展示项目中的知识条目，支持操作菜单和点击跳转。
 */
export
@defineElement("ai-portal.project-knowledges", {
  styleTexts: [styleText],
})
class ProjectKnowledges
  extends ReactNextElement
  implements ProjectKnowledgesProps
{
  /** 知识列表数据，为 undefined 时显示加载状态 */
  @property({ attribute: false })
  accessor list: Knowledge[] | undefined;

  /** 知识详情链接模板，支持使用知识字段插值 */
  @property()
  accessor urlTemplate: string | undefined;

  /** 操作菜单配置，每条知识行尾显示可操作的菜单项 */
  @property({ attribute: false })
  accessor actions: ActionType[] | undefined;

  /**
   * @description 点击操作菜单项时触发
   * @detail { action: 操作项配置, item: 所属知识数据 }
   */
  @event({ type: "action.click" })
  accessor #actionClick!: EventEmitter<ActionClickDetail>;

  /**
   * @description 点击知识条目时触发
   * @detail { instanceId: 知识ID, name: 知识名称, description: 描述, time: 时间戳, user: 创建人 }
   */
  @event({ type: "item.click" })
  accessor #itemClick!: EventEmitter<Knowledge>;

  #handleActionClick = (detail: ActionClickDetail) => {
    this.#actionClick.emit(detail);
  };

  #handleItemClick = (item: Knowledge) => {
    this.#itemClick.emit(item);
  };

  render() {
    return (
      <ProjectKnowledgesComponent
        list={this.list}
        urlTemplate={this.urlTemplate}
        actions={this.actions}
        onActionClick={this.#handleActionClick}
        onItemClick={this.#handleItemClick}
      />
    );
  }
}

interface ProjectKnowledgesComponentProps extends ProjectKnowledgesProps {
  onActionClick: (detail: ActionClickDetail) => void;
  onItemClick?: (item: Knowledge) => void;
}

function ProjectKnowledgesComponent({
  list,
  urlTemplate,
  actions,
  onActionClick,
  onItemClick,
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
        <li className="item" key={item.instanceId}>
          <KnowledgeLink
            knowledge={item}
            urlTemplate={urlTemplate}
            actions={actions}
            onActionClick={onActionClick}
            onItemClick={onItemClick}
          />
        </li>
      ))}
    </ul>
  );
}

interface KnowledgeLinkProps
  extends Pick<
    ProjectKnowledgesComponentProps,
    "urlTemplate" | "actions" | "onActionClick" | "onItemClick"
  > {
  knowledge: Knowledge;
}

function KnowledgeLink({
  knowledge,
  urlTemplate,
  actions,
  onActionClick,
  onItemClick,
}: KnowledgeLinkProps) {
  const [actionsVisible, setActionsVisible] = useState(false);

  return (
    <WrappedLink
      className={classNames("link", { "actions-active": actionsVisible })}
      url={parseTemplate(urlTemplate, knowledge)}
      onClick={() => onItemClick?.(knowledge)}
    >
      <div className="main">
        <div className="header">
          <WrappedIcon
            className="icon"
            lib="easyops"
            icon="lightbulb"
            category="common"
          />
          <span className="title">{knowledge.name}</span>
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
        <WrappedAvatar
          className="avatar"
          size="small"
          nameOrInstanceId={knowledge.user}
        />
      </div>
    </WrappedLink>
  );
}
