---
tagName: eo-diagram
displayName: WrappedEoDiagram
description: 图表构件，支持 dagre（有向无环图）和 force（力导向图）两种布局，可渲染节点和连线，支持缩放、平移、拖拽节点、连线交互等功能。
category: diagram
source: "@next-bricks/diagram"
---

# eo-diagram

> 图表构件，支持 dagre（有向无环图）和 force（力导向图）两种布局，可渲染节点和连线，支持缩放、平移、拖拽节点、连线交互等功能。

## Props

| 属性                  | 类型                                | 必填 | 默认值 | 说明                                                                                                             |
| --------------------- | ----------------------------------- | ---- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| layout                | `"dagre" \| "force" \| undefined`   | -    | -      | 图表布局类型，支持 `dagre`（层次有向图）和 `force`（力导向图）。                                                 |
| nodes                 | `DiagramNode[] \| undefined`        | -    | -      | 节点数据列表，每个节点需包含唯一 `id` 字段。                                                                     |
| edges                 | `DiagramEdge[] \| undefined`        | -    | -      | 边（连线）数据列表，每条边需包含 `source` 和 `target` 字段，指向节点 id。                                        |
| nodeBricks            | `NodeBrickConf[] \| undefined`      | -    | -      | 节点砖块配置，指定渲染节点使用的自定义构件，可按节点类型匹配不同配置。                                           |
| lines                 | `LineConf[] \| undefined`           | -    | -      | 连线样式配置，支持箭头、颜色、标签、交互等多种选项。                                                             |
| layoutOptions         | `LayoutOptions \| undefined`        | -    | -      | 布局算法选项，dagre 布局支持 rankdir、ranksep、nodesep 等，force 布局支持 dummyNodesOnEdges、collide 等。        |
| activeTarget          | `ActiveTarget \| null \| undefined` | -    | -      | 当前激活目标，可以是节点（`{ type: "node", nodeId }`) 或边（`{ type: "edge", edge }`），为 null 表示无激活目标。 |
| disableKeyboardAction | `boolean \| undefined`              | -    | -      | 是否禁用键盘操作（删除节点/边、切换激活节点），当有标签正在编辑时可临时禁用以避免冲突。                          |
| connectNodes          | `ConnectNodesOptions \| undefined`  | -    | -      | 连线交互配置，启用后支持从节点拖拽出新的连线，可配置连线样式和源节点过滤条件。                                   |
| dragNodes             | `DragNodesOptions \| undefined`     | -    | -      | 拖拽节点配置，启用后支持手动拖拽节点调整位置，可配置是否保存用户视图。                                           |
| zoomable              | `boolean \| undefined`              | -    | `true` | 是否允许通过鼠标滚轮或触控板捏合手势缩放图表，默认为 true。                                                      |
| scrollable            | `boolean \| undefined`              | -    | `true` | 是否允许通过滚轮平移图表（非捏合手势），默认为 true。                                                            |
| pannable              | `boolean \| undefined`              | -    | `true` | 是否允许通过鼠标拖拽平移图表，默认为 true。                                                                      |
| scaleRange            | `RangeTuple \| undefined`           | -    | -      | 缩放比例范围，格式为 `[min, max]`，默认范围由内部常量决定。                                                      |

## Events

| 事件                | detail                                                                                                | 说明                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| activeTarget.change | `ActiveTarget \| null` — 当前激活目标，`{ type: "node", nodeId }` 或 `{ type: "edge", edge }` 或 null | 激活目标变化时触发，当用户点击节点或边使其激活，或点击空白处取消激活时触发。   |
| node.delete         | `DiagramNode` — 被删除的节点对象，包含节点 id 及其他自定义字段                                        | 用户按 Delete/Backspace 键且当前激活目标为节点时触发，需外部处理实际删除逻辑。 |
| edge.delete         | `DiagramEdge` — 被删除的边对象，包含 source、target 及其他自定义字段                                  | 用户按 Delete/Backspace 键且当前激活目标为边时触发，需外部处理实际删除逻辑。   |
| line.click          | `LineTarget` — 被点击的连线信息，包含 `{ id: 连线唯一标识, edge: 对应的边数据 }`                      | 用户点击可交互连线时触发。                                                     |
| line.dblclick       | `LineTarget` — 被双击的连线信息，包含 `{ id: 连线唯一标识, edge: 对应的边数据 }`                      | 用户双击可交互连线时触发，常用于触发连线标签编辑。                             |
| nodes.connect       | `ConnectLineDetail` — 连线详情，包含 `{ source: 起始节点, target: 目标节点 }`                         | 用户从一个节点拖拽连线到另一个节点并释放时触发，需外部处理实际建立连接的逻辑。 |

## Methods

| 方法            | 参数                                                    | 返回值 | 说明                                                                                                  |
| --------------- | ------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| callOnLineLabel | `(id: string, method: string, args: unknown[]) => void` | `void` | 调用指定 id 的连线标签构件上的方法，常用于触发标签编辑（如 `callOnLineLabel(id, "enableEditing")`）。 |

## Examples

### Basic

展示基本的 dagre 布局图表，包含节点和带箭头的连线，并支持动态添加/删除节点。

```yaml preview minHeight="600px"
brick: div
properties:
  style:
    position: fixed
    height: 100vh
    width: 100vw
    top: 0px
    left: 0px
context:
  - name: activeTarget
    value: null
  - name: nodes
    value:
      - id: kspacey
        label: Kevin Spacey
      - id: swilliams
        label: Saul Williams
      - id: bpitt
        label: Brad Pitt
      # - id: hford
      #   label: Harrison Ford
      - id: lwilson
        label: Luke Wilson
      - id: kbacon
        label: Kevin Bacon
  - name: edges
    value:
      - source: kspacey
        target: swilliams
      - source: swilliams
        target: kbacon
      - source: bpitt
        target: kbacon
      # - source: hford
      #   target: lwilson
      - source: lwilson
        target: kbacon
children:
  - brick: eo-button
    properties:
      textContent: Add Harrison Ford
    events:
      click:
        - action: context.replace
          args:
            - nodes
            - |
              <%
                CTX.nodes.concat({
                  id: "hford",
                  label: "Harrison Ford",
                })
              %>
        - action: context.replace
          args:
            - edges
            - |
              <%
                CTX.edges.concat({
                  source: "hford",
                  target: "lwilson",
                })
              %>
        - target: _self
          properties:
            style:
              visibility: hidden
  - brick: eo-button
    properties:
      textContent: Remove Kevin Spacey
    events:
      click:
        - action: context.replace
          args:
            - nodes
            - |
              <%
                CTX.nodes.filter(node => node.id !== "kspacey")
              %>
        - action: context.replace
          args:
            - edges
            - |
              <%
                CTX.edges.filter(({ source, target }) => source !== "kspacey" && target !== "kspacey")
              %>
        - target: _self
          properties:
            style:
              visibility: hidden
  - brick: eo-diagram
    properties:
      layout: dagre
      nodes: <%= CTX.nodes %>
      edges: <%= CTX.edges %>
      lines:
        - arrow: true
      activeTarget: <%= CTX.activeTarget %>
      nodeBricks:
        - useBrick:
            brick: div
            properties:
              style: |
                <%=
                  {
                    width: "180px",
                    height: "100px",
                    border: "2px solid green",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: CTX.activeTarget?.type === "node" && CTX.activeTarget.nodeId === DATA.node.id ? "2px solid orange" : "none",
                    outlineOffset: "2px",
                  }
                %>
            children:
              - brick: span
                properties:
                  textContent: <% DATA.node.label %>
            events:
              click:
                action: context.replace
                args:
                  - activeTarget
                  - type: node
                    nodeId: <% DATA.node.id %>
    events:
      activeTarget.change:
        action: context.replace
        args:
          - activeTarget
          - <% EVENT.detail %>
```

### Page Architecture

展示 dagre 布局图表用于页面架构可视化，包含节点标签编辑、连线标签、连线创建和节点删除交互。

```yaml preview minHeight="600px"
brick: div
properties:
  style:
    position: fixed
    height: 100vh
    width: 100vw
    top: 0px
    left: 0px
context:
  - name: activeTarget
    value: null
  - name: tempNodeId
  - name: targetNode
  - name: editingLabelNodes
    value: []
  - name: editingLabelEdges
    value: []
  - name: nodes
    value:
      - type: board
        id: 60bf6078b095f
        name: Visual Builder
        depth: 0
        parentId:
        description: 某某产品
      - type: page
        id: 60bf60848d6d2
        name: 项目列表
        depth: 1
        parentId: 60bf6078b095f
        description: 列表页
      - type: page
        id: 60d533eba4ab2
        name: ccc
        depth: 1
        parentId: 60bf6078b095f
        description: cccc
      - type: link
        id: 60bf6091a1089
        name: 新建项目
        pageType: information:form:basic-form
        description: 新建页213
        to:
          "@":
            description: 无项目
            instanceId: 60c5fea301b32
          description: 新建页213
          instanceId: 60bf6091a1089
          module: []
          name: 新建项目
          pageType: information:form:basic-form
        depth: -1
        parentId:
      - type: link
        id: 60bf60a258613
        name: 项目首页-路由管理
        description: 路由管理
        to:
          description: 路由管理
          instanceId: 60bf60a258613
          module:
            - instanceId: 60bf609b26889
              name: Project
          name: 项目首页-路由管理
        depth: -1
        parentId:
      - type: link
        id: 60c5f39a2c2e1
        name: Launchpad 出厂配置
        description: Launchpad 出厂配置
        to:
          description: Launchpad 出厂配置
          instanceId: 60c5f39a2c2e1
          module: []
          name: Launchpad 出厂配置
        depth: -1
        parentId:
  - name: edges
    value:
      - type: menu
        source: 60bf6078b095f
        target: 60bf60848d6d2
      - type: menu
        source: 60bf6078b095f
        target: 60d533eba4ab2
      - type: link
        source: 60bf60848d6d2
        target: 60bf6091a1089
        description: 无项目
      - type: link
        source: 60bf60848d6d2
        target: 60bf60a258613
      - type: link
        source: 60bf60848d6d2
        target: 60c5f39a2c2e1
children:
  - brick: eo-diagram
    properties:
      layout: dagre
      nodes: <%= CTX.nodes %>
      edges: <%= CTX.edges %>
      lines:
        - edgeType: link
          strokeColor: var(--theme-blue-color)
          arrow: true
          interactable: true
          label:
            useBrick:
              brick: diagram.editable-label
              properties:
                label: <% DATA.edge.description %>
                type: line
              events:
                label.change:
                  if: <% (DATA.edge.description || "") !== (EVENT.detail || "") %>
                  action: context.replace
                  args:
                    - edges
                    - |-
                      <%
                        CTX.edges.map((edge) =>
                          edge.source === DATA.edge.source &&
                          edge.target === DATA.edge.target
                            ? { ...edge, description: EVENT.detail }
                            : edge
                        )
                      %>
                label.editing.change:
                  action: context.replace
                  args:
                    - editingLabelEdges
                    - |-
                      <%
                        EVENT.detail
                          ? CTX.editingLabelEdges.concat(
                              `${DATA.edge.source}-:-${DATA.edge.target}`
                            )
                          : CTX.editingLabelEdges.filter(
                              (id) =>
                                id !== `${DATA.edge.source}-:-${DATA.edge.target}`
                            )
                      %>
                click:
                  action: context.replace
                  args:
                    - activeTarget
                    - type: edge
                      edge: <% DATA.edge %>
        - edgeType: menu
          strokeColor: var(--palette-gray-5)
          arrow: true
          interactable: true
      layoutOptions:
        nodePadding: [4, 10, 10]
      activeTarget: <%= CTX.activeTarget %>
      disableKeyboardAction: <%= CTX.editingLabelNodes.length > 0 || CTX.editingLabelEdges.length > 0 %>
      connectNodes:
        arrow: true
        strokeColor: |-
          <%
            DATA.source.type === "board"
              ? "var(--palette-gray-5)"
              : "var(--theme-blue-color)"
          %>
      nodeBricks:
        - useBrick:
            brick: visual-builder.page-arch-node
            properties:
              label: <% DATA.node.name %>
              type: <% DATA.node.type %>
              autoFocusOnce: |
                <% DATA.node.$temp ? DATA.node.id : undefined %>
              active: <%= CTX.activeTarget?.type === "node" && CTX.activeTarget.nodeId === DATA.node.id %>
            events:
              click:
                action: context.replace
                args:
                  - activeTarget
                  - type: node
                    nodeId: <% DATA.node.id %>
              label.editing.change:
                action: context.replace
                args:
                  - editingLabelNodes
                  - |
                    <%
                      EVENT.detail
                        ? CTX.editingLabelNodes.concat(DATA.node.id)
                        : CTX.editingLabelNodes.filter(
                            id => id !== DATA.node.id
                          )
                    %>
              label.change:
              - if: <% CTX.nodes.find(({id}) => id === DATA.node.id)?.$temp %>
                action: context.replace
                args:
                args:
                  - nodes
                  - |
                    <%
                      CTX.nodes.map((node) => (
                        node.id === DATA.node.id
                          ? { ...node, $temp: false, name: EVENT.detail }
                          : node
                      ))
                    %>
              - if: <% CTX.nodes.find(({id}) => id === DATA.node.id)?.name !== EVENT.detail %>
                action: context.replace
                args:
                  - nodes
                  - |
                    <%
                      CTX.nodes.map((node) => (
                        node.id === DATA.node.id
                          ? { ...node, name: EVENT.detail }
                          : node
                      ))
                    %>
              child.append:
                - action: context.replace
                  args:
                    - tempNodeId
                    - <% _.uniqueId('$temp-') %>
                - action: context.replace
                  args:
                    - nodes
                    - |
                      <% CTX.nodes.concat({ id: CTX.tempNodeId, name: "未命名", $temp: true }) %>
                - action: context.replace
                  args:
                    - edges
                    - |
                      <% CTX.edges.concat({ source: DATA.node.id, target: CTX.tempNodeId, name: "未命名", type: "link", $temp: true }) %>
                - action: context.replace
                  args:
                    - activeTarget
                    - type: node
                      nodeId: <% CTX.tempNodeId %>
    events:
      activeTarget.change:
        action: context.replace
        args:
          - activeTarget
          - <% EVENT.detail %>
      node.delete:
        - action: context.replace
          args:
            - targetNode
            - <% EVENT.detail %>
        - useProvider: basic.show-dialog
          args:
          - type: delete
            title: Delete Confirm
            content: Please enter {{ expect }} to delete the node.
            expect: <% EVENT.detail.name || "未命名" %>
          callback:
            success:
            - action: context.replace
              args:
                - nodes
                - |-
                  <%
                    CTX.nodes.filter(
                      ({ id }) => id !== CTX.targetNode.id
                    )
                  %>
            - action: context.replace
              args:
                - edges
                - |-
                  <%
                    CTX.edges.filter(
                      ({ source, target }) =>
                        source !== CTX.targetNode.id &&
                        target !== CTX.targetNode.id
                    )
                  %>
      edge.delete:
        action: context.replace
        args:
          - edges
          - |-
            <%
              CTX.edges.filter(
                ({ source, target }) =>
                  source !== EVENT.detail.source ||
                  target !== EVENT.detail.target
              )
            %>
      line.click:
        action: context.replace
        args:
          - activeTarget
          - type: edge
            edge: <% EVENT.detail.edge %>
      line.dblclick:
        target: _self
        method: callOnLineLabel
        args:
          - <% `${EVENT.detail.id}-center` %>
          - enableEditing
      nodes.connect:
        if: |-
          <%
            EVENT.detail.target.type !== "board" &&
            !CTX.edges.some(
              (edge) =>
                edge.source === EVENT.detail.source.id &&
                edge.target === EVENT.detail.target.id
            )
          %>
        action: context.replace
        args:
          - edges
          - |-
            <%
              CTX.edges.concat({
                source: EVENT.detail.source.id,
                target: EVENT.detail.target.id,
                type:
                  EVENT.detail.source.type === "board"
                    ? "menu"
                    : "link",
              })
            %>
```

### Force

展示 force 布局的力导向图，支持拖拽节点、连线标签显示，适合展示关系网络。

```yaml preview minHeight="600px"
brick: div
properties:
  style:
    position: fixed
    height: 100vh
    width: 100vw
    top: 0px
    left: 0px
context:
  - name: activeTarget
    value: null
  - name: nodes
    value:
      - id: 产品评价
      - id: 产品线
      - id: 用户角色
      - id: 模型视图
      - id: 产品
      - id: 业务场景
      - id: 业务规则
      - id: 模型
      - id: 产品模块
      - id: 产品价值点
      - id: 工作流
      - id: 测试用例
      - id: 功能点
  - name: edges
    value:
      - source: 产品
        target: 产品评价
        sourceName: 评价列表
        targetName: 所属产品
      - source: 产品
        target: 产品线
        sourceName: 所属产品线
        targetName: 产品列表
      - source: 产品
        target: 用户角色
        sourceName: 负责人
        targetName: 负责的产品
      - source: 产品
        target: 模型视图
        sourceName: 模型视图列表
        targetName: 所属产品
      - source: 产品
        target: 业务场景
        sourceName: 业务场景列表
        targetName: 所属产品
      - source: 业务场景
        target: 业务规则
        sourceName: 业务规则列表
        targetName: 所属业务场景
      - source: 产品
        target: 模型
        sourceName: 模型列表
        targetName: 关联的产品
      - source: 产品
        target: 产品模块
        sourceName: 模块列表
        targetName: 所属产品
      - source: 产品模块
        target: 测试用例
        sourceName: 测试用例列表
        targetName: 所属产品模块
      - source: 产品模块
        target: 功能点
        sourceName: 功能点列表
        targetName: 所属产品模块
children:
  - brick: eo-diagram
    properties:
      layout: force
      dragNodes: {}
      nodes: <%= CTX.nodes %>
      edges: <%= CTX.edges %>
      activeTarget: <%= CTX.activeTarget %>
      layoutOptions:
        dummyNodesOnEdges: 1
        collide:
          dummyRadius: 10
          radiusDiff: 40
      scaleRange: [0.5, 2]
      lines:
        - label:
            - useBrick:
                brick: span
                properties:
                  hidden: <%= CTX.activeTarget?.type !== "node" || (DATA.edge.source !== CTX.activeTarget.nodeId && DATA.edge.target !== CTX.activeTarget.nodeId) %>
                  textContent: |
                    <%= DATA.edge.source === CTX.activeTarget?.nodeId ? DATA.edge.sourceName : DATA.edge.target === CTX.activeTarget?.nodeId ? DATA.edge.targetName : "" %>
                  style:
                    color: var(--palette-gray-6)
          overrides:
            activeRelated:
              strokeColor: var(--palette-blue-4)
      nodeBricks:
        - useBrick:
            brick: div
            properties:
              style: |
                <%=
                  {
                    width: "160px",
                    height: "50px",
                    background: "var(--palette-green-1)",
                    border: "1px solid var(--palette-gray-4)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    outline: CTX.activeTarget?.type === "node" && DATA.node.id === CTX.activeTarget.nodeId ? "2px solid orange" : "none",
                    outlineOffset: "2px",
                    cursor: "pointer",
                    userSelect: "none",
                  }
                %>
            children:
              - brick: span
                properties:
                  textContent: <% DATA.node.id %>
            events:
              click:
                action: context.replace
                args:
                  - activeTarget
                  - type: node
                    nodeId: <% DATA.node.id %>
    events:
      activeTarget.change:
        action: context.replace
        args:
          - activeTarget
          - <% EVENT.detail %>
```
