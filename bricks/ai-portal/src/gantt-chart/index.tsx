import React, { createContext, useContext, useMemo, useState } from "react";
import classNames from "classnames";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import type { GanttNode, Timing } from "./interfaces.js";
import { countNodes, processTimeline } from "./utils.js";
import { getStateIcon } from "./getStateIcon.js";
import { GanttBar } from "./GanttBar.js";
import {
  BAR_HEIGHT,
  CONTAINER_BAR_HEIGHT,
  INDENT_SIZE,
  LABEL_WIDTH,
} from "./constants.js";

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const TimelineContext = createContext<TimelineContextValue | null>(null);

const { defineElement, property, event } = createDecorators();

export interface GanttChartProps {
  chartTitle?: string;
  nodes?: GanttNode[];
}

/**
 * 构件 `ai-portal.gantt-chart`
 */
export
@defineElement("ai-portal.gantt-chart", {
  styleTexts: [styleText],
})
class GanttChart extends ReactNextElement implements GanttChartProps {
  @property()
  accessor chartTitle: string | undefined;

  @property({ attribute: false })
  accessor nodes: GanttNode[] | undefined;

  @event({ type: "node.click" })
  accessor #nodeClickEvent!: EventEmitter<GanttNode>;

  #handleNodeClick = (node: GanttNode) => {
    this.#nodeClickEvent.emit(node);
  };

  @event({ type: "fullscreen.click" })
  accessor #fullscreenClickEvent!: EventEmitter<void>;

  #handleFullscreenClick = () => {
    this.#fullscreenClickEvent.emit();
  };

  render() {
    return (
      <GanttChartComponent
        chartTitle={this.chartTitle}
        nodes={this.nodes}
        onNodeClick={this.#handleNodeClick}
        onFullscreenClick={this.#handleFullscreenClick}
      />
    );
  }
}

interface GanttChartComponentProps extends GanttChartProps {
  onNodeClick(node: GanttNode): void;
  onFullscreenClick(): void;
}

interface TimelineContextValue {
  duration: number;
  timeline: Map<GanttNode, Timing>;
  collapsedNodes: Set<GanttNode> | null;
  setCollapsedNodes: React.Dispatch<
    React.SetStateAction<Set<GanttNode> | null>
  >;
  onNodeClick(node: GanttNode): void;
}

function GanttChartComponent({
  chartTitle,
  nodes,
  onNodeClick,
  onFullscreenClick,
}: GanttChartComponentProps) {
  const [collapsedNodes, setCollapsedNodes] =
    React.useState<Set<GanttNode> | null>(null);
  const timeline = useMemo(() => processTimeline(nodes), [nodes]);
  const timelineContext = useMemo(
    () => ({
      ...timeline,
      collapsedNodes,
      setCollapsedNodes,
      onNodeClick,
    }),
    [timeline, collapsedNodes, onNodeClick]
  );
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TimelineContext.Provider value={timelineContext}>
      <div className="container">
        <div className="heading">
          <div className="title">{chartTitle}</div>
          <div className="toolbar">
            <button className="button" onClick={onFullscreenClick}>
              <WrappedIcon lib="easyops" icon="expand" />
              {t(K.FULLSCREEN)}
            </button>
            <button
              className={classNames("button", { collapsed })}
              onClick={() => {
                setCollapsed((prev) => !prev);
              }}
            >
              <WrappedIcon lib="lucide" icon="chevron-up" />
              {collapsed ? t(K.EXPAND) : t(K.COLLAPSE)}
            </button>
          </div>
        </div>
        {!collapsed && <GanttChartTree nodes={nodes} level={0} />}
      </div>
    </TimelineContext.Provider>
  );
}

interface GanttChartTreeProps {
  nodes?: GanttNode[];
  level: number;
}

function GanttChartTree({ nodes, level }: GanttChartTreeProps) {
  return (
    <ul className="tree">
      {nodes?.map((node, index, list) => (
        <GanttChartNode
          key={index}
          node={node}
          level={level}
          isLast={index === list.length - 1}
        />
      ))}
    </ul>
  );
}

export interface GanttChartNodeProps {
  node: GanttNode;
  level: number;
  isLast: boolean;
}

export function GanttChartNode({ node, level, isLast }: GanttChartNodeProps) {
  const { duration, timeline, collapsedNodes, setCollapsedNodes, onNodeClick } =
    useContext(TimelineContext)!;
  const { start, end } = timeline.get(node)!;
  const isFirstLevel = level === 0;
  const { icon, className } = getStateIcon(node.state, isFirstLevel);
  const collapsible = !!node.children?.length;
  const isCollapsed = collapsible && (collapsedNodes?.has(node) ?? false);
  const showChildren = collapsible && !isCollapsed;

  const lineBottom = useMemo(() => {
    let count = 0;
    if (isLast && showChildren) {
      const lastChild = node.children![node.children!.length - 1];
      count = countNodes(lastChild, collapsedNodes);
    }
    return count * 32 - (isFirstLevel ? 18 : isLast ? 20 : 8);
  }, [collapsedNodes, showChildren, isFirstLevel, isLast, node.children]);

  return (
    <li className={isFirstLevel ? "root" : undefined}>
      {showChildren && (
        <div
          className="line"
          style={{ left: level * INDENT_SIZE + 11, bottom: lineBottom }}
        />
      )}
      <div
        className={classNames("node", { collapsible })}
        style={{ marginLeft: level * INDENT_SIZE }}
        onClick={() => {
          onNodeClick(node);
        }}
      >
        <div
          className="label"
          style={{ width: LABEL_WIDTH - level * INDENT_SIZE }}
        >
          <WrappedIcon className={classNames("icon", className)} {...icon} />
          {collapsible && (
            <WrappedIcon
              className={classNames("collapse", { collapsed: isCollapsed })}
              lib={isFirstLevel ? "fa" : "lucide"}
              prefix="fas"
              icon="circle-chevron-down"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsedNodes((prev) => {
                  if (prev?.has(node)) {
                    const newSet = new Set(prev);
                    newSet.delete(node);
                    if (newSet.size === 0) {
                      return null;
                    }
                    return newSet;
                  }
                  const newSet = new Set(prev ?? []);
                  newSet.add(node);
                  return newSet;
                });
              }}
            />
          )}
          <span className="name">{node.name}</span>
        </div>
        <div className="chart">
          <div
            className={classNames(
              "bar",
              { "container-bar": showChildren },
              className
            )}
            style={{
              top: showChildren ? 5 : 7,
              left: `${(start / duration) * 100}%`,
              width: `${((end - start) / duration) * 100}%`,
              height: showChildren ? CONTAINER_BAR_HEIGHT : BAR_HEIGHT,
            }}
          >
            {showChildren && <GanttBar />}
          </div>
        </div>
      </div>
      {showChildren && (
        <GanttChartTree nodes={node.children} level={level + 1} />
      )}
    </li>
  );
}
