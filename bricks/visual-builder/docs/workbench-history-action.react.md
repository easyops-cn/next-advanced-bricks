---
tagName: visual-builder.workbench-history-action
displayName: WrappedVisualBuilderWorkbenchHistoryAction
description: 项目变更历史
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderWorkbenchHistoryAction

> 项目变更历史

## 导入

```tsx
import { WrappedVisualBuilderWorkbenchHistoryAction } from "@easyops/wrapped-components";
```

## Props

| 属性      | 类型     | 必填 | 默认值 | 说明    |
| --------- | -------- | ---- | ------ | ------- |
| appId     | `string` | 是   | -      | 应用 ID |
| projectId | `string` | 是   | -      | 项目 ID |

## Events

| 事件               | detail                                                                                                                     | 说明               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| onHistoryItemClick | `HistoryData & { enableRollback: boolean }` — { enableRollback: 是否可回滚, action: 操作类型, user: 操作用户, ts: 时间戳 } | 点击历史项标题触发 |
| onRollback         | `HistoryData` — { action: 操作类型, user: 操作用户, ts: 时间戳 }                                                           | 点击回滚触发       |
| onRollbackAll      | `void`                                                                                                                     | 点击全部回滚触发   |

## Slots

| 名称      | 说明                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| (default) | 放置 modal 等弹层构件，使其成为 popover 的子内容，防止操作弹层时意外关闭 popover |

## Examples

### Basic

显示项目变更历史弹窗，支持查看历史记录和回滚操作。

```tsx
<WrappedVisualBuilderWorkbenchHistoryAction
  appId="project-a"
  projectId="proj-001"
  onHistoryItemClick={(e) => console.log(e.detail)}
  onRollback={(e) => console.log(e.detail)}
  onRollbackAll={() => console.log("rollback all")}
/>
```
