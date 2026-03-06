---
tagName: ai-portal.project-knowledges
displayName: WrappedAiPortalProjectKnowledges
description: 项目知识库列表构件，展示项目中的知识条目，支持操作菜单和点击跳转。
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalProjectKnowledges

> 项目知识库列表构件，展示项目中的知识条目，支持操作菜单和点击跳转。

## 导入

```tsx
import { WrappedAiPortalProjectKnowledges } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型           | 必填 | 默认值 | 说明                                         |
| ----------- | -------------- | ---- | ------ | -------------------------------------------- |
| list        | `Knowledge[]`  | 否   | -      | 知识列表数据，为 undefined 时显示加载状态    |
| urlTemplate | `string`       | 否   | -      | 知识详情链接模板，支持使用知识字段插值       |
| actions     | `ActionType[]` | 否   | -      | 操作菜单配置，每条知识行尾显示可操作的菜单项 |

## Events

| 事件          | detail                                                                                              | 说明                 |
| ------------- | --------------------------------------------------------------------------------------------------- | -------------------- |
| onActionClick | `ActionClickDetail` — { action: 操作项配置, item: 所属知识数据 }                                    | 点击操作菜单项时触发 |
| onItemClick   | `Knowledge` — { instanceId: 知识ID, name: 知识名称, description: 描述, time: 时间戳, user: 创建人 } | 点击知识条目时触发   |

## Examples

### 基础使用

展示知识库列表，当 list 为 undefined 时显示加载态。

```tsx
<WrappedAiPortalProjectKnowledges
  list={[
    {
      instanceId: "knowledge-a",
      name: "服务器排查手册",
      description: "包含常见服务器故障的排查步骤",
      time: 1757904096,
      user: "alice",
    },
    { instanceId: "knowledge-b", name: "数据库优化指南", time: 1757863597 },
  ]}
/>
```

### 带操作菜单

配置 actions 后每条知识行尾显示可操作的菜单项。

```tsx
<WrappedAiPortalProjectKnowledges
  actions={[
    { text: "删除", event: "delete", icon: { lib: "antd", icon: "delete" } },
  ]}
  list={[
    {
      instanceId: "knowledge-a",
      name: "服务器排查手册",
      description: "包含常见服务器故障的排查步骤",
      time: 1757904096,
      user: "alice",
    },
    { instanceId: "knowledge-b", name: "数据库优化指南", time: 1757863597 },
  ]}
  onActionClick={(e) => console.log("操作点击:", e.detail)}
  onItemClick={(e) => console.log("知识点击:", e.detail)}
/>
```

### 加载状态

list 为 undefined 时显示加载中状态。

```tsx
<WrappedAiPortalProjectKnowledges />
```
