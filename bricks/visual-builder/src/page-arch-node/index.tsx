import React, { useCallback, useEffect, useRef, useState } from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import classNames from "classnames";
import styleText from "./styles.shadow.css";

const { defineElement, property, event } = createDecorators();

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");

const autoFocusedSets = new Set<string>();

export interface PageArchNodeProps {
  label?: string;
  type?: PageArchNodeType;
  active?: boolean;
  external?: ExtraNodeData;
  subNodes?: ExtraNodeData[];
  autoFocusOnce?: string;
  notSynced?: boolean;
  disableChildAppend?: boolean;
}

export interface ExtraNodeData {
  label: string;
  id: string;
}

export interface SubNodeContextMenuData extends ContextMenuDetail {
  node: ExtraNodeData;
}

export interface ContextMenuDetail {
  clientX: number;
  clientY: number;
}

export type PageArchNodeType = "page" | "board";

/**
 * Visual Builder 页面架构图节点，支持页面（page）和看板（board）两种类型，可内联编辑标签、追加子节点、显示外链和子节点
 */
export
@defineElement("visual-builder.page-arch-node", {
  styleTexts: [styleText],
})
class PageArchNode extends ReactNextElement implements PageArchNodeProps {
  /**
   * 节点标签文字，支持内联双击编辑
   */
  @property()
  accessor label: string | undefined;

  /**
   * 节点类型，"page" 渲染为页面缩略图样式（高 130px），"board" 渲染为列表图标样式（高 70px）
   */
  @property()
  accessor type: PageArchNodeType | undefined;

  /**
   * 外部链接节点数据，仅 type="page" 时显示，点击触发 external.click 事件
   */
  @property({ attribute: false })
  accessor external: ExtraNodeData | undefined;

  /**
   * 子节点列表，仅 type="page" 时显示，每个子节点可双击和右键操作
   */
  @property({ attribute: false })
  accessor subNodes: ExtraNodeData[] | undefined;

  /**
   * 是否为当前激活节点，仅控制 CSS 样式（render: false），不触发重新渲染
   */
  @property({ type: Boolean, render: false })
  accessor active: boolean | undefined;

  /**
   * 是否标记为未同步状态，仅控制 CSS 样式（render: false），不触发重新渲染
   */
  @property({ type: Boolean, render: false })
  accessor notSynced: boolean | undefined;

  /**
   * 是否禁用追加子节点按钮，仅控制 CSS 样式（render: false），不触发重新渲染
   */
  @property({ type: Boolean, render: false })
  accessor disableChildAppend: boolean | undefined;

  /**
   * 自动聚焦标识符，设置后节点首次挂载时会自动进入标签编辑模式，同一标识符只触发一次
   */
  @property()
  accessor autoFocusOnce: string | undefined;

  /**
   * @detail 当前标签是否正在编辑
   * @description 节点标签编辑状态变化时触发
   */
  @event({ type: "label.editing.change" })
  accessor #labelEditingChange: EventEmitter<boolean>;

  /**
   * @detail 编辑完成后的新标签文字
   * @description 节点标签编辑完成（失焦）后触发
   */
  @event({ type: "label.change" })
  accessor #labelChange: EventEmitter<string>;

  /**
   * @detail `void`
   * @description 点击节点主体区域时触发
   */
  @event({ type: "node.click" })
  accessor #nodeClick: EventEmitter<void>;

  /**
   * @detail `void`
   * @description 双击节点主体区域时触发
   */
  @event({ type: "node.dblclick" })
  accessor #nodeDoubleClick: EventEmitter<void>;

  /**
   * @detail `ContextMenuDetail` — { clientX: 鼠标 X 坐标, clientY: 鼠标 Y 坐标 }
   * @description 在节点上触发右键菜单时触发
   */
  @event({ type: "node.contextmenu" })
  accessor #nodeContextMenu: EventEmitter<ContextMenuDetail>;

  /**
   * @detail `void`
   * @description 点击节点的添加子节点按钮时触发
   */
  @event({ type: "child.append" })
  accessor #childAppend: EventEmitter<void>;

  /**
   * @detail `ExtraNodeData` — { id: 外链节点 ID, label: 外链节点标签 }
   * @description 点击节点的外链区域时触发
   */
  @event({ type: "external.click" })
  accessor #externalClick: EventEmitter<ExtraNodeData>;

  /**
   * @detail `ExtraNodeData` — { id: 子节点 ID, label: 子节点标签 }
   * @description 双击子节点时触发
   */
  @event({ type: "subNode.dblclick" })
  accessor #subNodeDoubleClick: EventEmitter<ExtraNodeData>;

  /**
   * @detail `SubNodeContextMenuData` — { node: { id: 子节点 ID, label: 子节点标签 }, clientX: 鼠标 X 坐标, clientY: 鼠标 Y 坐标 }
   * @description 在子节点上触发右键菜单时触发
   */
  @event({ type: "subNode.contextmenu" })
  accessor #subNodeContextMenu: EventEmitter<SubNodeContextMenuData>;

  #handleLabelEditingChange = (value: boolean) => {
    this.#labelEditingChange.emit(value);
  };

  #handleLabelChange = (value: string) => {
    this.#labelChange.emit(value);
  };

  #handleNodeClick = () => {
    this.#nodeClick.emit();
  };

  #handleNodeDoubleClick = () => {
    this.#nodeDoubleClick.emit();
  };

  #handleNodeContextMenu = (data: ContextMenuDetail) => {
    this.#nodeContextMenu.emit(data);
  };

  #handleChildAppend = () => {
    this.#childAppend.emit();
  };

  #handleExternalClick = (data: ExtraNodeData) => {
    this.#externalClick.emit(data);
  };

  #handleSubNodeDoubleClick = (data: ExtraNodeData) => {
    this.#subNodeDoubleClick.emit(data);
  };

  #handleSubNodeContextMenu = (data: SubNodeContextMenuData) => {
    this.#subNodeContextMenu.emit(data);
  };

  render() {
    return (
      <PageArchNodeComponent
        label={this.label}
        type={this.type}
        external={this.external}
        subNodes={this.subNodes}
        autoFocusOnce={this.autoFocusOnce}
        onLabelEditingChange={this.#handleLabelEditingChange}
        onLabelChange={this.#handleLabelChange}
        onNodeClick={this.#handleNodeClick}
        onNodeDoubleClick={this.#handleNodeDoubleClick}
        onNodeContextMenu={this.#handleNodeContextMenu}
        onChildAppend={this.#handleChildAppend}
        onExternalClick={this.#handleExternalClick}
        onSubNodeDoubleClick={this.#handleSubNodeDoubleClick}
        onSubNodeContextMenu={this.#handleSubNodeContextMenu}
      />
    );
  }
}

export interface PageArchNodeComponentProps extends PageArchNodeProps {
  onLabelEditingChange?(value: boolean): void;
  onLabelChange?(value: string): void;
  onNodeClick?(): void;
  onNodeDoubleClick?(): void;
  onNodeContextMenu?(data: ContextMenuDetail): void;
  onChildAppend?(): void;
  onExternalClick?(data: ExtraNodeData): void;
  onSubNodeDoubleClick?(data: ExtraNodeData): void;
  onSubNodeContextMenu?(data: SubNodeContextMenuData): void;
}

export function PageArchNodeComponent({
  label,
  type: _type,
  external,
  subNodes,
  autoFocusOnce,
  onLabelEditingChange,
  onLabelChange,
  onNodeClick,
  onNodeDoubleClick,
  onNodeContextMenu,
  onChildAppend,
  onExternalClick,
  onSubNodeDoubleClick,
  onSubNodeContextMenu,
}: PageArchNodeComponentProps) {
  const type = _type === "board" ? "board" : "page";
  const [currentLabel, setCurrentLabel] = useState(label);
  const [editingLabel, setEditingLabel] = useState(false);
  const editingLabelInitialized = useRef(false);
  const [shouldEmitLabelChange, setShouldEmitLabelChange] = useState(false);
  const labelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentLabel(label);
  }, [label]);

  const handleEditLabel = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLabel(true);
  }, []);

  useEffect(() => {
    if (autoFocusOnce && !autoFocusedSets.has(autoFocusOnce)) {
      autoFocusedSets.add(autoFocusOnce);
      setTimeout(() => {
        setEditingLabel(true);
      }, 1);
    }
  }, [autoFocusOnce]);

  useEffect(() => {
    if (editingLabel) {
      // Prevent scroll when focusing.
      // Otherwise the diagram svg may be clipped in Chrome.
      labelInputRef.current?.focus({ preventScroll: true });
      labelInputRef.current?.select();
    }
  }, [editingLabel]);

  useEffect(() => {
    if (editingLabelInitialized.current) {
      onLabelEditingChange?.(editingLabel);
    } else {
      editingLabelInitialized.current = true;
    }
  }, [editingLabel, onLabelEditingChange]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentLabel(event.target.value);
    },
    []
  );

  const handleInputKeydown = useCallback((event: React.KeyboardEvent) => {
    const key =
      event.key ||
      /* istanbul ignore next: compatibility */ event.keyCode ||
      /* istanbul ignore next: compatibility */ event.which;
    if (key === "Enter" || key === 13) {
      labelInputRef.current?.blur();
    }
  }, []);

  const handleInputBlur = useCallback(() => {
    setEditingLabel(false);
    setShouldEmitLabelChange(true);
  }, []);

  useEffect(() => {
    if (shouldEmitLabelChange) {
      onLabelChange?.(currentLabel);
      setShouldEmitLabelChange(false);
    }
  }, [currentLabel, onLabelChange, shouldEmitLabelChange]);

  const handleChildAppend = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChildAppend?.();
    },
    [onChildAppend]
  );

  const handleExternalClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onExternalClick?.(external);
    },
    [external, onExternalClick]
  );

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // 32 + 8
  const extraHeight = Math.max(0, Math.floor((subNodes?.length ?? 0) - 3)) * 38;

  return (
    <>
      <div
        className={classNames("node", type, { "editing-label": editingLabel })}
        style={{ height: type === "board" ? 70 : 130 + extraHeight }}
        onClick={onNodeClick}
        onDoubleClick={onNodeDoubleClick}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onNodeContextMenu?.({
            clientX: e.clientX,
            clientY: e.clientY,
          });
        }}
      >
        <input
          className="label-input"
          value={currentLabel}
          ref={labelInputRef}
          onChange={handleInputChange}
          onKeyDown={handleInputKeydown}
          onBlur={handleInputBlur}
          onDoubleClick={stopPropagation}
          onContextMenu={stopPropagation}
          onMouseDown={stopPropagation}
        />
        <div
          className="label"
          onDoubleClick={handleEditLabel}
          onMouseDown={stopPropagation}
        >
          {currentLabel}
        </div>
        {type === "board" ? (
          <div className="icon-container">
            <WrappedIcon lib="antd" icon="unordered-list" />
          </div>
        ) : (
          <div
            className="thumbnail-container"
            style={{
              height: 98 + extraHeight,
            }}
          >
            <div className="thumbnail-placeholder">
              <WrappedIcon lib="antd" icon="ellipsis" />
            </div>
            {external && (
              <div
                className="external"
                onClick={handleExternalClick}
                onDoubleClick={stopPropagation}
                onMouseDown={stopPropagation}
              >
                <WrappedIcon lib="antd" icon="desktop" />
                <span className="external-label">{external.label}</span>
              </div>
            )}
            {subNodes?.length ? (
              <div className="sub-nodes">
                {subNodes.map((subNode) => (
                  <SubNode
                    key={subNode.id}
                    subNode={subNode}
                    onSubNodeDoubleClick={onSubNodeDoubleClick}
                    onSubNodeContextMenu={onSubNodeContextMenu}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div
        className="add-button"
        role="button"
        onClick={handleChildAppend}
        onMouseDown={stopPropagation}
      >
        <WrappedIcon lib="fa" icon="plus" />
      </div>
    </>
  );
}

export interface SubNodeProps {
  subNode: ExtraNodeData;
  onSubNodeDoubleClick?(data: ExtraNodeData): void;
  onSubNodeContextMenu?(data: SubNodeContextMenuData): void;
}

function SubNode({
  subNode,
  onSubNodeDoubleClick,
  onSubNodeContextMenu,
}: SubNodeProps) {
  return (
    <WrappedTooltip key={subNode.id} content={subNode.label}>
      <div
        className="sub-node"
        onDoubleClick={(e) => {
          e.stopPropagation();
          onSubNodeDoubleClick?.(subNode);
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onSubNodeContextMenu?.({
            node: subNode,
            clientX: e.clientX,
            clientY: e.clientY,
          });
        }}
      >
        <div className="sub-node-skeleton-title"></div>
        <div className="sub-node-skeleton-content"></div>
        <div className="sub-node-skeleton-button"></div>
      </div>
    </WrappedTooltip>
  );
}
