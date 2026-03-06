---
tagName: ai.chat-view
displayName: WrappedAiChatView
description: AI 对话终端
category: ai
source: "@next-bricks/ai"
---

# ai.chat-view

> AI 对话终端

## Props

| 属性              | 类型                | 必填 | 默认值  | 说明                                                               |
| ----------------- | ------------------- | ---- | ------- | ------------------------------------------------------------------ |
| agentId           | `string`            | 是   | -       | 智能体id                                                           |
| robotId           | `string`            | 是   | -       | 机器人id                                                           |
| sessionId         | `string`            | 否   | -       | 当前会话 ID                                                        |
| answerLanguage    | `string`            | 否   | -       | 指定智能体回答代码时所使用的语言                                   |
| debug             | `boolean`           | 否   | -       | 是否为debug模式                                                    |
| showAvatar        | `boolean`           | 否   | `true`  | 是否展示对话用户头像                                               |
| showSessionList   | `boolean`           | 否   | `true`  | 是否展示历史会话信息                                               |
| readonly          | `boolean`           | 否   | -       | 只读模式                                                           |
| showLike          | `boolean`           | 否   | `true`  | 是否展示点赞能力                                                   |
| showShare         | `boolean`           | 否   | `true`  | 是否展示分享能力                                                   |
| useSpiltWord      | `boolean`           | 否   | `false` | 是否开启前端分词                                                   |
| enterInterval     | `number`            | 否   | `50`    | 输入间隔，设置为 -1 使用新的方式对大段消息进行模拟打字效果节流输出 |
| quickAnswerConfig | `QuickAnswerConfig` | 否   | -       | 快速入口列表                                                       |
| snippetList       | `snippet[]`         | 否   | -       | 常用语列表                                                         |
| commandBricks     | `commandBrickConf`  | 否   | -       | 自定义语言配置                                                     |
| inputToolbarBrick | `InputToolbarBrick` | 否   | -       | 输入框工具栏 useBrick                                              |
| showToolCalls     | `boolean`           | 否   | -       | 是否显示工具调用过程                                               |

## Events

| 事件             | detail                                          | 说明                                                 |
| ---------------- | ----------------------------------------------- | ---------------------------------------------------- |
| sessionId.change | `string \| undefined` — 当前激活的会话 ID       | 会话 ID 变化时触发                                   |
| robotId.change   | `string \| undefined` — 当前会话对应的机器人 ID | 机器人 ID 变化时触发（切换会话时可能切换对应机器人） |
| qa.finish        | `string \| undefined` — 当前激活的会话 ID       | 一次问答完成时触发（chatting 从 true 变为 false 时） |

## Methods

| 方法           | 参数                                                       | 返回值 | 说明                                       |
| -------------- | ---------------------------------------------------------- | ------ | ------------------------------------------ |
| setConfig      | `(config: Record<string, unknown> \| undefined) => void`   | `void` | 设置接口 config                            |
| setFormData    | `(formData: Record<string, unknown> \| undefined) => void` | `void` | 设置接口 formData                          |
| insertQuestion | `(args: { value: string }) => void`                        | `void` | 调用方法进行提问，将内容插入输入框并发送   |
| sendMsg        | `(msg: string \| ChatBody) => void`                        | `void` | 外部发起提问，直接发送消息不经过输入框交互 |

## Examples

### Basic

基础对话终端，展示历史会话列表和对话消息。

```yaml preview
brick: ai.chat-view
properties:
  agentId: my-agent-id
  robotId: my-robot-id
  showAvatar: true
  showSessionList: true
  showLike: true
  showShare: true
events:
  sessionId.change:
    - action: console.log
      args:
        - sessionId changed
        - <% EVENT.detail %>
  qa.finish:
    - action: console.log
      args:
        - qa finished
        - <% EVENT.detail %>
```

### Readonly Mode

只读模式，隐藏输入框，仅展示历史消息内容。

```yaml preview
brick: ai.chat-view
properties:
  agentId: my-agent-id
  robotId: my-robot-id
  readonly: true
  sessionId: existing-session-id
```

### External Send Message

通过外部按钮触发提问，直接发送消息到对话终端。

```yaml preview
- brick: ai.chat-view
  properties:
    id: chat-view
    agentId: my-agent-id
    robotId: my-robot-id
    showSessionList: false
  events:
    robotId.change:
      - action: console.log
        args:
          - <% EVENT.detail %>
- brick: eo-button
  properties:
    textContent: 外部提问
  events:
    click:
      - target: "#chat-view"
        method: sendMsg
        args:
          - 请介绍一下产品功能
```

### With Tool Calls

显示工具调用过程，适合调试智能体工具链场景。

```yaml preview
brick: ai.chat-view
properties:
  agentId: my-agent-id
  robotId: my-robot-id
  showToolCalls: true
  debug: true
  enterInterval: -1
```
