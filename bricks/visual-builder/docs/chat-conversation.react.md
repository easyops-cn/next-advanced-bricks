---
tagName: visual-builder.chat-conversation
displayName: WrappedVisualBuilderChatConversation
description: 用于 Visual Builder 的智能聊天对话列表，解析 AI 回复中的 Storyboard 代码块并触发更新事件
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderChatConversation

> 用于 Visual Builder 的智能聊天对话列表，解析 AI 回复中的 Storyboard 代码块并触发更新事件

## 导入

```tsx
import { WrappedVisualBuilderChatConversation } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型        | 必填 | 默认值 | 说明                                                                            |
| ------------- | ----------- | ---- | ------ | ------------------------------------------------------------------------------- |
| messages      | `Message[]` | 否   | -      | 对话消息列表，包含用户和 AI 助手的消息，支持流式（partial）和失败（failed）状态 |
| errorBoundary | `boolean`   | 否   | -      | 是否为解析出的砖块启用错误边界，防止单个砖块异常导致整个预览崩溃                |

## Events

| 事件               | detail                               | 说明                                     |
| ------------------ | ------------------------------------ | ---------------------------------------- |
| onStoryboardUpdate | `BrickConf[]` — 解析出的砖块配置列表 | 从 AI 回复中解析出新的 Storyboard 时触发 |

## Examples

### Basic

展示包含用户消息和 AI 回复的完整对话列表，AI 回复中嵌入了 Storyboard 代码块。

```tsx
<WrappedVisualBuilderChatConversation
  messages={[
    {
      role: "user",
      content: "生成一个主机列表页面",
      key: 1,
    },
    {
      role: "assistant",
      content: "好的，我们来逐步确认页面的各个区块需求。",
      key: 2,
    },
    {
      role: "user",
      content: "列表区展示每条主机的IP、主机名、运营状态、创建时间。",
      key: 3,
    },
    {
      role: "assistant",
      content: "了解了您的需求，正在生成页面...",
      key: 4,
      partial: true,
    },
  ]}
  onStoryboardUpdate={(e) => console.log(e.detail)}
/>
```

### Errors

展示包含失败消息的对话，failed 状态的消息会以错误样式展示。

```tsx
<WrappedVisualBuilderChatConversation
  messages={[
    {
      role: "user",
      content: "Create a page to show server host list.",
      key: 1,
    },
    {
      role: "assistant",
      content: "OK, let's do it",
      key: 2,
      failed: true,
    },
    {
      role: "assistant",
      content: "Internal Server Error",
      key: 3,
      failed: true,
    },
  ]}
/>
```

### With Error Boundary

启用错误边界后，单个砖块渲染失败不会导致整个预览崩溃。

```tsx
<WrappedVisualBuilderChatConversation
  errorBoundary={true}
  messages={[
    {
      role: "user",
      content: "生成一个简单页面",
      key: 1,
    },
    {
      role: "assistant",
      content: "好的，正在生成...",
      key: 2,
    },
  ]}
/>
```
