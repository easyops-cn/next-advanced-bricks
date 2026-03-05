---
tagName: visual-builder.page-arch-node
displayName: WrappedVisualBuilderPageArchNode
description: Visual Builder 页面架构图节点，支持页面（page）和看板（board）两种类型，可内联编辑标签、追加子节点、显示外链和子节点
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderPageArchNode

> Visual Builder 页面架构图节点，支持页面（page）和看板（board）两种类型，可内联编辑标签、追加子节点、显示外链和子节点

## 导入

```tsx
import { WrappedVisualBuilderPageArchNode } from "@easyops/wrapped-components";
```

## Props

| 属性               | 类型                | 必填 | 默认值 | 说明                                                                                     |
| ------------------ | ------------------- | ---- | ------ | ---------------------------------------------------------------------------------------- |
| label              | `string`            | 否   | -      | 节点标签文字，支持内联双击编辑                                                           |
| type               | `"page" \| "board"` | 否   | -      | 节点类型，"page" 渲染为页面缩略图样式（高 130px），"board" 渲染为列表图标样式（高 70px） |
| external           | `ExtraNodeData`     | 否   | -      | 外部链接节点数据，仅 type="page" 时显示，点击触发 external.click 事件                    |
| subNodes           | `ExtraNodeData[]`   | 否   | -      | 子节点列表，仅 type="page" 时显示，每个子节点可双击和右键操作                            |
| active             | `boolean`           | 否   | -      | 是否为当前激活节点，仅控制 CSS 样式（render: false），不触发重新渲染                     |
| notSynced          | `boolean`           | 否   | -      | 是否标记为未同步状态，仅控制 CSS 样式（render: false），不触发重新渲染                   |
| disableChildAppend | `boolean`           | 否   | -      | 是否禁用追加子节点按钮，仅控制 CSS 样式（render: false），不触发重新渲染                 |
| autoFocusOnce      | `string`            | 否   | -      | 自动聚焦标识符，设置后节点首次挂载时会自动进入标签编辑模式，同一标识符只触发一次         |

## Events

| 事件                 | detail                                                                                                                | 说明                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| onLabelEditingChange | `boolean` — 当前标签是否正在编辑                                                                                      | 节点标签编辑状态变化时触发     |
| onLabelChange        | `string` — 编辑完成后的新标签文字                                                                                     | 节点标签编辑完成（失焦）后触发 |
| onNodeClick          | `void`                                                                                                                | 点击节点主体区域时触发         |
| onNodeDblclick       | `void`                                                                                                                | 双击节点主体区域时触发         |
| onNodeContextmenu    | `ContextMenuDetail` — { clientX: 鼠标 X 坐标, clientY: 鼠标 Y 坐标 }                                                  | 在节点上触发右键菜单时触发     |
| onChildAppend        | `void`                                                                                                                | 点击节点的添加子节点按钮时触发 |
| onExternalClick      | `ExtraNodeData` — { id: 外链节点 ID, label: 外链节点标签 }                                                            | 点击节点的外链区域时触发       |
| onSubNodeDblclick    | `ExtraNodeData` — { id: 子节点 ID, label: 子节点标签 }                                                                | 双击子节点时触发               |
| onSubNodeContextmenu | `SubNodeContextMenuData` — { node: { id: 子节点 ID, label: 子节点标签 }, clientX: 鼠标 X 坐标, clientY: 鼠标 Y 坐标 } | 在子节点上触发右键菜单时触发   |

## Examples

### Basic

展示页面架构图节点的基本用法，包含节点标签和页面类型。

```tsx
<WrappedVisualBuilderPageArchNode label="名称" type="page" />
```

### Board Type

展示看板类型节点，渲染为带列表图标的简洁样式。

```tsx
<WrappedVisualBuilderPageArchNode label="看板视图" type="board" />
```

### With SubNodes

展示包含子节点的页面节点，子节点以骨架屏样式列于节点内部。

```tsx
<WrappedVisualBuilderPageArchNode
  label="列表"
  type="page"
  subNodes={[{ label: "详情", id: "detail" }]}
/>
```

### With External Link

展示带外链节点的页面节点，外链区域可点击触发跳转事件。

```tsx
<WrappedVisualBuilderPageArchNode
  label="主机列表"
  type="page"
  external={{ id: "host-detail", label: "主机详情" }}
  subNodes={[
    { label: "IP 列", id: "ip-col" },
    { label: "主机名列", id: "hostname-col" },
  ]}
  onLabelChange={(e) => console.log(e.detail)}
  onNodeClick={(e) => console.log(e.detail)}
  onChildAppend={(e) => console.log(e.detail)}
  onExternalClick={(e) => console.log(e.detail)}
  onSubNodeDblclick={(e) => console.log(e.detail)}
  onSubNodeContextmenu={(e) => console.log(e.detail)}
  onNodeContextmenu={(e) => console.log(e.detail)}
/>
```
