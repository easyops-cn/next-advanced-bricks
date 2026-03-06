---
tagName: ai-portal.activity-timeline
displayName: WrappedAiPortalActivityTimeline
description: 活动时间线，展示目标的操作历史记录，支持多种动作类型的可视化展示。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalActivityTimeline

> 活动时间线，展示目标的操作历史记录，支持多种动作类型的可视化展示。

## 导入

```tsx
import { WrappedAiPortalActivityTimeline } from "@easyops/wrapped-components";
```

## Props

| 属性            | 类型                      | 必填 | 默认值 | 说明                                                                   |
| --------------- | ------------------------- | ---- | ------ | ---------------------------------------------------------------------- |
| list            | `Activity[] \| undefined` | 否   | -      | 活动记录列表                                                           |
| chatUrlTemplate | `string \| undefined`     | 否   | -      | 跳转到对话详情页的 URL 模板，支持 {conversation_id} 等活动记录字段插值 |

## Examples

### Basic

展示活动时间线的基本用法，渲染包含多种动作类型的操作历史记录。

```tsx
<WrappedAiPortalActivityTimeline
  list={[
    {
      user_id: "u001",
      user_name: "Tom",
      action_type: "create_goal",
      time: 1757853597,
    },
    {
      user_id: "u001",
      user_name: "Tom",
      action_type: "alter_owner",
      time: 1757863597,
      metadata: { after: { owner: { user_name: "Lucy" } } },
    },
    {
      user_id: "u002",
      user_name: "Lucy",
      action_type: "start_conversation",
      time: 1757904096,
      metadata: { conversation_id: "c001", conversation_title: "项目规划" },
    },
    {
      user_id: "u002",
      user_name: "Lucy",
      action_type: "decompose_goals",
      time: 1757904096,
      metadata: {
        sub_goals_count: 2,
        sub_goals: [{ title: "先计划" }, { title: "再执行" }],
      },
    },
    {
      user_id: "u002",
      user_name: "Lucy",
      action_type: "alter_user",
      time: 1757904096,
      metadata: {
        before: { users: [{ user_name: "Jim" }] },
        after: { users: [{ user_name: "Joy" }, { user_name: "Green" }] },
      },
    },
    {
      user_id: "u001",
      user_name: "Tom",
      action_type: "add_comment",
      time: 1757904096,
      metadata: { comment_content: "Good!" },
    },
  ]}
/>
```

### With Chat URL Template

配置 chatUrlTemplate 属性，使对话链接可点击跳转。

```tsx
<WrappedAiPortalActivityTimeline
  chatUrlTemplate="/chat/{conversation_id}"
  list={[
    {
      user_id: "u002",
      user_name: "Lucy",
      action_type: "start_conversation",
      time: 1757904096,
      metadata: { conversation_id: "c001", conversation_title: "项目规划" },
    },
    {
      user_id: "u001",
      user_name: "Tom",
      action_type: "create_goal",
      time: 1757853597,
    },
  ]}
/>
```
