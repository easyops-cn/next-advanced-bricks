---
tagName: diagram.experimental-node
displayName: WrappedDiagramExperimentalNode
description: 实验性图表节点构件，支持从素材库拖拽到画布（`usage: "library"`）和画布内节点渲染（`usage: "default"`），支持高亮、淡化等状态样式，常配合 `eo-draw-canvas` 和 `eo-display-canvas` 使用。
category: diagram
source: "@next-bricks/diagram"
---

# diagram.experimental-node

> 实验性图表节点构件，支持从素材库拖拽到画布（`usage: "library"`）和画布内节点渲染（`usage: "default"`），支持高亮、淡化等状态样式，常配合 `eo-draw-canvas` 和 `eo-display-canvas` 使用。

## Props

| 属性      | 类型                             | 必填 | 默认值 | 说明                                                                                                                      |
| --------- | -------------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| usage     | `ExperimentalUsage \| undefined` | -    | -      | 节点使用场景：`library` 表示素材库中的拖拽源，`dragging` 表示正在拖拽中的幽灵节点，`default` 表示画布内正常渲染的节点。   |
| status    | `NodeStatus \| undefined`        | -    | -      | 节点状态，影响外观样式：`highlighted` 高亮、`faded` 淡化、`default` 默认（使用 `render: false` 仅更新属性不触发重渲染）。 |
| decorator | `DecoratorType \| undefined`     | -    | -      | 装饰器类型，用于渲染不同类型的装饰器外观（area、container、text 等），与 `usage: "dragging"` 配合使用。                   |

## Events

| 事件       | detail                                                          | 说明                                                                                                                  |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| drag.start | `PositionTuple` — 拖拽开始时的鼠标坐标 `[clientX, clientY]`     | 在 `usage: "library"` 模式下，用户开始拖拽节点时触发（移动距离超过阈值后才触发）。                                    |
| drag.move  | `PositionTuple` — 拖拽过程中的当前鼠标坐标 `[clientX, clientY]` | 在 `usage: "library"` 模式下，用户拖拽节点过程中持续触发，可用于更新幽灵节点位置。                                    |
| drag.end   | `PositionTuple` — 拖拽结束时的鼠标坐标 `[clientX, clientY]`     | 在 `usage: "library"` 模式下，用户释放鼠标结束拖拽时触发，可通过 `dropNode` 或 `dropDecorator` 方法将节点添加到画布。 |

## Examples

### Basic

展示节点在画布内渲染的基本用法，使用 `status` 属性控制节点高亮状态。

```yaml preview
brick: diagram.experimental-node
properties:
  status: default
children:
  - brick: span
    properties:
      textContent: Node A
```

### Library Usage

展示素材库中的可拖拽节点，通过 `drag.start`、`drag.move`、`drag.end` 事件配合 `eo-draw-canvas` 实现拖拽放置。

```yaml preview minHeight="400px"
- brick: div
  properties:
    style:
      display: flex
      gap: 1em
  context:
    - name: dragging
  children:
    - brick: div
      properties:
        style:
          width: 150px
          padding: 1em
          border-right: 1px solid var(--palette-gray-4)
      children:
        - brick: diagram.experimental-node
          properties:
            usage: library
            textContent: Node A
          events:
            drag.start:
              action: context.replace
              args:
                - dragging
                - position: <% EVENT.detail %>
                  label: Node A
            drag.move:
              action: context.replace
              args:
                - dragging
                - position: <% EVENT.detail %>
                  label: Node A
            drag.end:
              - action: context.replace
                args:
                  - dragging
                  - null
              - target: eo-draw-canvas
                method: dropNode
                args:
                  - position: <% EVENT.detail %>
                    id: node-a
                    data:
                      name: Node A
    - brick: eo-draw-canvas
      properties:
        style:
          flex: 1
          height: 400px
        layout: manual
        defaultNodeSize: [80, 40]
        defaultNodeBricks:
          - useBrick:
              brick: diagram.experimental-node
              properties:
                textContent: <% DATA.node.data.name %>
                status: default
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: <% CTX.dragging?.label %>
    hidden: <% !CTX.dragging %>
    style: |
      <%=
        CTX.dragging ? {
          position: fixed,
          left: `${CTX.dragging.position[0]}px`,
          top: `${CTX.dragging.position[1]}px`,
          pointerEvents: none
        } : {}
      %>
```

### Status States

展示节点不同状态下的外观效果。

```yaml preview
brick: div
properties:
  style:
    display: flex
    gap: 1em
    padding: 1em
children:
  - brick: diagram.experimental-node
    properties:
      status: default
    children:
      - brick: span
        properties:
          textContent: Default
  - brick: diagram.experimental-node
    properties:
      status: highlighted
    children:
      - brick: span
        properties:
          textContent: Highlighted
  - brick: diagram.experimental-node
    properties:
      status: faded
    children:
      - brick: span
        properties:
          textContent: Faded
```
