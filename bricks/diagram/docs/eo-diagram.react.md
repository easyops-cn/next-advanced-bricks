---
tagName: eo-diagram
displayName: WrappedEoDiagram
description: 图表构件，支持 dagre（有向无环图）和 force（力导向图）两种布局，可渲染节点和连线，支持缩放、平移、拖拽节点、连线交互等功能。
category: diagram
source: "@next-bricks/diagram"
---

# WrappedEoDiagram

> 图表构件，支持 dagre（有向无环图）和 force（力导向图）两种布局，可渲染节点和连线，支持缩放、平移、拖拽节点、连线交互等功能。

## 导入

```tsx
import { WrappedEoDiagram } from "@easyops/wrapped-components";
```

## Props

| 属性                  | 类型                                             | 必填 | 默认值 | 说明                                                                                                             |
| --------------------- | ------------------------------------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| layout                | `"dagre" \| "force" \| undefined`                | -    | -      | 图表布局类型，支持 `dagre`（层次有向图）和 `force`（力导向图）。                                                 |
| nodes                 | `DiagramNode[] \| undefined`                     | -    | -      | 节点数据列表，每个节点需包含唯一 `id` 字段。                                                                     |
| edges                 | `DiagramEdge[] \| undefined`                     | -    | -      | 边（连线）数据列表，每条边需包含 `source` 和 `target` 字段，指向节点 id。                                        |
| nodeBricks            | `NodeBrickConf[] \| undefined`                   | -    | -      | 节点砖块配置，指定渲染节点使用的自定义构件，可按节点类型匹配不同配置。                                           |
| lines                 | `LineConf[] \| undefined`                        | -    | -      | 连线样式配置，支持箭头、颜色、标签、交互等多种选项。                                                             |
| layoutOptions         | `LayoutOptions \| undefined`                     | -    | -      | 布局算法选项，dagre 布局支持 rankdir、ranksep、nodesep 等，force 布局支持 dummyNodesOnEdges、collide 等。        |
| activeTarget          | `ActiveTarget \| null \| undefined`              | -    | -      | 当前激活目标，可以是节点（`{ type: "node", nodeId }`) 或边（`{ type: "edge", edge }`），为 null 表示无激活目标。 |
| disableKeyboardAction | `boolean \| undefined`                           | -    | -      | 是否禁用键盘操作（删除节点/边、切换激活节点），当有标签正在编辑时可临时禁用以避免冲突。                          |
| connectNodes          | `ConnectNodesOptions \| undefined`               | -    | -      | 连线交互配置，启用后支持从节点拖拽出新的连线，可配置连线样式和源节点过滤条件。                                   |
| dragNodes             | `DragNodesOptions \| undefined`                  | -    | -      | 拖拽节点配置，启用后支持手动拖拽节点调整位置，可配置是否保存用户视图。                                           |
| zoomable              | `boolean \| undefined`                           | -    | `true` | 是否允许通过鼠标滚轮或触控板捏合手势缩放图表，默认为 true。                                                      |
| scrollable            | `boolean \| undefined`                           | -    | `true` | 是否允许通过滚轮平移图表（非捏合手势），默认为 true。                                                            |
| pannable              | `boolean \| undefined`                           | -    | `true` | 是否允许通过鼠标拖拽平移图表，默认为 true。                                                                      |
| scaleRange            | `RangeTuple \| undefined`                        | -    | -      | 缩放比例范围，格式为 `[min, max]`，默认范围由内部常量决定。                                                      |
| onActiveTargetChange  | `(e: CustomEvent<ActiveTarget \| null>) => void` | -    | -      | 激活目标变化时触发。                                                                                             |
| onNodeDelete          | `(e: CustomEvent<DiagramNode>) => void`          | -    | -      | 用户按 Delete/Backspace 键且当前激活目标为节点时触发。                                                           |
| onEdgeDelete          | `(e: CustomEvent<DiagramEdge>) => void`          | -    | -      | 用户按 Delete/Backspace 键且当前激活目标为边时触发。                                                             |
| onLineClick           | `(e: CustomEvent<LineTarget>) => void`           | -    | -      | 用户点击可交互连线时触发。                                                                                       |
| onLineDblclick        | `(e: CustomEvent<LineTarget>) => void`           | -    | -      | 用户双击可交互连线时触发。                                                                                       |
| onNodesConnect        | `(e: CustomEvent<ConnectLineDetail>) => void`    | -    | -      | 用户从一个节点拖拽连线到另一个节点并释放时触发。                                                                 |

## Events

| 事件                 | detail                                                                                                | 说明                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| onActiveTargetChange | `ActiveTarget \| null` — 当前激活目标，`{ type: "node", nodeId }` 或 `{ type: "edge", edge }` 或 null | 激活目标变化时触发，当用户点击节点或边使其激活，或点击空白处取消激活时触发。   |
| onNodeDelete         | `DiagramNode` — 被删除的节点对象，包含节点 id 及其他自定义字段                                        | 用户按 Delete/Backspace 键且当前激活目标为节点时触发，需外部处理实际删除逻辑。 |
| onEdgeDelete         | `DiagramEdge` — 被删除的边对象，包含 source、target 及其他自定义字段                                  | 用户按 Delete/Backspace 键且当前激活目标为边时触发，需外部处理实际删除逻辑。   |
| onLineClick          | `LineTarget` — 被点击的连线信息，包含 `{ id: 连线唯一标识, edge: 对应的边数据 }`                      | 用户点击可交互连线时触发。                                                     |
| onLineDblclick       | `LineTarget` — 被双击的连线信息，包含 `{ id: 连线唯一标识, edge: 对应的边数据 }`                      | 用户双击可交互连线时触发，常用于触发连线标签编辑。                             |
| onNodesConnect       | `ConnectLineDetail` — 连线详情，包含 `{ source: 起始节点, target: 目标节点 }`                         | 用户从一个节点拖拽连线到另一个节点并释放时触发，需外部处理实际建立连接的逻辑。 |

## Methods

| 方法            | 参数                                                    | 返回值 | 说明                                                                                                  |
| --------------- | ------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| callOnLineLabel | `(id: string, method: string, args: unknown[]) => void` | `void` | 调用指定 id 的连线标签构件上的方法，常用于触发标签编辑（如 `callOnLineLabel(id, "enableEditing")`）。 |

## Examples

### Basic

展示基本的 dagre 布局图表，包含节点和带箭头的连线，并支持动态添加/删除节点。

```tsx
import { useState } from "react";
import { WrappedEoDiagram } from "@easyops/wrapped-components";

function BasicDiagram() {
  const [activeTarget, setActiveTarget] = useState(null);
  const [nodes, setNodes] = useState([
    { id: "kspacey", label: "Kevin Spacey" },
    { id: "swilliams", label: "Saul Williams" },
    { id: "bpitt", label: "Brad Pitt" },
    { id: "lwilson", label: "Luke Wilson" },
    { id: "kbacon", label: "Kevin Bacon" },
  ]);
  const [edges, setEdges] = useState([
    { source: "kspacey", target: "swilliams" },
    { source: "swilliams", target: "kbacon" },
    { source: "bpitt", target: "kbacon" },
    { source: "lwilson", target: "kbacon" },
  ]);

  return (
    <div
      style={{
        position: "fixed",
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
      }}
    >
      <WrappedEoDiagram
        layout="dagre"
        nodes={nodes}
        edges={edges}
        lines={[{ arrow: true }]}
        activeTarget={activeTarget}
        nodeBricks={[
          {
            useBrick: {
              brick: "div",
              properties: {
                style: {
                  width: "180px",
                  height: "100px",
                  border: "2px solid green",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              },
            },
          },
        ]}
        onActiveTargetChange={(e) => setActiveTarget(e.detail)}
      />
    </div>
  );
}
```

### Page Architecture

展示 dagre 布局图表用于页面架构可视化，包含节点标签编辑、连线标签、连线创建和节点删除交互。

```tsx
import { useState, useRef } from "react";
import { WrappedEoDiagram } from "@easyops/wrapped-components";

function PageArchDiagram() {
  const diagramRef = useRef(null);
  const [activeTarget, setActiveTarget] = useState(null);
  const [editingLabelEdges, setEditingLabelEdges] = useState([]);
  const [nodes, setNodes] = useState([
    { type: "board", id: "60bf6078b095f", name: "Visual Builder", depth: 0 },
    {
      type: "page",
      id: "60bf60848d6d2",
      name: "项目列表",
      depth: 1,
      parentId: "60bf6078b095f",
    },
    {
      type: "link",
      id: "60bf6091a1089",
      name: "新建项目",
      depth: -1,
      description: "新建页213",
    },
  ]);
  const [edges, setEdges] = useState([
    { type: "menu", source: "60bf6078b095f", target: "60bf60848d6d2" },
    {
      type: "link",
      source: "60bf60848d6d2",
      target: "60bf6091a1089",
      description: "无项目",
    },
  ]);

  return (
    <div
      style={{
        position: "fixed",
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
      }}
    >
      <WrappedEoDiagram
        ref={diagramRef}
        layout="dagre"
        nodes={nodes}
        edges={edges}
        activeTarget={activeTarget}
        disableKeyboardAction={editingLabelEdges.length > 0}
        layoutOptions={{ nodePadding: [4, 10, 10] }}
        connectNodes={{ arrow: true, strokeColor: "var(--theme-blue-color)" }}
        lines={[
          {
            edgeType: "link",
            strokeColor: "var(--theme-blue-color)",
            arrow: true,
            interactable: true,
          },
          {
            edgeType: "menu",
            strokeColor: "var(--palette-gray-5)",
            arrow: true,
            interactable: true,
          },
        ]}
        nodeBricks={[
          {
            useBrick: {
              brick: "div",
              properties: {
                style: {
                  padding: "8px 16px",
                  border: "1px solid var(--palette-gray-4)",
                  borderRadius: "4px",
                  background: "white",
                },
              },
            },
          },
        ]}
        onActiveTargetChange={(e) => setActiveTarget(e.detail)}
        onNodeDelete={(e) => {
          const node = e.detail;
          setNodes((prev) => prev.filter(({ id }) => id !== node.id));
          setEdges((prev) =>
            prev.filter(
              ({ source, target }) => source !== node.id && target !== node.id
            )
          );
        }}
        onEdgeDelete={(e) => {
          const edge = e.detail;
          setEdges((prev) =>
            prev.filter(
              ({ source, target }) =>
                source !== edge.source || target !== edge.target
            )
          );
        }}
        onLineClick={(e) =>
          setActiveTarget({ type: "edge", edge: e.detail.edge })
        }
        onLineDblclick={(e) => {
          diagramRef.current?.callOnLineLabel(
            `${e.detail.id}-center`,
            "enableEditing"
          );
        }}
        onNodesConnect={(e) => {
          const { source, target } = e.detail;
          if (
            !edges.some(
              (edge) => edge.source === source.id && edge.target === target.id
            )
          ) {
            setEdges((prev) =>
              prev.concat({
                source: source.id,
                target: target.id,
                type: source.type === "board" ? "menu" : "link",
              })
            );
          }
        }}
      />
    </div>
  );
}
```

### Force

展示 force 布局的力导向图，支持拖拽节点、连线标签显示，适合展示关系网络。

```tsx
import { useState } from "react";
import { WrappedEoDiagram } from "@easyops/wrapped-components";

function ForceDiagram() {
  const [activeTarget, setActiveTarget] = useState(null);
  const nodes = [
    { id: "产品" },
    { id: "产品评价" },
    { id: "产品线" },
    { id: "用户角色" },
    { id: "模型视图" },
    { id: "业务场景" },
    { id: "业务规则" },
    { id: "模型" },
    { id: "产品模块" },
    { id: "产品价值点" },
    { id: "工作流" },
    { id: "测试用例" },
    { id: "功能点" },
  ];
  const edges = [
    {
      source: "产品",
      target: "产品评价",
      sourceName: "评价列表",
      targetName: "所属产品",
    },
    {
      source: "产品",
      target: "产品线",
      sourceName: "所属产品线",
      targetName: "产品列表",
    },
    {
      source: "产品",
      target: "用户角色",
      sourceName: "负责人",
      targetName: "负责的产品",
    },
    {
      source: "产品",
      target: "业务场景",
      sourceName: "业务场景列表",
      targetName: "所属产品",
    },
    {
      source: "业务场景",
      target: "业务规则",
      sourceName: "业务规则列表",
      targetName: "所属业务场景",
    },
    {
      source: "产品",
      target: "模型",
      sourceName: "模型列表",
      targetName: "关联的产品",
    },
    {
      source: "产品",
      target: "产品模块",
      sourceName: "模块列表",
      targetName: "所属产品",
    },
    {
      source: "产品模块",
      target: "测试用例",
      sourceName: "测试用例列表",
      targetName: "所属产品模块",
    },
    {
      source: "产品模块",
      target: "功能点",
      sourceName: "功能点列表",
      targetName: "所属产品模块",
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
      }}
    >
      <WrappedEoDiagram
        layout="force"
        nodes={nodes}
        edges={edges}
        activeTarget={activeTarget}
        dragNodes={{}}
        scaleRange={[0.5, 2]}
        layoutOptions={{
          dummyNodesOnEdges: 1,
          collide: { dummyRadius: 10, radiusDiff: 40 },
        }}
        lines={[
          {
            overrides: {
              activeRelated: { strokeColor: "var(--palette-blue-4)" },
            },
          },
        ]}
        nodeBricks={[
          {
            useBrick: {
              brick: "div",
              properties: {
                style: {
                  width: "160px",
                  height: "50px",
                  background: "var(--palette-green-1)",
                  border: "1px solid var(--palette-gray-4)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                },
              },
            },
          },
        ]}
        onActiveTargetChange={(e) => setActiveTarget(e.detail)}
      />
    </div>
  );
}
```
