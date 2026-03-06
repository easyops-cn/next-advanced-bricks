---
tagName: ai-portal.gantt-chart
displayName: WrappedAiPortalGanttChart
description: 甘特图组件，以树状层级结构展示任务节点及其时间条，支持折叠展开和全屏操作。
category: chart
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalGanttChart

> 甘特图组件，以树状层级结构展示任务节点及其时间条，支持折叠展开和全屏操作。

## 导入

```tsx
import { WrappedAiPortalGanttChart } from "@easyops/wrapped-components";
```

## Props

| 属性       | 类型          | 必填 | 默认值 | 说明                                                     |
| ---------- | ------------- | ---- | ------ | -------------------------------------------------------- |
| chartTitle | `string`      | 否   | -      | 甘特图标题                                               |
| nodes      | `GanttNode[]` | 否   | -      | 任务节点树数据，每个节点包含名称、状态、时间范围及子节点 |

## Events

| 事件              | detail                                                                                                              | 说明                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------- |
| onNodeClick       | `GanttNode` — { name: 节点名称, state: 节点状态, startTime: 开始时间戳, endTime: 结束时间戳, children: 子节点列表 } | 点击甘特图节点时触发 |
| onFullscreenClick | `void`                                                                                                              | 点击全屏按钮时触发   |

## Examples

### Basic

展示基础甘特图，包含父子任务节点和时间条。

```tsx
<WrappedAiPortalGanttChart
  chartTitle="项目执行计划"
  nodes={[
    {
      name: "需求分析",
      state: "completed",
      startTime: 1700000000000,
      endTime: 1700200000000,
      children: [
        {
          name: "业务需求梳理",
          state: "completed",
          startTime: 1700000000000,
          endTime: 1700100000000,
        },
        {
          name: "技术方案评审",
          state: "completed",
          startTime: 1700100000000,
          endTime: 1700200000000,
        },
      ],
    },
    {
      name: "开发阶段",
      state: "working",
      startTime: 1700200000000,
      endTime: 1700600000000,
      children: [
        {
          name: "后端开发",
          state: "working",
          startTime: 1700200000000,
          endTime: 1700500000000,
        },
        {
          name: "前端开发",
          state: "ready",
          startTime: 1700300000000,
          endTime: 1700600000000,
        },
      ],
    },
    {
      name: "测试上线",
      state: "ready",
      startTime: 1700600000000,
      endTime: 1700800000000,
    },
  ]}
  onNodeClick={(e) => console.log(e.detail)}
  onFullscreenClick={(e) => console.log(e.detail)}
/>
```

### Simple Flat Nodes

展示无子节点的平铺任务甘特图。

```tsx
<WrappedAiPortalGanttChart
  chartTitle="迭代任务"
  nodes={[
    {
      name: "任务 A",
      state: "completed",
      startTime: 1700000000000,
      endTime: 1700150000000,
    },
    {
      name: "任务 B",
      state: "working",
      startTime: 1700150000000,
      endTime: 1700400000000,
    },
    {
      name: "任务 C",
      state: "ready",
      startTime: 1700400000000,
      endTime: 1700600000000,
    },
  ]}
  onNodeClick={(e) => console.log(e.detail)}
  onFullscreenClick={(e) => console.log(e.detail)}
/>
```
