---
tagName: diagram.experimental-node
displayName: WrappedDiagramExperimentalNode
description: 实验性图表节点构件，支持从素材库拖拽到画布（`usage: "library"`）和画布内节点渲染（`usage: "default"`），支持高亮、淡化等状态样式，常配合 `eo-draw-canvas` 和 `eo-display-canvas` 使用。
category: diagram
source: "@next-bricks/diagram"
---

# WrappedDiagramExperimentalNode

> 实验性图表节点构件，支持从素材库拖拽到画布（`usage: "library"`）和画布内节点渲染（`usage: "default"`），支持高亮、淡化等状态样式，常配合 `eo-draw-canvas` 和 `eo-display-canvas` 使用。

## 导入

```tsx
import { WrappedDiagramExperimentalNode } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型                                      | 必填 | 默认值 | 说明                                                                                                                      |
| ----------- | ----------------------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| usage       | `ExperimentalUsage \| undefined`          | -    | -      | 节点使用场景：`library` 表示素材库中的拖拽源，`dragging` 表示正在拖拽中的幽灵节点，`default` 表示画布内正常渲染的节点。   |
| status      | `NodeStatus \| undefined`                 | -    | -      | 节点状态，影响外观样式：`highlighted` 高亮、`faded` 淡化、`default` 默认（使用 `render: false` 仅更新属性不触发重渲染）。 |
| decorator   | `DecoratorType \| undefined`              | -    | -      | 装饰器类型，用于渲染不同类型的装饰器外观（area、container、text 等），与 `usage: "dragging"` 配合使用。                   |
| onDragStart | `(e: CustomEvent<PositionTuple>) => void` | -    | -      | 在 `usage: "library"` 模式下，用户开始拖拽节点时触发。                                                                    |
| onDragMove  | `(e: CustomEvent<PositionTuple>) => void` | -    | -      | 在 `usage: "library"` 模式下，用户拖拽节点过程中持续触发。                                                                |
| onDragEnd   | `(e: CustomEvent<PositionTuple>) => void` | -    | -      | 在 `usage: "library"` 模式下，用户释放鼠标结束拖拽时触发。                                                                |

## Events

| 事件        | detail                                                          | 说明                                                                                                                  |
| ----------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| onDragStart | `PositionTuple` — 拖拽开始时的鼠标坐标 `[clientX, clientY]`     | 在 `usage: "library"` 模式下，用户开始拖拽节点时触发（移动距离超过阈值后才触发）。                                    |
| onDragMove  | `PositionTuple` — 拖拽过程中的当前鼠标坐标 `[clientX, clientY]` | 在 `usage: "library"` 模式下，用户拖拽节点过程中持续触发，可用于更新幽灵节点位置。                                    |
| onDragEnd   | `PositionTuple` — 拖拽结束时的鼠标坐标 `[clientX, clientY]`     | 在 `usage: "library"` 模式下，用户释放鼠标结束拖拽时触发，可通过 `dropNode` 或 `dropDecorator` 方法将节点添加到画布。 |

## Examples

### Basic

展示节点在画布内渲染的基本用法，使用 `status` 属性控制节点高亮状态。

```tsx
import { WrappedDiagramExperimentalNode } from "@easyops/wrapped-components";

function BasicNode() {
  return (
    <WrappedDiagramExperimentalNode status="default">
      <span>Node A</span>
    </WrappedDiagramExperimentalNode>
  );
}
```

### Library Usage

展示素材库中的可拖拽节点，通过 `onDragStart`、`onDragMove`、`onDragEnd` 事件配合 `WrappedEoDrawCanvas` 实现拖拽放置。

```tsx
import { useState, useRef } from "react";
import {
  WrappedDiagramExperimentalNode,
  WrappedEoDrawCanvas,
} from "@easyops/wrapped-components";

function LibraryNode() {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const handleDragStart = (e) => {
    setDragging({ position: e.detail, label: "Node A" });
  };

  const handleDragMove = (e) => {
    setDragging((prev) => (prev ? { ...prev, position: e.detail } : null));
  };

  const handleDragEnd = async (e) => {
    setDragging(null);
    await canvasRef.current?.dropNode({
      position: e.detail,
      id: "node-a",
      data: { name: "Node A" },
    });
  };

  return (
    <div style={{ display: "flex", gap: "1em" }}>
      <div style={{ width: 150, padding: "1em" }}>
        <WrappedDiagramExperimentalNode
          usage="library"
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <span>Node A</span>
        </WrappedDiagramExperimentalNode>
      </div>
      <WrappedEoDrawCanvas
        ref={canvasRef}
        style={{ flex: 1, height: 400 }}
        layout="manual"
        defaultNodeSize={[80, 40]}
        defaultNodeBricks={[
          {
            useBrick: {
              brick: "diagram.experimental-node",
              properties: {
                textContent: "<% DATA.node.data.name %>",
                status: "default",
              },
            },
          },
        ]}
      />
      {dragging && (
        <WrappedDiagramExperimentalNode
          usage="dragging"
          style={{
            position: "fixed",
            left: dragging.position[0],
            top: dragging.position[1],
            pointerEvents: "none",
          }}
        >
          <span>{dragging.label}</span>
        </WrappedDiagramExperimentalNode>
      )}
    </div>
  );
}
```

### Status States

展示节点不同状态下的外观效果。

```tsx
import { WrappedDiagramExperimentalNode } from "@easyops/wrapped-components";

function NodeStatusDemo() {
  return (
    <div style={{ display: "flex", gap: "1em", padding: "1em" }}>
      <WrappedDiagramExperimentalNode status="default">
        <span>Default</span>
      </WrappedDiagramExperimentalNode>
      <WrappedDiagramExperimentalNode status="highlighted">
        <span>Highlighted</span>
      </WrappedDiagramExperimentalNode>
      <WrappedDiagramExperimentalNode status="faded">
        <span>Faded</span>
      </WrappedDiagramExperimentalNode>
    </div>
  );
}
```
