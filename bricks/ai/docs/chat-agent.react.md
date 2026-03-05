---
tagName: ai.chat-agent
displayName: WrappedAiChatAgent
description: 用于与 AI 机器人进行对话的代理构件，处理通信并整合消息。
category: ai
source: "@next-bricks/ai"
---

# WrappedAiChatAgent

> 用于与 AI 机器人进行对话的代理构件，处理通信并整合消息。

## 导入

```tsx
import { WrappedAiChatAgent } from "@easyops/wrapped-components";
```

## Props

| 属性                     | 类型      | 必填 | 默认值 | 说明                                                             |
| ------------------------ | --------- | ---- | ------ | ---------------------------------------------------------------- |
| agentId                  | `string`  | 否   | -      | 智能体 ID                                                        |
| robotId                  | `string`  | 否   | -      | 机器人 ID                                                        |
| conversationId           | `string`  | 否   | -      | 会话 ID，用于延续历史会话                                        |
| alwaysUseNewConversation | `boolean` | 否   | -      | 是否每次请求都使用新会话，设为 true 时每次发消息不会延续历史会话 |

## Events

| 事件                   | detail                                              | 说明                                                              |
| ---------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| onMessagesUpdate       | `Message[]` — 当前全部消息列表                      | 消息列表更新时触发                                                |
| onBusyChange           | `boolean` — 当前忙碌状态                            | 忙碌状态变化时触发，true 表示正在等待 AI 响应，false 表示响应完成 |
| onConversationIdChange | `string \| null` — 新的会话 ID，开启新会话时为 null | 会话 ID 变化时触发                                                |

## Methods

| 方法                | 参数                                                                                              | 返回值 | 说明                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------- |
| postMessage         | `(content: string) => void`                                                                       | `void` | 发送消息到默认的聊天 API                                                         |
| sendRequest         | `(leadingMessages: string \| BaseMessage[], url: string, options: Options<MessageChunk>) => void` | `void` | 发送聊天请求到指定的 URL                                                         |
| lowLevelSendRequest | `(leadingMessages: string \| BaseMessage[], url: string, options: Options<MessageChunk>) => void` | `void` | 发送底层聊天请求到指定的 URL。接口的请求和响应的数据结构和 OpenAI 聊天接口一致。 |
| newConversation     | `() => void`                                                                                      | `void` | 开启新会话，清空当前消息列表并重置会话状态                                       |

## Examples

### Basic

使用默认聊天接口发送消息，监听消息列表更新和忙碌状态变化。

```tsx
<WrappedAiChatAgent
  agentId="my-agent-id"
  robotId="my-robot-id"
  onMessagesUpdate={(e) => console.log("messages", e.detail)}
  onBusyChange={(e) => console.log("busy", e.detail)}
/>
```

### Conversation Management

通过方法调用控制会话，包括发送消息和开启新会话。

```tsx
const ref = useRef<any>();

<>
  <WrappedAiChatAgent
    ref={ref}
    agentId="my-agent-id"
    robotId="my-robot-id"
    onMessagesUpdate={(e) => console.log(e.detail)}
    onConversationIdChange={(e) =>
      console.log("conversationId changed", e.detail)
    }
  />
  <button onClick={() => ref.current?.postMessage("你好，请介绍一下自己")}>
    发送消息
  </button>
  <button onClick={() => ref.current?.newConversation()}>开启新会话</button>
</>;
```

### Always New Conversation

每次发送消息都使用新会话，不延续历史上下文。

```tsx
<WrappedAiChatAgent
  agentId="my-agent-id"
  robotId="my-robot-id"
  alwaysUseNewConversation={true}
  onMessagesUpdate={(e) => console.log(e.detail)}
/>
```
