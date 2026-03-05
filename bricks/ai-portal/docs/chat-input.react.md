---
tagName: ai-portal.chat-input
displayName: WrappedAiPortalChatInput
description: 小型聊天输入框，用于对话等页面，支持命令联想、@提及数字人、文件上传及终止任务等功能。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalChatInput

> 小型聊天输入框，用于对话等页面，支持命令联想、@提及数字人、文件上传及终止任务等功能。

## 导入

```tsx
import { WrappedAiPortalChatInput } from "@easyops/wrapped-components";
```

## Props

| 属性                 | 类型                             | 必填 | 默认值     | 说明                                                    |
| -------------------- | -------------------------------- | ---- | ---------- | ------------------------------------------------------- |
| placeholder          | `string \| undefined`            | 否   | -          | 输入框占位文字                                          |
| autoFocus            | `boolean \| undefined`           | 否   | -          | 是否自动聚焦                                            |
| submitDisabled       | `boolean \| undefined`           | 否   | -          | 是否禁用发送按钮，通常在 AI 正在处理时设为 true         |
| supportsTerminate    | `boolean \| undefined`           | 否   | -          | 是否显示终止任务按钮，需与 submitDisabled 配合使用      |
| terminating          | `boolean \| undefined`           | 否   | -          | 是否正在终止任务，为 true 时显示加载状态                |
| autoFade             | `boolean \| undefined`           | 否   | -          | 是否在输入框为空时自动淡出，通过 CSS 属性选择器控制样式 |
| uploadOptions        | `UploadOptions \| undefined`     | 否   | -          | 文件上传配置                                            |
| aiEmployees          | `AIEmployee[] \| undefined`      | 否   | -          | 可 @ 提及的数字人列表                                   |
| commands             | `Command[] \| undefined`         | 否   | -          | 命令列表，支持通过 / 或搜索触发联想                     |
| suggestionsPlacement | `"top" \| "bottom" \| undefined` | 否   | `"bottom"` | 命令/提及联想弹出层的显示位置                           |

## Events

| 事件            | detail                                                                                                      | 说明                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| onMessageSubmit | `string` — 用户输入的消息文本内容                                                                           | 用户提交消息时触发（已废弃，请使用 onChatSubmit） |
| onChatSubmit    | `ChatPayload` — { content: 消息内容, files: 上传的文件列表, cmd: 命令载荷, aiEmployeeId: @提及的数字人 ID } | 用户提交聊天消息时触发                            |
| onTerminate     | `void`                                                                                                      | 点击终止按钮时触发                                |

## Methods

| 方法     | 参数                      | 返回值 | 说明                 |
| -------- | ------------------------- | ------ | -------------------- |
| setValue | `(value: string) => void` | `void` | 设置输入框的值并聚焦 |

## Examples

### Basic

展示小型聊天输入框的基本用法。

```tsx
<WrappedAiPortalChatInput
  placeholder="请输入您的问题"
  onChatSubmit={(e) => console.log(e.detail)}
/>
```

### With Terminate Support

配置终止任务按钮，在 AI 处理时显示停止操作。

```tsx
<WrappedAiPortalChatInput
  placeholder="请输入您的问题"
  submitDisabled={true}
  supportsTerminate={true}
  terminating={false}
  onChatSubmit={(e) => console.log(e.detail)}
  onTerminate={(e) => console.log(e.detail)}
/>
```

### With File Upload

配置 uploadOptions 属性，启用文件上传功能。

```tsx
<WrappedAiPortalChatInput
  placeholder="请输入您的问题，或拖入文件"
  uploadOptions={{
    enabled: true,
    accept: "image/*,.pdf",
    maxFiles: 3,
    readableAccept: "图片或 PDF",
  }}
  onChatSubmit={(e) => console.log(e.detail)}
/>
```

### With AI Employees and Commands

同时配置 aiEmployees 和 commands，支持 @ 提及和 / 命令联想。

```tsx
<WrappedAiPortalChatInput
  placeholder="输入 / 或 @ 触发联想"
  suggestionsPlacement="top"
  aiEmployees={[{ employeeId: "emp001", name: "运维工程师小李" }]}
  commands={[{ command: "analyze", description: "分析数据" }]}
  onChatSubmit={(e) => console.log(e.detail)}
/>
```

### With Auto Fade

启用 autoFade 属性，使输入框在空内容时通过 CSS 淡出。

```tsx
<WrappedAiPortalChatInput
  placeholder="请输入您的问题"
  autoFade={true}
  onChatSubmit={(e) => console.log(e.detail)}
/>
```
