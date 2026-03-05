// istanbul ignore file: experimental only
import React, { useCallback } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import type { PositionTuple } from "../diagram/interfaces";
import styleText from "./styles.shadow.css";
import type { DecoratorType } from "../draw-canvas/interfaces";

const { defineElement, property, event } = createDecorators();

type ExperimentalUsage = "library" | "dragging" | "default";
type NodeStatus = "highlighted" | "faded" | "default";

export interface ExperimentalNodeProps {
  usage?: ExperimentalUsage;
  status?: NodeStatus;
}

export interface ExperimentalNodeEventsMap {
  "drag.start": CustomEvent<PositionTuple>;
  "drag.move": CustomEvent<PositionTuple>;
  "drag.end": CustomEvent<PositionTuple>;
}

export interface ExperimentalNodeEventsMapping {
  onDragStart: "drag.start";
  onDragMove: "drag.move";
  onDragEnd: "drag.end";
}

/**
 * @description 实验性图表节点构件，支持从素材库拖拽到画布（`usage: "library"`）和画布内节点渲染（`usage: "default"`），支持高亮、淡化等状态样式，常配合 `eo-draw-canvas` 和 `eo-display-canvas` 使用。
 * @category diagram
 */
export
@defineElement("diagram.experimental-node", {
  styleTexts: [styleText],
})
class ExperimentalNode
  extends ReactNextElement
  implements ExperimentalNodeProps
{
  /**
   * @description 节点使用场景：`library` 表示素材库中的拖拽源，`dragging` 表示正在拖拽中的幽灵节点，`default` 表示画布内正常渲染的节点。
   */
  @property()
  accessor usage: ExperimentalUsage | undefined;

  /**
   * @description 节点状态，影响外观样式：`highlighted` 高亮、`faded` 淡化、`default` 默认（使用 `render: false` 仅更新属性不触发重渲染）。
   */
  // 最终节点应该统一实现这个字段，保持类型一致
  @property({ type: String, render: false })
  accessor status: NodeStatus | undefined;

  /**
   * @description 装饰器类型，用于渲染不同类型的装饰器外观（area、container、text 等），与 `usage: "dragging"` 配合使用。
   */
  // 最终节点应该统一实现这个字段，保持类型一致
  @property({ type: String })
  accessor decorator: DecoratorType | undefined;

  /**
   * @detail `PositionTuple` — 拖拽开始时的鼠标坐标 `[clientX, clientY]`
   * @description 在 `usage: "library"` 模式下，用户开始拖拽节点时触发（移动距离超过阈值后才触发）。
   */
  @event({ type: "drag.start" })
  accessor #dragStartEvent!: EventEmitter<PositionTuple>;

  #handleDragStart = (position: PositionTuple) => {
    this.#dragStartEvent.emit(position);
  };

  /**
   * @detail `PositionTuple` — 拖拽过程中的当前鼠标坐标 `[clientX, clientY]`
   * @description 在 `usage: "library"` 模式下，用户拖拽节点过程中持续触发，可用于更新幽灵节点位置。
   */
  @event({ type: "drag.move" })
  accessor #dragMoveEvent!: EventEmitter<PositionTuple>;

  #handleDragMove = (position: PositionTuple) => {
    this.#dragMoveEvent.emit(position);
  };

  /**
   * @detail `PositionTuple` — 拖拽结束时的鼠标坐标 `[clientX, clientY]`
   * @description 在 `usage: "library"` 模式下，用户释放鼠标结束拖拽时触发，可通过 `dropNode` 或 `dropDecorator` 方法将节点添加到画布。
   */
  @event({ type: "drag.end" })
  accessor #dragEndEvent!: EventEmitter<PositionTuple>;

  #handleDragEnd = (position: PositionTuple) => {
    this.#dragEndEvent.emit(position);
  };

  render() {
    return (
      <ExperimentalNodeComponent
        usage={this.usage}
        onDragStart={this.#handleDragStart}
        onDragMove={this.#handleDragMove}
        onDragEnd={this.#handleDragEnd}
      />
    );
  }
}

export interface ExperimentalNodeComponentProps extends ExperimentalNodeProps {
  onDragStart?(position: PositionTuple): void;
  onDragMove?(position: PositionTuple): void;
  onDragEnd?(position: PositionTuple): void;
}

export function ExperimentalNodeComponent({
  usage,
  onDragStart,
  onDragMove,
  onDragEnd,
}: ExperimentalNodeComponentProps) {
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (usage !== "library") {
        return;
      }
      event.stopPropagation();
      event.preventDefault();
      const from: PositionTuple = [event.clientX, event.clientY];
      let moved = false;
      const onMouseMove = (e: MouseEvent) => {
        if (!moved) {
          moved = (e.clientX - from[0]) ** 2 + (e.clientY - from[1]) ** 2 >= 9;
          if (moved) {
            onDragStart?.([e.clientX, e.clientY]);
          }
        }
        if (moved) {
          onDragMove?.([e.clientX, e.clientY]);
        }
      };
      const onMouseUp = (e: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        if (moved) {
          onDragEnd?.([e.clientX, e.clientY]);
        }
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [onDragEnd, onDragMove, onDragStart, usage]
  );

  return (
    <div onMouseDown={handleMouseDown}>
      <slot />
    </div>
  );
}
