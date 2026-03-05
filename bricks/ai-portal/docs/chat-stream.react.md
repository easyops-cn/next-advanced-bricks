---
tagName: ai-portal.chat-stream
displayName: WrappedAiPortalChatStream
description: AI 对话流视图，以聊天气泡形式展示对话过程，支持文件上传、命令联想、回放及用户反馈等功能。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalChatStream

> AI 对话流视图，以聊天气泡形式展示对话过程，支持文件上传、命令联想、回放及用户反馈等功能。

## 导入

```tsx
import { WrappedAiPortalChatStream } from "@easyops/wrapped-components";
```

## Props

| 属性                    | 类型                                   | 必填 | 默认值 | 说明                                                     |
| ----------------------- | -------------------------------------- | ---- | ------ | -------------------------------------------------------- |
| conversationId          | `string \| undefined`                  | 否   | -      | 对话 ID                                                  |
| initialRequest          | `RequestStore \| undefined \| null`    | 否   | -      | 初始请求数据。仅初始设置有效。                           |
| replay                  | `boolean \| undefined`                 | 否   | -      | 是否启用回放。仅初始设置有效。                           |
| replayDelay             | `number \| undefined`                  | 否   | `2`    | 设置回放时消息之间的时间间隔，单位为秒。仅初始设置有效。 |
| supports                | `Record<string, boolean> \| undefined` | 否   | -      | 功能开关配置，键为功能名，值为是否启用                   |
| showHumanActions        | `boolean \| undefined`                 | 否   | -      | 是否显示 Human-in-the-loop 操作按钮                      |
| showFeedback            | `boolean \| undefined`                 | 否   | -      | 是否显示反馈按钮                                         |
| showFeedbackAfterFailed | `boolean \| undefined`                 | 否   | -      | 是否在任务失败时也显示反馈按钮                           |
| showFeedbackOnView      | `boolean \| undefined`                 | 否   | -      | 是否在查看生成视图时显示反馈按钮                         |
| showUiSwitch            | `boolean \| undefined`                 | 否   | -      | 是否显示切换到画布视图的按钮                             |
| hideMermaid             | `boolean \| undefined`                 | 否   | -      | 是否隐藏 Mermaid 图表渲染，通过 CSS 属性选择器控制样式   |
| previewUrlTemplate      | `string \| undefined`                  | 否   | -      | 生成视图预览页的 URL 模板，支持 {viewId} 等字段插值      |
| showCases               | `ShowCaseType[] \| undefined`          | 否   | -      | 示例场景列表，用于在空对话时展示快速入口                 |
| exampleProjects         | `ExampleProject[] \| undefined`        | 否   | -      | 示例项目列表，用于展示可参考的已有项目                   |
| tryItOutUrl             | `string \| undefined`                  | 否   | -      | "试一试"跳转 URL                                         |
| aiEmployees             | `AIEmployee[] \| undefined`            | 否   | -      | 可 @ 提及的数字人列表                                    |
| commands                | `Command[] \| undefined`               | 否   | -      | 命令列表，支持通过 / 或搜索触发联想                      |
| uploadOptions           | `UploadOptions \| undefined`           | 否   | -      | 文件上传配置                                             |

## Events

| 事件             | detail                                                                          | 说明                             |
| ---------------- | ------------------------------------------------------------------------------- | -------------------------------- |
| onShare          | `void`                                                                          | 用户点击分享时触发               |
| onTerminate      | `void`                                                                          | 用户点击终止任务时触发           |
| onFeedbackSubmit | `FeedbackDetail` — { plan: 计划步骤列表, result: 结果列表, feedback: 反馈文本 } | 用户提交反馈时触发               |
| onFeedbackOnView | `string` — 生成视图的 viewId                                                    | 用户查看生成视图时的反馈事件触发 |
| onUiSwitch       | `"canvas"` — 切换目标 UI 模式，值为 "canvas"                                    | 用户点击切换到画布视图按钮时触发 |
| onDetailChange   | `ConversationDetail` — { projectId: 关联的项目 ID }                             | 对话详情信息变化时触发           |
| onSplitChange    | `boolean` — 是否已切换到分屏模式                                                | 分屏状态切换时触发               |

## Methods

| 方法                 | 参数                       | 返回值 | 说明                                   |
| -------------------- | -------------------------- | ------ | -------------------------------------- |
| resumed              | `() => void`               | `void` | 通知组件任务已恢复，用于继续中断的对话 |
| feedbackSubmitDone   | `() => void`               | `void` | 通知组件反馈提交成功                   |
| feedbackSubmitFailed | `() => void`               | `void` | 通知组件反馈提交失败                   |
| feedbackOnViewDone   | `(viewId: string) => void` | `void` | 通知组件查看视图的反馈处理完成         |

## Examples

### Basic

展示 AI 对话流视图的基本用法，通过 conversationId 加载已有对话。

```tsx
<WrappedAiPortalChatStream
  conversationId="conv-001"
  showFeedback={true}
  onShare={(e) => console.log(e.detail)}
  onTerminate={(e) => console.log(e.detail)}
/>
```

### With Feedback

开启反馈功能，并在反馈提交后通知组件结果。

```tsx
const ref = useRef<any>();

const handleFeedbackSubmit = async (e: CustomEvent) => {
  try {
    await submitFeedback(e.detail);
    ref.current?.feedbackSubmitDone();
  } catch {
    ref.current?.feedbackSubmitFailed();
  }
};

<WrappedAiPortalChatStream
  ref={ref}
  conversationId="conv-001"
  showFeedback={true}
  showFeedbackAfterFailed={true}
  showFeedbackOnView={true}
  onFeedbackSubmit={handleFeedbackSubmit}
/>;
```

### With UI Switch

显示切换到画布视图的按钮，并监听切换事件。

```tsx
<WrappedAiPortalChatStream
  conversationId="conv-001"
  showUiSwitch={true}
  onUiSwitch={(e) => console.log(e.detail)}
  onDetailChange={(e) => console.log(e.detail)}
  onSplitChange={(e) => console.log(e.detail)}
/>
```

### Replay Mode

使用回放模式展示历史对话过程。

```tsx
<WrappedAiPortalChatStream
  conversationId="conv-001"
  replay={true}
  replayDelay={1}
/>
```

### With File Upload and Employees

配置文件上传与数字人提及功能。

```tsx
<WrappedAiPortalChatStream
  conversationId="conv-001"
  uploadOptions={{
    enabled: true,
    accept: "image/*,.pdf",
    maxFiles: 3,
  }}
  aiEmployees={[{ employeeId: "emp001", name: "运维工程师小李" }]}
  showCases={[
    {
      conversationId: "show-001",
      title: "服务器故障排查",
      summary: "通过 AI 快速定位服务器异常",
      scenario: "ops",
    },
  ]}
  exampleProjects={[{ instanceId: "proj-001", name: "示例项目" }]}
  tryItOutUrl="/try-it-out"
  onShare={(e) => console.log(e.detail)}
/>
```
