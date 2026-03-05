---
tagName: ai-portal.stage-flow
displayName: WrappedAiPortalStageFlow
description: 阶段流程编辑器构件，支持以泳道方式展示和编辑服务流的阶段与活动。
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalStageFlow

> 阶段流程编辑器构件，支持以泳道方式展示和编辑服务流的阶段与活动。

## 导入

```tsx
import { WrappedAiPortalStageFlow } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型           | 必填 | 默认值 | 说明                                             |
| ----------- | -------------- | ---- | ------ | ------------------------------------------------ |
| spec        | `Stage[]`      | 否   | -      | 阶段流程配置数据，每个阶段包含名称和活动列表     |
| aiEmployees | `AIEmployee[]` | 否   | -      | AI 员工列表，用于在活动中显示分配的员工名称      |
| readOnly    | `boolean`      | 否   | -      | 是否为只读模式，只读时不显示编辑、添加、删除操作 |

## Events

| 事件           | detail                                                                                  | 说明                       |
| -------------- | --------------------------------------------------------------------------------------- | -------------------------- |
| onChange       | `Stage[]` — 更新后的阶段列表                                                            | 流程阶段数据发生变化时触发 |
| onAddActivity  | `{ stage: Stage }` — { stage: 所属阶段数据 }                                            | 点击添加活动按钮时触发     |
| onEditActivity | `EditActivityDetail` — { stage: 所属阶段, activity: 活动数据, activityIndex: 活动索引 } | 点击活动进行编辑时触发     |

## Methods

| 方法           | 参数                                                                    | 返回值 | 说明                     |
| -------------- | ----------------------------------------------------------------------- | ------ | ------------------------ |
| addActivity    | `(stage: Stage, activity: FlowActivity) => void`                        | `void` | 向指定阶段添加活动       |
| editActivity   | `(stage: Stage, activity: FlowActivity, activityIndex: number) => void` | `void` | 编辑指定阶段中的某个活动 |
| deleteActivity | `(stage: Stage, activityIndex: number) => void`                         | `void` | 删除指定阶段中的某个活动 |

## Examples

### 基础使用

以泳道方式展示服务流的阶段和活动，支持分配 AI 员工。

```tsx
<WrappedAiPortalStageFlow
  spec={[
    {
      name: "Requirement",
      serviceFlowActivities: [
        { name: "Requirement collects", aiEmployeeId: "employee-001" },
        { name: "Requirement documents", aiEmployeeId: "employee-001" },
      ],
    },
    { name: "Sprint Planning" },
  ]}
  aiEmployees={[{ employeeId: "employee-001", name: "Samuel" }]}
  onChange={(e) => console.log("流程变更:", e.detail)}
  onAddActivity={(e) => console.log("添加活动:", e.detail)}
  onEditActivity={(e) => console.log("编辑活动:", e.detail)}
/>
```

### 只读模式

设置 readOnly 后不显示编辑、添加、删除操作。

```tsx
<WrappedAiPortalStageFlow
  readOnly={true}
  spec={[
    {
      name: "需求阶段",
      serviceFlowActivities: [
        { name: "需求收集", aiEmployeeId: "employee-001" },
        { name: "需求评审", aiEmployeeId: "employee-002" },
      ],
    },
    {
      name: "开发阶段",
      serviceFlowActivities: [
        { name: "编码实现", aiEmployeeId: "employee-001" },
      ],
    },
  ]}
  aiEmployees={[
    { employeeId: "employee-001", name: "Alice" },
    { employeeId: "employee-002", name: "Bob" },
  ]}
/>
```

### 使用方法调用

通过 ref 调用方法动态添加、编辑、删除活动。

```tsx
const ref = useRef<any>();

<WrappedAiPortalStageFlow
  ref={ref}
  spec={[{ name: "阶段一", serviceFlowActivities: [{ name: "活动A" }] }]}
  onChange={(e) => console.log(e.detail)}
/>
<button onClick={() => ref.current?.addActivity({ name: "阶段一" }, { name: "新活动B" })}>
  添加活动
</button>
```
