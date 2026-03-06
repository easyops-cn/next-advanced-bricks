---
tagName: ai-portal.ai-agents
displayName: WrappedAiPortalAiAgents
description: AI Agents 卡片列表，展示可用的 AI 智能体，支持点击跳转到对应详情页。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalAiAgents

> AI Agents 卡片列表，展示可用的 AI 智能体，支持点击跳转到对应详情页。

## 导入

```tsx
import { WrappedAiPortalAiAgents } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型                   | 必填 | 默认值 | 说明                                                          |
| ----------- | ---------------------- | ---- | ------ | ------------------------------------------------------------- |
| list        | `Agent[] \| undefined` | 否   | -      | AI Agent 列表数据                                             |
| urlTemplate | `string \| undefined`  | 否   | -      | 跳转到 Agent 详情页的 URL 模板，支持 {name} 等 Agent 字段插值 |

## Examples

### Basic

展示 AI Agents 卡片列表的基本用法。

```tsx
<WrappedAiPortalAiAgents
  list={[
    {
      name: "运维专家",
      description: "擅长处理服务器运维、故障排查和性能优化等问题。",
      icon: { lib: "antd", icon: "tool" },
      tags: ["运维", "故障排查"],
    },
    {
      name: "数据分析师",
      description: "专注于数据处理、报表生成和趋势分析。",
      icon: { lib: "antd", icon: "bar-chart" },
      tags: ["数据", "分析"],
    },
  ]}
/>
```

### With URL Template

配置 urlTemplate 属性，使每个 Agent 卡片点击后跳转到对应详情页。

```tsx
<WrappedAiPortalAiAgents
  urlTemplate="/agents/{name}"
  list={[
    {
      name: "运维专家",
      description: "擅长处理服务器运维、故障排查和性能优化等问题。",
      icon: { lib: "antd", icon: "tool" },
      tags: ["运维"],
    },
    {
      name: "数据分析师",
      description: "专注于数据处理、报表生成和趋势分析。",
      icon: { lib: "antd", icon: "bar-chart" },
      tags: ["数据"],
    },
  ]}
/>
```
