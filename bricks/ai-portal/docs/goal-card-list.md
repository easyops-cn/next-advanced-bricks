---
tagName: ai-portal.goal-card-list
displayName: WrappedAiPortalGoalCardList
description: 目标卡片列表，以分层卡片形式展示目标项，支持内联编辑标题、状态切换、新建对话及追加子目标。
category: display-component
source: "@next-bricks/ai-portal"
---

# ai-portal.goal-card-list

> 目标卡片列表，以分层卡片形式展示目标项，支持内联编辑标题、状态切换、新建对话及追加子目标。

## Props

| 属性      | 类型                  | 必填 | 默认值 | 说明                                                      |
| --------- | --------------------- | ---- | ------ | --------------------------------------------------------- |
| goalList  | `GoalItem[]`          | 否   | -      | 目标列表数据，支持多层级（通过 `level` 字段区分父子层级） |
| cardStyle | `React.CSSProperties` | 否   | -      | 卡片的自定义样式                                          |
| activeKey | `string`              | 否   | -      | 当前激活卡片的 instanceId，匹配的卡片会高亮显示           |

## Events

| 事件               | detail                                                                                               | 说明                             |
| ------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| item.click         | `GoalItem` — { title: 目标标题, state: 目标状态, id: 序号, instanceId: 实例ID, level: 层级 }         | 点击目标卡片时触发               |
| item.status.change | `GoalItem` — { title: 目标标题, state: 更新后的目标状态, id: 序号, instanceId: 实例ID, level: 层级 } | 目标状态切换时触发               |
| item.title.change  | `GoalItem` — { title: 更新后的标题, state: 目标状态, id: 序号, instanceId: 实例ID, level: 层级 }     | 目标标题内联编辑完成时触发       |
| item.new.chat      | `GoalItem` — { title: 目标标题, state: 目标状态, id: 序号, instanceId: 实例ID, level: 层级 }         | 点击目标卡片的新建对话按钮时触发 |

## Methods

| 方法            | 参数                                             | 返回值 | 说明                         |
| --------------- | ------------------------------------------------ | ------ | ---------------------------- |
| appendChildDone | `(pendingId: string, newItem: GoalItem) => void` | `void` | 将待定子目标提交为正式目标项 |

## Examples

### Basic

展示基础目标卡片列表，包含多种状态的目标项。

```yaml preview
brick: ai-portal.goal-card-list
properties:
  style:
    width: 600px
  goalList:
    - title: 页面流程绘制
      id: 100124
      state: ready
      instanceId: abc1
      level: 0
    - title: 原型与设计绘制
      id: 100125
      state: working
      instanceId: bdc9
      level: 0
    - title: 设计稿绘制
      id: 100126
      state: completed
      instanceId: d76a
      level: 0
events:
  item.click:
    action: "console.log"
  item.status.change:
    action: "console.log"
  item.title.change:
    action: "console.log"
  item.new.chat:
    action: "console.log"
```

### With Active Item

配置 activeKey 高亮激活当前选中的目标卡片。

```yaml preview
brick: ai-portal.goal-card-list
properties:
  style:
    width: 600px
  activeKey: bdc9
  goalList:
    - title: 页面流程绘制
      id: 100124
      state: ready
      instanceId: abc1
      level: 0
    - title: 原型与设计绘制
      id: 100125
      state: working
      instanceId: bdc9
      level: 0
    - title: 设计稿绘制
      id: 100126
      state: completed
      instanceId: d76a
      level: 0
events:
  item.click:
    action: "console.log"
```

### Hierarchical Goals

展示多层级目标，子目标通过 level 字段缩进显示。

```yaml preview
brick: ai-portal.goal-card-list
properties:
  style:
    width: 600px
  goalList:
    - title: 产品研发
      id: 1001
      state: working
      instanceId: parent1
      level: 0
    - title: 需求分析
      id: 1002
      state: completed
      instanceId: child1
      level: 1
    - title: UI 设计
      id: 1003
      state: working
      instanceId: child2
      level: 1
    - title: 数据架构
      id: 1004
      state: ready
      instanceId: parent2
      level: 0
events:
  item.click:
    action: "console.log"
  item.status.change:
    action: "console.log"
```

### Custom Card Style

为卡片配置自定义样式。

```yaml preview
brick: ai-portal.goal-card-list
properties:
  cardStyle:
    borderRadius: 8px
    marginBottom: 8px
  style:
    width: 600px
  goalList:
    - title: 前端架构升级
      id: 2001
      state: ready
      instanceId: item1
      level: 0
    - title: 性能优化
      id: 2002
      state: working
      instanceId: item2
      level: 0
events:
  item.click:
    action: "console.log"
  item.new.chat:
    action: "console.log"
```
