import React from "react";
import { pick } from "lodash";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import type {
  ActionClickDetail,
  WorkbenchNodeData,
  WorkbenchTreeAction,
} from "../interfaces.js";
import { WorkbenchActionsContext } from "../shared/workbench/WorkbenchActionsContext.js";
import {
  WorkbenchTree,
  dropEmitProps,
} from "../shared/workbench/WorkbenchTree.js";
import { WorkbenchTreeContext } from "../shared/workbench/WorkbenchTreeContext.js";
import { deepMatch } from "../utils/deepMatch.js";
import treeStyleText from "./WorkbenchTree.shadow.css";
import actionStyleText from "../shared/workbench-mini-action-bar/WorkbenchMiniActionBar.shadow.css";
import "@next-core/theme";

function defaultGetCollapsedId(node: WorkbenchNodeData): string | number {
  return node.key;
}

const { defineElement, property, event } = createDecorators();

/**
 * 工作台树形组件，支持搜索、拖拽排序、折叠展开和节点操作
 * @insider
 */
@defineElement("visual-builder.workbench-tree", {
  styleTexts: [treeStyleText, actionStyleText],
})
class WorkbenchTreeElement extends ReactNextElement {
  /** 树节点数据列表 */
  @property({ attribute: false })
  accessor nodes: WorkbenchNodeData[];

  /** 节点操作按钮配置列表 */
  @property({ attribute: false })
  accessor actions: WorkbenchTreeAction[];

  /** 是否隐藏节点操作按钮 */
  @property({ type: Boolean })
  accessor actionsHidden: boolean;

  /** 无数据时显示的占位文本 */
  @property()
  accessor placeholder: string;

  /** 是否将节点名称转换为可读格式 */
  @property({ type: Boolean })
  accessor isTransformName: boolean;

  /** 搜索框占位文本 */
  @property()
  accessor searchPlaceholder: string;

  /** 是否隐藏搜索框 */
  @property({ type: Boolean })
  accessor noSearch: boolean;

  /** 当前激活节点的 key */
  @property({ attribute: false })
  accessor activeKey: string | number;

  /** 搜索时是否只显示匹配的节点 */
  @property({ type: Boolean })
  accessor showMatchedNodeOnly: boolean;

  /** 搜索时匹配的节点数据字段，"*" 表示匹配所有字段 */
  @property({ attribute: false })
  accessor matchNodeDataFields: string | string[];

  /** 始终显示操作按钮的节点数据条件 */
  @property({ attribute: false })
  accessor fixedActionsFor: Record<string, unknown> | Record<string, unknown>[];

  /** 是否启用节点折叠功能 */
  @property({ type: Boolean })
  accessor collapsible: boolean;

  /** 当前已折叠节点的 ID 列表 */
  @property({ attribute: false })
  accessor collapsedNodes: string[];

  /** 是否允许拖拽排序 */
  @property({ type: Boolean })
  accessor allowDrag: boolean;

  /** 是否允许拖拽到根节点位置 */
  @property({ type: Boolean })
  accessor allowDragToRoot: boolean;

  /** 是否允许拖拽到节点内部成为子节点 */
  @property({ type: Boolean })
  accessor allowDragToInside: boolean;

  /** 节点唯一标识字段名 */
  @property({ type: String })
  accessor nodeKey: string;

  /** 是否跳过节点点击时的通知 */
  @property({ type: Boolean })
  accessor skipNotify: boolean;

  /**
   * 点击节点操作按钮时触发
   * @detail { action: 操作标识, data: 节点数据 }
   */
  @event({ type: "action.click" })
  accessor #actionClickEvent!: EventEmitter<ActionClickDetail>;

  /**
   * 点击节点时触发
   * @detail 节点的 data 数据
   */
  @event({ type: "node.click" })
  accessor #nodeClickEvent: EventEmitter<unknown>;

  /**
   * 拖拽节点完成时触发
   * @detail 拖拽完成后的节点位置信息
   */
  @event({ type: "node.drop" })
  accessor #nodeDropEvent: EventEmitter<any>;

  /**
   * 右键点击节点时触发
   * @detail { active: true, node: 节点的 data 数据, x: 鼠标 X 坐标, y: 鼠标 Y 坐标 }
   */
  @event({ type: "context.menu" })
  accessor #nodeContextMenuEvent: EventEmitter<unknown>;

  /**
   * 节点折叠/展开状态变化时触发
   * @detail { nodeId: 节点 ID, collapsed: 是否已折叠 }
   */
  @event({ type: "node.toggle" })
  accessor #nodeToggleEvent: EventEmitter<{
    nodeId: string;
    collapsed: boolean;
  }>;

  #handleActionClick = (detail: ActionClickDetail): void => {
    this.#actionClickEvent.emit(detail);
  };

  #nodeClickFactory = (node: WorkbenchNodeData) => () => {
    this.#nodeClickEvent.emit(node.data);
  };

  #handleNodeDrop = (detail: dropEmitProps): void => {
    this.#nodeDropEvent.emit(detail);
  };

  #contextMenuFactory = (node: WorkbenchNodeData) => (e: React.MouseEvent) => {
    e.preventDefault();
    this.#nodeContextMenuEvent.emit({
      active: true,
      node: node?.data,
      x: e.clientX,
      y: e.clientY,
    });
  };

  #handleNodeToggle = (nodeId: string, collapsed: boolean): void => {
    this.#nodeToggleEvent.emit({ nodeId, collapsed });
  };

  render() {
    return (
      <WorkbenchActionsContext.Provider
        value={{
          actions: this.actions,
          actionsHidden: this.actionsHidden,
          onActionClick: this.#handleActionClick,
        }}
      >
        <WorkbenchTreeContext.Provider
          value={{
            activeKey: this.activeKey,
            basePaddingLeft: 5,
            showMatchedNodeOnly: this.showMatchedNodeOnly,
            isTransformName: this.isTransformName,
            fixedActionsFor: this.fixedActionsFor,
            nodeKey: this.nodeKey,
            collapsible: this.collapsible,
            collapsedNodes: this.collapsedNodes,
            getCollapsedId: defaultGetCollapsedId,
            onNodeToggle: this.#handleNodeToggle,
            skipNotify: this.skipNotify,
            clickFactory: this.#nodeClickFactory,
            contextMenuFactory: this.#contextMenuFactory,
            matchNode: (node, lowerTrimmedQuery) =>
              deepMatch(node.name, lowerTrimmedQuery) ||
              (!!this.matchNodeDataFields?.length &&
                deepMatch(
                  this.matchNodeDataFields === "*"
                    ? node.data
                    : pick(node.data, this.matchNodeDataFields),
                  lowerTrimmedQuery
                )),
          }}
        >
          <WorkbenchTree
            nodes={this.nodes}
            placeholder={this.placeholder}
            searchPlaceholder={this.searchPlaceholder}
            noSearch={this.noSearch}
            dropEmit={this.#handleNodeDrop}
            allowDrag={this.allowDrag}
            allowDragToInside={this.allowDragToInside}
            allowDragToRoot={this.allowDragToRoot}
          />
        </WorkbenchTreeContext.Provider>
      </WorkbenchActionsContext.Provider>
    );
  }
}

export { WorkbenchTreeElement };
