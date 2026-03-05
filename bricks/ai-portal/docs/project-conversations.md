---
tagName: ai-portal.project-conversations
displayName: WrappedAiPortalProjectConversations
description: 项目会话列表构件，展示项目中的会话记录，支持目标分类、操作菜单。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.project-conversations

> 项目会话列表构件，展示项目中的会话记录，支持目标分类、操作菜单。

## Props

| 属性        | 类型             | 必填 | 默认值 | 说明                                                                         |
| ----------- | ---------------- | ---- | ------ | ---------------------------------------------------------------------------- |
| list        | `Conversation[]` | 否   | -      | 会话列表数据，为 undefined 时显示加载状态                                    |
| urlTemplate | `string`         | 否   | -      | 会话详情链接模板，支持使用会话字段插值，如 /conversations/{{conversationId}} |
| actions     | `ActionType[]`   | 否   | -      | 操作菜单配置，每项会话行尾显示可操作的菜单项                                 |
| goals       | `Goal[]`         | 否   | -      | 目标列表，用于显示会话关联的目标名称                                         |

## Events

| 事件         | detail                                                                                                        | 说明                         |
| ------------ | ------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| goal.click   | `Conversation` — { conversationId: 会话ID, title: 会话标题, startTime: 开始时间, goalInstanceId: 目标实例ID } | 点击会话关联的目标标签时触发 |
| action.click | `ActionClickDetail` — { action: 操作项配置, item: 所属会话数据 }                                              | 点击操作菜单项时触发         |

## Examples

### 基础使用

展示会话列表，当 list 为 undefined 时显示加载态。

```yaml preview
brick: ai-portal.project-conversations
properties:
  list:
    - conversationId: "conv-a"
      title: 标题一
      description: 这是一段描述
      startTime: 1757904096
    - conversationId: "conv-b"
      title: 标题二
      startTime: 1757863597
```

### 带目标分类

配置 goals 后会话卡片会显示关联的目标名称标签。

```yaml preview
brick: ai-portal.project-conversations
properties:
  goals:
    - instanceId: "GOAL0001"
      title: "提升研发效率"
    - instanceId: "GOAL0002"
      title: "降低故障率"
  list:
    - conversationId: "conv-a"
      title: 关联目标的会话
      startTime: 1757904096
      goalInstanceId: "GOAL0001"
    - conversationId: "conv-b"
      title: 全局会话（无目标）
      startTime: 1757863597
```

### 带操作菜单

配置 actions 后每行显示可操作的菜单项。

```yaml preview
brick: ai-portal.project-conversations
properties:
  actions:
    - text: "删除"
      event: "delete"
      icon:
        lib: "antd"
        icon: "delete"
  list:
    - conversationId: "conv-a"
      title: 会话标题一
      description: 这是一段描述
      startTime: 1757904096
      username: "alice"
    - conversationId: "conv-b"
      title: 会话标题二
      startTime: 1757863597
events:
  action.click:
    action: console.log
    args:
      - "操作点击:"
      - "<% EVENT.detail %>"
```

### 加载状态

list 为 undefined 时显示加载中状态。

```yaml preview
brick: ai-portal.project-conversations
```
