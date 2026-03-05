---
tagName: eo-display-canvas
displayName: WrappedEoDisplayCanvas
description: 用于展示查看的画布构件，支持 manual、force、dagre 多种布局，可展示节点、边和装饰器，支持缩放、平移、激活目标高亮、淡化无关元素等功能。
category: diagram
source: "@next-bricks/diagram"
---

# eo-display-canvas

> 用于展示查看的画布构件，支持 manual、force、dagre 多种布局，可展示节点、边和装饰器，支持缩放、平移、激活目标高亮、淡化无关元素等功能。

## Props

| 属性                                | 类型                                | 必填 | 默认值                                   | 说明                                                                                                         |
| ----------------------------------- | ----------------------------------- | ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| cells                               | `InitialCell[] \| undefined`        | -    | -                                        | 画布中的单元格数据，包含节点（node）、边（edge）和装饰器（decorator）。                                      |
| layout                              | `LayoutType`                        | 是   | -                                        | 画布布局类型，支持 `manual`（手动定位）、`force`（力导向）、`dagre`（层次有向图）。                          |
| layoutOptions                       | `LayoutOptions \| undefined`        | -    | -                                        | 布局算法选项，根据 layout 类型不同，支持不同参数（如 dagre 的 ranksep/nodesep，force 的碰撞参数等）。        |
| autoSize                            | `AutoSize \| undefined`             | -    | -                                        | 是否自动计算节点尺寸，启用后画布会根据节点内容自动调整节点大小。                                             |
| defaultNodeSize                     | `SizeTuple`                         | 是   | `[DEFAULT_NODE_SIZE, DEFAULT_NODE_SIZE]` | 节点默认尺寸，格式为 `[width, height]`，在节点未指定尺寸时使用。                                             |
| defaultNodeBricks                   | `NodeBrickConf[] \| undefined`      | -    | -                                        | 节点默认砖块配置，指定渲染节点的自定义构件，可按节点类型匹配不同配置。                                       |
| degradedThreshold                   | `number \| undefined`               | -    | `500`                                    | 当节点数量达到或超过 `degradedThreshold` 时，节点将被降级展示。                                              |
| degradedNodeLabel                   | `string \| undefined`               | -    | `"<% DATA.node.id %>"`                   | 设置节点将降级展示时显示的名称。                                                                             |
| defaultEdgeLines                    | `EdgeLineConf[] \| undefined`       | -    | -                                        | 使用条件判断设置默认的边对应的连线。在 `if` 表达式中 `DATA` 为 `{ edge }`。                                  |
| activeTarget                        | `ActiveTarget \| null \| undefined` | -    | -                                        | 当前激活目标，可以是节点（`{ type: "node", id }`）或边（`{ type: "edge", id }`）等，为 null 表示无激活目标。 |
| fadeUnrelatedCells                  | `boolean \| undefined`              | -    | -                                        | 当鼠标悬浮到某节点上时，隐藏其他跟该节点无关的元素，高亮相关节点和边。                                       |
| zoomable                            | `boolean \| undefined`              | -    | `true`                                   | 是否允许通过鼠标滚轮或触控板捏合手势缩放画布，默认为 true。                                                  |
| scrollable                          | `boolean \| undefined`              | -    | `true`                                   | 是否允许通过滚轮平移画布（非捏合手势），默认为 true。                                                        |
| pannable                            | `boolean \| undefined`              | -    | `true`                                   | 是否允许通过鼠标拖拽平移画布，默认为 true。                                                                  |
| scaleRange                          | `RangeTuple \| undefined`           | -    | -                                        | 缩放比例范围，格式为 `[min, max]`，默认范围由内部常量决定。                                                  |
| hideZoomBar                         | `boolean \| undefined`              | -    | -                                        | 隐藏右下角放大缩小的控制栏。                                                                                 |
| autoCenterWhenCellsChange           | `boolean \| undefined`              | -    | -                                        | 每当 cells 改变时，重新自动居中。                                                                            |
| doNotResetActiveTargetForSelector   | `string \| undefined`               | -    | -                                        | 选择器，点击该选择器对应的元素时不重置 `activeTarget`。                                                      |
| doNotResetActiveTargetOutsideCanvas | `boolean \| undefined`              | -    | -                                        | 在画布外点击时不重置 `activeTarget`。                                                                        |
| extraStyleTexts                     | `string[] \| undefined`             | -    | -                                        | 注入到 Shadow DOM 的额外 CSS 样式文本列表。                                                                  |

## Events

| 事件                | detail                                                                                                        | 说明                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| activeTarget.change | `ActiveTarget \| null` — 当前激活目标，节点/边对象或 null                                                     | 激活目标变化时触发，当用户点击节点或边使其激活，或点击空白处取消激活时触发。 |
| cell.contextmenu    | `CellContextMenuDetail` — 右键菜单详情，包含 `{ cell: 对应的单元格, clientX: 鼠标X坐标, clientY: 鼠标Y坐标 }` | 用户右键点击节点或边时触发，常用于弹出上下文菜单。                           |
| cell.click          | `CellContextMenuDetail` — 点击详情，包含 `{ cell: 对应的单元格, clientX: 鼠标X坐标, clientY: 鼠标Y坐标 }`     | 用户左键点击节点或边时触发。                                                 |

## Methods

| 方法   | 参数         | 返回值 | 说明                                                   |
| ------ | ------------ | ------ | ------------------------------------------------------ |
| center | `() => void` | `void` | 将画布视图重置并居中，使所有单元格重新显示在视口中央。 |

## Examples

### Basic

展示基本的手动布局画布，包含节点、边、装饰器，并支持右键菜单和激活高亮。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              id: "area-1",
              decorator: "area",
              view: {
                x: 10,
                y: 20,
                width: 400,
                height: 300,
              },
            },
            {
              type: "decorator",
              id: "container-1",
              decorator: "container",
              view: {
               x: 50,
                y: 400,
                width: 280,
                height: 120,
                direction: "top",
                text: " 上层服务"
              },
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
              data: {
                virtual: false,
                showStartArrow: false,
                strokeColor:"red",
                strokeWidth: 5,
              }
            },
            {
              type: "edge",
              source: "X",
              target: "W",
              data: {
                virtual: false,
                showStartArrow: true,
                strokeColor:"pink",
                animate:{
                  useAnimate: true,
                  duration: 4
                }
              }
            },
            {
              type: "edge",
              source: "X",
              target: "Z",
              data: {
                virtual: true,
                showStartArrow: true,
                strokeColor:"blue",
                animate:{
                  useAnimate: true
                }
              }
            },
            {
              type: "edge",
              source: "W",
              target: "Z",
              view: {
                entryPosition: { x: 0, y: 0.5 },
                exitPosition: {x: 0.5, y: 0}
              }
            }
          ].concat(
            ["X", "Y", "Z", "W"].map((id) => ({
              type: "node",
              id,
              containerId: ["X","Y","Z"].includes(id)?"container-1":undefined,
              data: {
                name: `Node ${id}`,
              },
              view: {
                x: Math.round(
                  id === "X"
                    ? 200 + Math.random() * 200
                    : id === "Y"
                    ? Math.random() * 300
                    : 300 + Math.random() * 300
                ),
                y: (id === "X" ? 0 : 300) + Math.round((Math.random() * 200)),
                width: 60,
                height: 60,
              }
            }))
          ).concat([
            {
              type: "decorator",
              id: "text-1",
              decorator: "text",
              view: {
                x: 100,
                y: 120,
                width: 100,
                height: 20,
                text: "Hello!"
              },
            },
          ])
        %>
    - name: activeTarget
    - name: targetCell
  children:
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-display-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        CTX.activeTarget?.type === "node" && CTX.activeTarget.id === DATA.node.id
                          ? "highlighted"
                          : "default"
                      %>
            defaultEdgeLines:
              - if: true
                dashed: <% DATA.edge?.data?.virtual %>
                strokeColor: <% DATA.edge?.data?.strokeColor %>
                showStartArrow: <% DATA.edge?.data?.showStartArrow %>
                strokeWidth: <% DATA.edge?.data?.strokeWidth %>
                animate: <% DATA.edge?.data?.animate %>
                showStartArrow: true
                markers:
                  - placement: end
                    type: circle
                  - placement: start
                    type: arrow
            cells: <% CTX.initialCells %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - targetCell
                  - <% EVENT.detail.cell %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
```

### Force layout

展示 force（力导向）布局画布，节点位置由物理引擎自动计算。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              id: "area-1",
              decorator: "area",
              view: {
                x: 10,
                y: 20,
                width: 400,
                height: 300,
              },
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
            },
            {
              type: "edge",
              source: "X",
              target: "Z",
              data: {
                virtual: true,
              }
            },
          ].concat(
            ["X", "Y", "Z", "W"].map((id) => ({
              type: "node",
              id,
              data: {
                name: `Node ${id}`,
              },
              view: {
                width: 60,
                height: 60,
              }
            }))
          ).concat([
            {
              type: "decorator",
              id: "text-1",
              decorator: "text",
              view: {
                x: 100,
                y: 120,
                width: 100,
                height: 20,
                text: "Hello!"
              },
            },
          ])
        %>
    - name: activeTarget
    - name: targetCell
  children:
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-display-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            layout: force
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        CTX.activeTarget?.type === "node" && CTX.activeTarget.id === DATA.node.id
                          ? "highlighted"
                          : "default"
                      %>
            defaultEdgeLines:
              - if: <% DATA.edge.data?.virtual %>
                dashed: true
            cells: <% CTX.initialCells %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - targetCell
                  - <% EVENT.detail.cell %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
```

### Dagre layout

展示 dagre（层次有向图）布局画布，节点按层级排列，支持折线连线和自定义连线样式。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              id: "area-1",
              decorator: "area",
              view: {
                x: 10,
                y: 20,
                width: 400,
                height: 300,
              },
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
              view: {
                type: "polyline"
              }
            },
            {
              type: "edge",
              source: "X",
              target: "Z",
              data: {
                virtual: true,
              }
            },
            {
              type: "edge",
              source: "Z",
              target: "W",
            },
          ].concat(
            ["X", "Y", "Z", "W"].map((id) => ({
              type: "node",
              id,
              data: {
                name: `Node ${id}`,
              },
              view: {
                width: 60,
                height: 60,
              }
            }))
          )
        %>
    - name: activeTarget
    - name: targetCell
  children:
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-display-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            layout: dagre
            layoutOptions:
              ranksep: 80
              nodesep: 80
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        CTX.activeTarget?.type === "node" && CTX.activeTarget.id === DATA.node.id
                          ? "highlighted"
                          : "default"
                      %>
            defaultEdgeLines:
              - dashed: <% !!DATA.edge.data?.virtual %>
                strokeColor: var(--palette-blue-6)
                overrides:
                  active:
                    strokeWidth: <% 2 * (DATA.edge?.data?.strokeWidth ?? 1) %>
                    strokeColor: cyan
                  activeRelated:
                    strokeWidth: <% 2 * (DATA.edge?.data?.strokeWidth ?? 1) %>
                    motion:
                      shape: '<% DATA.edge.data?.virtual ? "dot" : "triangle" %>'
            cells: <% CTX.initialCells %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - targetCell
                  - <% EVENT.detail.cell %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
```

### Degraded diagram

展示节点数量超过降级阈值时的降级模式，节点以简单 SVG 形式渲染以提升性能。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          ((...seeds) => seeds.map((seed) => ({
            type: "node",
            id: seed,
            data: {
              name: seed,
            },
          })))(
            ...(
              new Array(500).fill(null).map((_, i) => String(i))
            )
          )
        %>
    - name: activeTarget
    - name: targetCell
  children:
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-display-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            layout: force
            defaultNodeSize: [60, 60]
            degradedThreshold: 500
            degradedNodeLabel: <% DATA.node.id %>
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        CTX.activeTarget?.type === "node" && CTX.activeTarget.id === DATA.node.id
                          ? "highlighted"
                          : "default"
                      %>
            defaultEdgeLines:
              - if: true
                dashed: <% DATA.edge?.data?.virtual %>
                strokeColor: <% DATA.edge?.data?.strokeColor %>
                showStartArrow: <% DATA.edge?.data?.showStartArrow %>
                strokeWidth: <% DATA.edge?.data?.strokeWidth %>
                animate: <% DATA.edge?.data?.animate %>
            cells: <% CTX.initialCells %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - targetCell
                  - <% EVENT.detail.cell %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
```
