---
tagName: eo-draw-canvas
displayName: WrappedEoDrawCanvas
description: "用于手工绘图的画布构件，支持节点拖放、连线绘制、元素移动/缩放/删除等交互操作，配合展示画布（eo-display-canvas）使用。"
category: diagram
source: "@next-bricks/diagram"
---

# eo-draw-canvas

> 用于手工绘图的画布构件，支持节点拖放、连线绘制、元素移动/缩放/删除等交互操作，配合展示画布（eo-display-canvas）使用。

## Props

| 属性                                | 类型                           | 必填 | 默认值     | 说明                                                                                                                                                      |
| ----------------------------------- | ------------------------------ | ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cells                               | `InitialCell[]`                | -    | -          | 初始化画布单元格数据，包含节点（node）、边（edge）和装饰器（decorator）。仅当初始化时使用，渲染后重新设置 `cells` 将无效，请使用 `updateCells` 方法代替。 |
| layout                              | `LayoutType`                   | ✅   | -          | 画布布局类型，支持 `manual`（手动定位）、`force`（力导向）、`dagre`（层次有向图）。                                                                       |
| layoutOptions                       | `LayoutOptions`                | -    | -          | 布局算法选项，根据 layout 类型不同，支持不同参数（如 dagre 的 ranksep/nodesep 等）。                                                                      |
| defaultNodeSize                     | `SizeTuple`                    | -    | `[20, 20]` | 节点默认尺寸，格式为 `[width, height]`，在节点未指定尺寸时使用。                                                                                          |
| defaultNodeBricks                   | `NodeBrickConf[]`              | -    | -          | 节点默认砖块配置，指定渲染节点的自定义构件，可按节点类型匹配不同配置。                                                                                    |
| degradedThreshold                   | `number`                       | -    | -          | 当节点数量达到或超过 `degradedThreshold` 时，节点将被降级展示。                                                                                           |
| degradedNodeLabel                   | `string`                       | -    | -          | 设置节点将降级展示时显示的名称。                                                                                                                          |
| defaultEdgeLines                    | `EdgeLineConf[]`               | -    | -          | 使用条件判断设置默认的边对应的连线。在 `if` 表达式中 `DATA` 为 `{ edge }`。                                                                               |
| activeTarget                        | `ActiveTarget \| null`         | -    | -          | 当前激活目标，可以是节点、边或装饰器，为 null 表示无激活目标。                                                                                            |
| fadeUnrelatedCells                  | `boolean`                      | -    | -          | 当 `activeTarget` 不为 `null` 时，隐藏其他跟该 `activeTarget` 无关的元素，高亮相关节点和边。                                                              |
| zoomable                            | `boolean`                      | -    | `true`     | 是否允许通过鼠标滚轮或触控板捏合手势缩放画布，默认为 true。                                                                                               |
| scrollable                          | `boolean`                      | -    | `true`     | 是否允许通过滚轮平移画布（非捏合手势），默认为 true。                                                                                                     |
| pannable                            | `boolean`                      | -    | `true`     | 是否允许通过鼠标拖拽平移画布，默认为 true。                                                                                                               |
| allowEdgeToArea                     | `boolean`                      | -    | `false`    | 是否允许将边连接到区域（area）装饰器，默认为 false。                                                                                                      |
| dragBehavior                        | `DragBehavior`                 | -    | -          | 按住鼠标拖动时的行为：`none`（无）、`lasso`（绘制选区）、`grab`（拖动画布）。                                                                             |
| ctrlDragBehavior                    | `CtrlDragBehavior`             | -    | -          | 按住 ctrl 键并按住鼠标拖动时的行为：`none`（无）、`grab`（拖动画布）。                                                                                    |
| scaleRange                          | `RangeTuple`                   | -    | -          | 缩放比例范围，格式为 `[min, max]`，默认范围由内部常量决定。                                                                                               |
| lineSettings                        | `LineSettings`                 | -    | -          | 连线设置，包含连线类型、箭头等属性，用于新建连线时的默认样式。                                                                                            |
| lineConnector                       | `LineConnecterConf \| boolean` | -    | -          | 连线连接器配置，设置为 `true` 或配置对象以启用智能连线功能，允许从节点边缘拖出连线。                                                                      |
| doNotResetActiveTargetForSelector   | `string`                       | -    | -          | 选择器，点击该选择器对应的元素时不重置 `activeTarget`。                                                                                                   |
| doNotResetActiveTargetOutsideCanvas | `boolean`                      | -    | -          | 在画布外点击时不重置 `activeTarget`。                                                                                                                     |

## Events

| 事件                       | detail                                                                                                               | 说明                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| activeTarget.change        | `ActiveTarget \| null` — 当前激活目标，节点/边/装饰器对象或 null                                                     | 激活目标变化时触发，当用户点击节点、边或装饰器使其激活，或点击空白处取消激活时触发。 |
| node.move                  | `MoveCellPayload` — 移动的节点信息，包含节点 id 和新位置                                                             | 节点被拖拽移动后触发（已废弃，请使用 `cell.move`）。                                 |
| cell.move                  | `MoveCellPayload` — 移动的单元格信息，包含单元格 id、类型和新位置                                                    | 单个单元格（节点或装饰器）被拖拽移动后触发。                                         |
| cells.move                 | `MoveCellPayload[]` — 移动的多个单元格信息列表                                                                       | 多个单元格（通过框选后拖拽）同时被移动后触发。                                       |
| cell.resize                | `ResizeCellPayload` — 调整大小的单元格信息，包含单元格 id 和新尺寸                                                   | 单元格（节点或装饰器）被手动调整大小后触发。                                         |
| node.delete                | `Cell` — 被删除的节点 cell 对象                                                                                      | 节点被删除时触发（已废弃，请使用 `cell.delete`）。                                   |
| cell.delete                | `Cell` — 被删除的单元格对象，包含节点、边或装饰器                                                                    | 单个单元格被删除时触发（用户按 Delete 键或通过菜单删除）。                           |
| cells.delete               | `Cell[]` — 被批量删除的单元格对象列表                                                                                | 多个单元格被同时删除时触发（框选后批量删除）。                                       |
| cell.contextmenu           | `CellContextMenuDetail` — 右键菜单详情，包含 `{ cell: 对应的单元格, clientX: 鼠标X坐标, clientY: 鼠标Y坐标 }`        | 用户右键点击节点、边或装饰器时触发，常用于弹出上下文菜单。                           |
| edge.add                   | `ConnectNodesDetail` — 新边详情，包含 `{ source: 起始节点 id, target: 目标节点 id }`                                 | 通过画布绘图的方式添加边时触发（手动调用 `addEdge` 方法不会触发该事件）。            |
| edge.view.change           | `EdgeViewChangePayload` — 边视图变更详情，包含边 id 和新的视图属性                                                   | 用户通过拖拽手柄修改连线路径或形状时触发。                                           |
| decorator.view.change      | `DecoratorViewChangePayload` — 装饰器视图变更详情，包含装饰器 id 和新的位置/尺寸                                     | 装饰器（area、container、text 等）被移动或调整大小时触发。                           |
| decorator.text.change      | `DecoratorTextChangeDetail` — 文本变更详情，包含装饰器 id 和新的文本内容                                             | 装饰器文本（area/container/text 的文字）被编辑并确认后触发。                         |
| node.container.change      | `MoveCellPayload[]` — 节点与容器关系变更详情列表，有 containerCell 则为新增关系，否则为删除关系                      | 节点与容器组（container 装饰器）的包含关系发生变化时触发，包括拖入、拖出容器。       |
| decorator.group.plus.click | `DecoratorCell` — 被点击加号按钮的分组容器 cell 对象                                                                 | 分组容器（group 装饰器）的加号按钮被点击时触发，用于触发在组内添加新节点的逻辑。     |
| scale.change               | `number` — 当前缩放比例值（如 1.0 表示 100%）                                                                        | 画布缩放比例变化时触发，从素材库拖拽元素进画布时，拖拽图像应设置对应的缩放比例。     |
| canvas.contextmenu         | `CanvasContextMenuDetail` — 右键菜单详情，包含 `{ clientX: 鼠标X坐标, clientY: 鼠标Y坐标, view: 画布坐标 { x, y } }` | 用户在画布空白处右键点击时触发，常用于弹出画布级别的上下文菜单。                     |
| canvas.copy                | `void`                                                                                                               | 用户触发复制操作（Ctrl+C）时触发，外部需自行处理复制逻辑。                           |
| canvas.paste               | `void`                                                                                                               | 用户触发粘贴操作（Ctrl+V）时触发，外部需自行处理粘贴逻辑。                           |
| canvas.group               | `void`                                                                                                               | 用户触发分组操作（Ctrl+G）时触发，外部需自行处理分组逻辑。                           |
| canvas.ungroup             | `void`                                                                                                               | 用户触发取消分组操作（Ctrl+Shift+G）时触发，外部需自行处理解组逻辑。                 |

## Methods

| 方法                 | 参数                                                                                                                                                | 返回值                           | 说明                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| dropNode             | <ul><li>`info: DropNodeInfo` - 拖放节点信息，包含节点 id、拖放位置（clientX/clientY）、尺寸和数据</li></ul>                                         | `Promise<NodeCell \| null>`      | 将一个节点拖放到画布中指定位置。如果放置位置不在画布内，则返回 null。                                                                |
| dropDecorator        | <ul><li>`info: DropDecoratorInfo` - 拖放装饰器信息，包含装饰器类型、拖放位置、文本和方向等</li></ul>                                                | `Promise<DecoratorCell \| null>` | 将一个装饰器（area、container、text、line 等）拖放到画布中指定位置。如果放置位置不在画布内，则返回 null。                            |
| addNodes             | <ul><li>`nodes: AddNodeInfo[]` - 要添加的节点信息列表，每项包含 id、数据、尺寸等</li></ul>                                                          | `Promise<NodeCell[]>`            | 批量添加节点到画布，节点位置由布局算法自动计算。                                                                                     |
| addEdge              | <ul><li>`info: AddEdgeInfo` - 边信息，包含 source（起始节点 id）、target（目标节点 id）和可选的 data</li></ul>                                      | `Promise<EdgeCell>`              | 以编程方式添加一条边（连线）到画布。注意：此方法不会触发 `edge.add` 事件。                                                           |
| manuallyConnectNodes | <ul><li>`source: NodeId` - 起始节点的 id</li></ul>                                                                                                  | `Promise<ConnectNodesDetail>`    | 以编程方式启动从指定源节点到目标节点的手动连线流程，等待用户在画布上点击目标节点后返回连线详情。                                     |
| updateCells          | <ul><li>`cells: InitialCell[]` - 新的单元格数据列表</li><li>`ctx?: UpdateCellsContext` - 可选的更新上下文，用于指定更新原因和位置参考节点</li></ul> | `Promise<{ updated: Cell[] }>`   | 更新画布中的单元格数据，支持增量更新（新增、修改），已渲染的画布使用此方法代替直接设置 `cells` 属性。                                |
| reCenter             | -                                                                                                                                                   | `void`                           | 将画布视图重置并居中，使所有单元格重新显示在视口中央。                                                                               |
| toggleLock           | <ul><li>`target: ActiveTarget` - 当前选中的目标</li></ul>                                                                                           | `Promise<Cell[] \| null>`        | 切换锁定状态。如果目标中包含未锁定且可以锁定的元素，则将这些元素锁定；否则，如果目标中包含已锁定且可以解锁的元素，则将这些元素解锁。 |
| lock                 | <ul><li>`target: ActiveTarget` - 当前选中的目标</li></ul>                                                                                           | `Promise<Cell[] \| null>`        | 锁定选中的目标。规则类似 `toggleLock`，但仅执行锁定操作。                                                                            |
| unlock               | <ul><li>`target: ActiveTarget` - 当前选中的目标</li></ul>                                                                                           | `Promise<Cell[] \| null>`        | 解锁选中的目标。规则类似 `toggleLock`，但仅执行解锁操作。                                                                            |

## Examples

### Basic

基础绘图画布示例，展示手动布局（manual）下的节点拖放、连线绘制、装饰器（area/text/line/rect/container）添加、右键菜单（删除/添加边/锁定）等交互功能。

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
              id: "container-1",
              decorator: "container",
              view: {
                direction: "left",
                text: "上层服务" ,
                level: 1
              },
            },
            {
              type: "decorator",
              id: "container-2",
              decorator: "container",
              view: {
                direction: "left",
                text: "应用" ,
                level: 2
              },
            },
            {
              type: "decorator",
              id: "group-1",
              decorator: "group",
              containerId: "container-2",
              view: {
                usePlus: true,
              },
            },
            {
              type: "node",
              id: "G",
              groupId: "group-1",
              data: {
                name: `Node G`,
              },
              view: {
                width: 60,
                height: 60,
              }
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
            },
            {
              type: "edge",
              source: "Z",
              target: "W",
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
            ["A","B","C","S","D","F","X", "Y", "Z", "W"].map((id) => ({
              type: "node",
              id,
              containerId: ["W","Z","X","Y", "W"].includes(id)?"container-1":(["A","B",].includes(id)?"container-2":null),
              groupId: ["C","S","D","F",].includes(id)?"group-1":null,
              data: {
                name: `Node ${id}`,
              },
              view: {
                x: ["A","B","C","S","D","F","Z","X","Y",].includes(id)?null:Math.round(
                  id === "X"
                    ? 200 + Math.random() * 200
                    : id === "Y"
                    ? Math.random() * 300
                    : 300 + Math.random() * 300
                ),
                y: ["A","B","C","S","D","F","Z","X","Y"].includes(id)?null:(id === "X" ? 0 : 300) + Math.round((Math.random() * 200)),
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
                x: 300,
                y: 120,
                width: 100,
                height: 20,
                text: "Hello\nWorld!",
                style: {
                  // 垂直书写（从右到左）
                  writingMode: "vertical-rl",
                },
              },
            },
          ])
        %>
    - name: dragging
    - name: activeTarget
    - name: contextMenuDetail
    - name: scale
      value: 1
  children:
    - brick: div
      properties:
        style:
          width: 200px
          display: flex
          flexDirection: column
          gap: 1em
          border-right: "1px solid var(--palette-gray-6)"
          overflow: scroll
      children:
        - brick: eo-button
          properties:
            textContent: Add random nodes
          events:
            click:
              target: eo-draw-canvas
              method: addNodes
              args:
                - |
                  <%
                    ((...seeds) => seeds.map((seed) => ({
                      id: seed,
                      data: {
                        name: String(seed),
                      },
                    })))(
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                    )
                  %>
              callback:
                success:
                  action: console.log
                  args:
                    - Added nodes
                    - <% EVENT.detail %>
        - brick: eo-button
          properties:
            textContent: Re-center
          events:
            click:
              target: eo-draw-canvas
              method: reCenter
        - brick: eo-button
          properties:
            textContent: "Add edge: Y => Z"
          events:
            click:
              target: eo-draw-canvas
              method: addEdge
              args:
                - source: Y
                  target: Z
                  data:
                    virtual: true
        - brick: :forEach
          dataSource:
            - X
            - Y
          children:
            - brick: eo-button
              properties:
                textContent: <% `Add nodes below ${ITEM}` %>
              events:
                click:
                  target: eo-draw-canvas
                  method: updateCells
                  args:
                    - |
                      <%
                        CTX.initialCells.concat([
                          {
                            type: "edge",
                            source: ITEM,
                            target: "U",
                          },
                          {
                            type: "edge",
                            source: ITEM,
                            target: "V",
                          },
                          {
                            type: "node",
                            id: "U",
                            data: {
                              name: "U"
                            }
                          },
                          {
                            type: "node",
                            id: "V",
                            data: {
                              name: "V"
                            }
                          },
                        ])
                      %>
                    - reason: add-related-nodes
                      parent: <% ITEM %>
                  callback:
                    success:
                      action: console.log
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag nodes below
        - brick: :forEach
          dataSource: |
            <%
              ["A", "B", "C"].map((id) => ({
                type: "node",
                id,
                data: {
                  name: `Node ${id}`,
                },
              }))
            %>
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% ITEM.data.name %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, ...ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropNode
                    args:
                      - position: <% EVENT.detail %>
                        id: <% ITEM.id %>
                        data: <% ITEM.data %>
                    callback:
                      success:
                        if: <% EVENT.detail %>
                        then:
                          action: message.success
                          args:
                            - <% JSON.stringify(EVENT.detail) %>
                        else:
                          action: message.warn
                          args:
                            - Unexpected drop position
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag decorators below
        - brick: :forEach
          dataSource:
            - area
            - text
            - line
            - rect
            - container.top
            - container.right
            - container.bottom
            - container.left
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% _.upperFirst(ITEM) %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, type: "decorator", decorator: ITEM.split(".")[0]} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropDecorator
                    args:
                      - |
                        <%
                          ITEM === "line"
                            ? {
                                position: EVENT.detail,
                                decorator: ITEM.split(".")[0],
                              }
                            : {
                                position: EVENT.detail,
                                decorator: ITEM.split(".")[0],
                                text: ITEM === "text" ? "Text" : undefined,
                                direction: ITEM.split(".")[1],
                              }
                        %>
                    callback:
                      success:
                        if: <% !EVENT.detail %>
                        action: message.warn
                        args:
                          - Unexpected drop position
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            dragBehavior: lasso
            layoutOptions:
              snap:
                object: true
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        (CTX.activeTarget?.type === "multi"
                          ? CTX.activeTarget.targets
                          : CTX.activeTarget
                          ? [CTX.activeTarget]
                          : []
                        ).some((target) => (
                          target.type === "node" && target.id === DATA.node.id
                        ))
                          ? "highlighted"
                          : "default"
                      %>
            defaultEdgeLines:
              - if: <% DATA.edge.data?.virtual %>
                dashed: true
              - if: <% !DATA.edge.data?.virtual %>
                dotted: true
                showStartArrow: true
                markers:
                  - placement: start
                    type: circle
                  - placement: end
                    type: arrow
            cells: <% CTX.initialCells %>
            lineConnector: true
            lineSettings:
              type: polyline
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cells.move:
              action: message.info
              args:
                - <% `You just moved ${EVENT.detail.length} cells` %>
            cell.resize:
              action: message.info
              args:
                - <% `You just resized ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.width)}, ${Math.round(EVENT.detail.height)})` %>
            cells.delete:
              action: message.warn
              args:
                - |
                  <% `You wanna delete ${EVENT.detail.length} cells?` %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - contextMenuDetail
                  - <% EVENT.detail %>
            edge.add:
              action: message.info
              args:
                - |
                  <% `Added an nice edge: ${JSON.stringify(EVENT.detail)}` %>
            edge.view.change:
              action: message.info
              args:
                - |
                  <% `Edge view changed: ${JSON.stringify(EVENT.detail)}` %>
            decorator.view.change:
              action: message.info
              args:
                - |
                  <% `Decorator view changed: ${JSON.stringify(EVENT.detail)}` %>
            decorator.text.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            node.container.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        !CTX.contextMenuDetail
        ? []
        : CTX.contextMenuDetail.target?.type === "multi"
        ? [
            {
              text: "锁定/取消锁定",
              event: "toggle-lock",
            },
          ]
        : [
          ...(CTX.contextMenuDetail.locked ? [] : [{
            text: "添加边",
            event: "add-edge",
          },{
            text: "移除",
            event: "remove"
          }]),
          {
            text: "锁定/取消锁定",
            event: "toggle-lock",
          },
        ].filter((action) =>
          CTX.contextMenuDetail.cell.type === "node" || (
            CTX.contextMenuDetail.cell.type === "decorator" &&
            CTX.contextMenuDetail.cell.decorator === "area"
          ) || action.event !== "add-edge"
        )
      %>
  events:
    remove:
      target: eo-draw-canvas
      method: updateCells
      args:
        - |
          <%
            CTX.initialCells.filter((cell) =>
              !(
                CTX.contextMenuDetail.cell.type === "edge"
                  ? cell.type === "edge" && CTX.contextMenuDetail.cell.source === cell.source && CTX.contextMenuDetail.cell.target === cell.target
                  : cell.id === CTX.contextMenuDetail.cell.id ||
                    (cell.type === "edge" && (
                      CTX.contextMenuDetail.cell.id === cell.source ||
                      CTX.contextMenuDetail.cell.id === cell.target))
              )
            )
          %>
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.contextMenuDetail.cell.id %>
      callback:
        success:
          - target: eo-draw-canvas
            method: addEdge
            args:
              - source: <% EVENT.detail.source.id %>
                target: <% EVENT.detail.target.id %>
    toggle-lock:
      target: eo-draw-canvas
      method: toggleLock
      args:
        - <% CTX.contextMenuDetail.target %>
      callback:
        success:
          action: console.log
          args:
            - "Updated cells after toggle lock:"
            - <% EVENT.detail %>
```

### Line labels

设置连线文字。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      flexDirection: column
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "edge",
              source: "X",
              target: "Y",
              description: "X->Y",
              placement: "end",
              view: {
                type: "polyline"
              }
            },
            {
              type: "edge",
              source: "X",
              target: "Z"
            },
            {
              type: "node",
              id: "X",
              data: {
                name: "Node X",
              },
              view: {
                x: 100,
                y: 100,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Y",
              data: {
                name: "Node Y",
              },
              view: {
                x: 0,
                y: 300,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Z",
              data: {
                name: "Node Z",
              },
              view: {
                x: 300,
                y: 200,
                width: 60,
                height: 60,
              }
            },
          ]
        %>
    - name: activeTarget
    - name: scale
      value: 1
  children:
    - brick: eo-draw-canvas
      properties:
        style:
          width: 100%
          height: 100%
        activeTarget: <%= CTX.activeTarget %>
        fadeUnrelatedCells: true
        dragBehavior: lasso
        layoutOptions:
          snap:
            object: true
        defaultNodeSize: [60, 60]
        defaultNodeBricks:
          - useBrick:
              brick: diagram.experimental-node
              properties:
                textContent: <% `Node ${DATA.node.id}` %>
                status: |
                  <%=
                    (CTX.activeTarget?.type === "multi"
                      ? CTX.activeTarget.targets
                      : CTX.activeTarget
                      ? [CTX.activeTarget]
                      : []
                    ).some((target) => (
                      target.type === "node" && target.id === DATA.node.id
                    ))
                      ? "highlighted"
                      : "default"
                  %>
        cells: <% CTX.initialCells %>
        lineConnector: true
        defaultEdgeLines:
          - callLabelOnDoubleClick: enableEditing
            label:
              placement: <% DATA.edge.placement %>
              offset: 10
              useBrick:
                brick: diagram.editable-label
                properties:
                  label: <% DATA.edge.description %>
                  type: line
                  # Set `readOnly: true` for eo-display-canvas
                  # readOnly: true
                events:
                  label.change:
                    # Make sure only trigger update if label actually changed
                    if: <% (DATA.edge.description || "") !== (EVENT.detail || "") %>
                    action: context.replace
                    args:
                      - initialCells
                      - |-
                        <%
                          CTX.initialCells.map((edge) =>
                            edge.type === "edge" &&
                            edge.source === DATA.edge.source &&
                            edge.target === DATA.edge.target
                              ? { ...edge, description: EVENT.detail }
                              : edge
                          )
                        %>
      events:
        activeTarget.change:
          action: context.replace
          args:
            - activeTarget
            - <% EVENT.detail %>
        cell.delete:
          action: message.warn
          args:
            - |
              <% `You wanna delete ${EVENT.detail.type} ${EVENT.detail.type === "edge" ? `(${EVENT.detail.source} => ${EVENT.detail.target})` : EVENT.detail.id}?` %>
        scale.change:
          action: context.replace
          args:
            - scale
            - <% EVENT.detail %>
```

### Line settings

设置属性 `lineSettings` 来调整新的连线的样式，例如使用折线或直线。注意，该设置不影响已有的 edge 的连线样式。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      flexDirection: column
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              decorator: "line",
              id: "line-1",
              view: {
                source: {
                  x: 200,
                  y: 200,
                },
                target: {
                  x: 250,
                  y: 150,
                },
                // type: "polyline",
                vertices: [
                  {
                    x: 180,
                    y: 125,
                  },
                ],
                markers: [{
                  placement: "end",
                  type: "arrow",
                }],
              },
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
            },
            {
              type: "node",
              id: "X",
              data: {
                name: "Node X",
              },
              view: {
                x: 100,
                y: 100,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Y",
              data: {
                name: "Node Y",
              },
              view: {
                x: 0,
                y: 300,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Z",
              data: {
                name: "Node Z",
              },
              view: {
                x: 300,
                y: 200,
                width: 60,
                height: 60,
              }
            },
          ]
        %>
    - name: dragging
    - name: activeTarget
    - name: targetCell
    - name: scale
      value: 1
    - name: lineType
      value: polyline
  children:
    - brick: div
      children:
        - brick: eo-radio
          properties:
            type: button
            value: polyline
            options:
              - polyline
              - curve
              - straight
          events:
            change:
              action: context.replace
              args:
                - lineType
                - <% EVENT.detail.value %>
    - brick: div
      properties:
        style:
          flex: 1
          minHeight: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            dragBehavior: lasso
            layoutOptions:
              snap:
                object: true
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        (CTX.activeTarget?.type === "multi"
                          ? CTX.activeTarget.targets
                          : CTX.activeTarget
                          ? [CTX.activeTarget]
                          : []
                        ).some((target) => (
                          target.type === "node" && target.id === DATA.node.id
                        ))
                          ? "highlighted"
                          : "default"
                      %>
            cells: <% CTX.initialCells %>
            defaultEdgeLines:
              - jumps: true
            lineConnector: true
            lineSettings: |
              <%= { type: CTX.lineType } %>
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
            edge.add:
              action: message.info
              args:
                - |
                  <% `Added an nice edge: ${JSON.stringify(EVENT.detail)}` %>
            edge.view.change:
              action: message.info
              args:
                - |
                  <% `Edge view changed: ${JSON.stringify(EVENT.detail)}` %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        (["node"].includes(CTX.targetCell?.type )||CTX.targetCell?.decorator=="area") ? [
          {
            text: "添加边",
            event: "add-edge",
          }
        ] : [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
  events:
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.targetCell.id %>
      callback:
        success:
          - target: eo-draw-canvas
            method: addEdge
            args:
              - source: <% EVENT.detail.source.id %>
                target: <% EVENT.detail.target.id %>
```

### Force layout

使用力导向（force）布局模式，节点位置由力导向算法自动计算。

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
              containerId: ["X","Y","Z"].includes(id)?"container-1":undefined,
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
    - name: dragging
    - name: activeTarget
    - name: targetCell
    - name: scale
      value: 1
  children:
    - brick: div
      properties:
        style:
          width: 180px
          display: flex
          flexDirection: column
          gap: 1em
      children:
        - brick: eo-button
          properties:
            textContent: Add random nodes
          events:
            click:
              target: eo-draw-canvas
              method: addNodes
              args:
                - |
                  <%
                    ((...seeds) => seeds.map((seed) => ({
                      id: seed,
                      data: {
                        name: String(seed),
                      },
                    })))(
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                    )
                  %>
              callback:
                success:
                  action: console.log
                  args:
                    - Added nodes
                    - <% EVENT.detail %>
        - brick: eo-button
          properties:
            textContent: "Add edge: Y => Z"
          events:
            click:
              target: eo-draw-canvas
              method: addEdge
              args:
                - source: Y
                  target: Z
                  data:
                    virtual: true
        - brick: :forEach
          dataSource:
            - X
            - Y
          children:
            - brick: eo-button
              properties:
                textContent: <% `Add nodes below ${ITEM}` %>
              events:
                click:
                  target: eo-draw-canvas
                  method: updateCells
                  args:
                    - |
                      <%
                        CTX.initialCells.concat([
                          {
                            type: "edge",
                            source: ITEM,
                            target: "U",
                          },
                          {
                            type: "edge",
                            source: ITEM,
                            target: "V",
                          },
                          {
                            type: "node",
                            id: "U",
                            data: {
                              name: "U"
                            }
                          },
                          {
                            type: "node",
                            id: "V",
                            data: {
                              name: "V"
                            }
                          },
                        ])
                      %>
                    - reason: add-related-nodes
                      parent: <% ITEM %>
                  callback:
                    success:
                      action: console.log
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag nodes below
        - brick: :forEach
          dataSource: |
            <%
              ["A", "B", "C"].map((id) => ({
                type: "node",
                id,
                data: {
                  name: `Node ${id}`,
                },
              }))
            %>
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% ITEM.data.name %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, ...ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropNode
                    args:
                      - position: <% EVENT.detail %>
                        id: <% ITEM.id %>
                        data: <% ITEM.data %>
                    callback:
                      success:
                        if: <% EVENT.detail %>
                        then:
                          action: message.success
                          args:
                            - <% JSON.stringify(EVENT.detail) %>
                        else:
                          action: message.warn
                          args:
                            - Unexpected drop position
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag decorators below
        - brick: :forEach
          dataSource:
            - area
            - text
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% _.upperFirst(ITEM) %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, type: "decorator", decorator: ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropDecorator
                    args:
                      - position: <% EVENT.detail %>
                        decorator: <% ITEM %>
                        text: '<% ITEM === "text" ? "Text" : undefined %>'
                    callback:
                      success:
                        if: <% !EVENT.detail %>
                        action: message.warn
                        args:
                          - Unexpected drop position
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            layout: force
            # Initial nodes only
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
                          // : CTX.unrelated.some(n =>
                          //     n.type === "node" && n.id === DATA.node.id
                          //   )
                          // ? "faded"
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
            cell.move:
              action: message.info
              args:
                - <% `You just moved ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.x)}, ${Math.round(EVENT.detail.y)})` %>
            cell.resize:
              action: message.info
              args:
                - <% `You just resized ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.width)}, ${Math.round(EVENT.detail.height)})` %>
            cell.delete:
              action: message.warn
              args:
                - |
                  <% `You wanna delete ${EVENT.detail.type} ${EVENT.detail.type === "edge" ? `(${EVENT.detail.source} => ${EVENT.detail.target})` : EVENT.detail.id}?` %>
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
            decorator.text.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        CTX.targetCell?.type === "node" ? [
          {
            text: "添加边",
            event: "add-edge",
          }
        ] : [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
  events:
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.targetCell.id %>
      callback:
        success:
          target: eo-draw-canvas
          method: addEdge
          args:
            - source: <% EVENT.detail.source.id %>
              target: <% EVENT.detail.target.id %>
```

### Dagre layout

使用层次有向图（dagre）布局模式，节点位置由 dagre 算法自动计算，适合展示有向依赖关系。

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
              containerId: ["W","Z"].includes(id)?"container-1":undefined,
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
    - name: dragging
    - name: activeTarget
    - name: targetCell
    - name: scale
      value: 1
  children:
    - brick: div
      properties:
        style:
          width: 180px
          display: flex
          flexDirection: column
          gap: 1em
      children:
        - brick: eo-button
          properties:
            textContent: Add random nodes
          events:
            click:
              target: eo-draw-canvas
              method: addNodes
              args:
                - |
                  <%
                    ((...seeds) => seeds.map((seed) => ({
                      id: seed,
                      data: {
                        name: String(seed),
                      },
                    })))(
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                    )
                  %>
              callback:
                success:
                  action: console.log
                  args:
                    - Added nodes
                    - <% EVENT.detail %>
        - brick: eo-button
          properties:
            textContent: "Add edge: Y => Z"
          events:
            click:
              target: eo-draw-canvas
              method: addEdge
              args:
                - source: Y
                  target: Z
                  data:
                    virtual: true
        - brick: :forEach
          dataSource:
            - X
            - Y
          children:
            - brick: eo-button
              properties:
                textContent: <% `Add nodes below ${ITEM}` %>
              events:
                click:
                  target: eo-draw-canvas
                  method: updateCells
                  args:
                    - |
                      <%
                        CTX.initialCells.concat([
                          {
                            type: "edge",
                            source: ITEM,
                            target: "U",
                          },
                          {
                            type: "edge",
                            source: ITEM,
                            target: "V",
                          },
                          {
                            type: "node",
                            id: "U",
                            data: {
                              name: "U"
                            }
                          },
                          {
                            type: "node",
                            id: "V",
                            data: {
                              name: "V"
                            }
                          },
                        ])
                      %>
                    - reason: add-related-nodes
                      parent: <% ITEM %>
                  callback:
                    success:
                      action: console.log
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag nodes below
        - brick: :forEach
          dataSource: |
            <%
              ["A", "B", "C"].map((id) => ({
                type: "node",
                id,
                data: {
                  name: `Node ${id}`,
                },
              }))
            %>
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% ITEM.data.name %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, ...ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropNode
                    args:
                      - position: <% EVENT.detail %>
                        id: <% ITEM.id %>
                        data: <% ITEM.data %>
                    callback:
                      success:
                        if: <% EVENT.detail %>
                        then:
                          action: message.success
                          args:
                            - <% JSON.stringify(EVENT.detail) %>
                        else:
                          action: message.warn
                          args:
                            - Unexpected drop position
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag decorators below
        - brick: :forEach
          dataSource:
            - area
            - text
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% _.upperFirst(ITEM) %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, type: "decorator", decorator: ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropDecorator
                    args:
                      - position: <% EVENT.detail %>
                        decorator: <% ITEM %>
                        text: '<% ITEM === "text" ? "Text" : undefined %>'
                    callback:
                      success:
                        if: <% !EVENT.detail %>
                        action: message.warn
                        args:
                          - Unexpected drop position
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            layout: dagre
            # Initial nodes only
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
                          // : CTX.unrelated.some(n =>
                          //     n.type === "node" && n.id === DATA.node.id
                          //   )
                          // ? "faded"
                          : "default"
                      %>
            defaultEdgeLines:
              - dashed: <% !!DATA.edge.data?.virtual %>
                strokeColor: var(--palette-blue-6)
                overrides:
                  active:
                    strokeWidth: <% 2 * (DATA.edge?.data?.strokeWidth ?? 1) %>
                    strokeColor: cyan
            cells: <% CTX.initialCells %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.move:
              action: message.info
              args:
                - <% `You just moved ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.x)}, ${Math.round(EVENT.detail.y)})` %>
            cell.resize:
              action: message.info
              args:
                - <% `You just resized ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.width)}, ${Math.round(EVENT.detail.height)})` %>
            cell.delete:
              action: message.warn
              args:
                - |
                  <% `You wanna delete ${EVENT.detail.type} ${EVENT.detail.type === "edge" ? `(${EVENT.detail.source} => ${EVENT.detail.target})` : EVENT.detail.id}?` %>
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
            decorator.text.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        CTX.targetCell?.type === "node" ? [
          {
            text: "添加边",
            event: "add-edge",
          }
        ] : [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
  events:
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.targetCell.id %>
      callback:
        success:
          target: eo-draw-canvas
          method: addEdge
          args:
            - source: <% EVENT.detail.source.id %>
              target: <% EVENT.detail.target.id %>
```
