---
tagName: ai-portal.running-flow
displayName: WrappedAiPortalRunningFlow
description: 运行中的流程视图构件，以泳道方式展示各阶段的活动及其运行状态。
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalRunningFlow

> 运行中的流程视图构件，以泳道方式展示各阶段的活动及其运行状态（completed、working、input-required 等）。

## 导入

```tsx
import { WrappedAiPortalRunningFlow } from "@easyops/wrapped-components";
```

## Props

| 属性 | 类型          | 必填 | 默认值 | 说明                                         |
| ---- | ------------- | ---- | ------ | -------------------------------------------- |
| spec | `FlowStage[]` | 否   | -      | 流程阶段配置数据，每个阶段包含名称和活动列表 |

## Events

| 事件            | detail                   | 说明                                       |
| --------------- | ------------------------ | ------------------------------------------ |
| onActivityClick | `string` — 活动的 taskId | 点击活动时触发，仅当活动有 taskId 时可触发 |

## Examples

### 基础使用

以泳道方式展示多阶段流程及各活动状态。

```tsx
<WrappedAiPortalRunningFlow
  spec={[
    {
      name: "Requirement",
      serviceFlowActivities: [
        { name: "Requirement collects", state: "completed" },
        { name: "Requirement documents", state: "input-required" },
      ],
    },
    {
      name: "Sprint Planning",
      serviceFlowActivities: [
        { name: "planning", state: "working" },
        { name: "sprinting" },
      ],
    },
  ]}
/>
```

### 带点击事件

配置 taskId 后活动可点击，点击时触发 onActivityClick 事件。

```tsx
<WrappedAiPortalRunningFlow
  spec={[
    {
      name: "需求阶段",
      serviceFlowActivities: [
        {
          name: "需求收集",
          taskId: "task-001",
          state: "completed",
          startTime: 1757800000,
          endTime: 1757810000,
        },
        {
          name: "需求评审",
          taskId: "task-002",
          state: "working",
          startTime: 1757810000,
        },
      ],
    },
    {
      name: "开发阶段",
      serviceFlowActivities: [{ name: "编码实现", taskId: "task-003" }],
    },
  ]}
  onActivityClick={(e) => console.log("活动点击，taskId:", e.detail)}
/>
```
