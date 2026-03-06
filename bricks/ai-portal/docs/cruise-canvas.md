---
tagName: ai-portal.cruise-canvas
displayName: WrappedAiPortalCruiseCanvas
description: AI 任务执行画布，以节点图形式展示任务的执行过程，支持任务回放、反馈及 UI 切换等功能。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# ai-portal.cruise-canvas

> AI 任务执行画布，以节点图形式展示任务的执行过程，支持任务回放、反馈及 UI 切换等功能。

## Props

| 属性                    | 类型                                   | 必填 | 默认值 | 说明                                                     |
| ----------------------- | -------------------------------------- | ---- | ------ | -------------------------------------------------------- |
| conversationId          | `string \| undefined`                  | 否   | -      | 对话 ID                                                  |
| initialRequest          | `RequestStore \| undefined \| null`    | 否   | -      | 初始请求数据。仅初始设置有效。                           |
| replay                  | `boolean \| undefined`                 | 否   | -      | 是否启用回放。仅初始设置有效。                           |
| replayDelay             | `number \| undefined`                  | 否   | `2`    | 设置回放时消息之间的时间间隔，单位为秒。仅初始设置有效。 |
| supports                | `Record<string, boolean> \| undefined` | 否   | -      | 功能开关配置，键为功能名，值为是否启用                   |
| showHiddenJobs          | `boolean \| undefined`                 | 否   | -      | 是否显示隐藏的 Job 节点                                  |
| showHumanActions        | `boolean \| undefined`                 | 否   | -      | 是否显示 Human-in-the-loop 操作按钮                      |
| showFeedback            | `boolean \| undefined`                 | 否   | -      | 是否显示反馈按钮                                         |
| showFeedbackAfterFailed | `boolean \| undefined`                 | 否   | -      | 是否在任务失败时也显示反馈按钮                           |
| showFeedbackOnView      | `boolean \| undefined`                 | 否   | -      | 是否在查看生成视图时显示反馈按钮                         |
| showUiSwitch            | `boolean \| undefined`                 | 否   | -      | 是否显示切换到对话流视图的按钮                           |
| hideMermaid             | `boolean \| undefined`                 | 否   | -      | 是否隐藏 Mermaid 图表渲染，通过 CSS 属性选择器控制样式   |
| showJsxEditor           | `boolean \| undefined`                 | 否   | -      | 是否显示 JSX 编辑器按钮                                  |
| previewUrlTemplate      | `string \| undefined`                  | 否   | -      | 生成视图预览页的 URL 模板，支持 {viewId} 等字段插值      |
| showCases               | `ShowCaseType[] \| undefined`          | 否   | -      | 示例场景列表，用于在空对话时展示快速入口                 |
| exampleProjects         | `ExampleProject[] \| undefined`        | 否   | -      | 示例项目列表，用于展示可参考的已有项目                   |
| tryItOutUrl             | `string \| undefined`                  | 否   | -      | "试一试"跳转 URL                                         |
| separateInstructions    | `boolean \| undefined`                 | 否   | -      | 是否将任务说明独立展示，而非内联在节点中                 |
| aiEmployees             | `AIEmployee[] \| undefined`            | 否   | -      | 可 @ 提及的数字人列表                                    |
| commands                | `Command[] \| undefined`               | 否   | -      | 命令列表，支持通过 / 或搜索触发联想                      |
| uploadOptions           | `UploadOptions \| undefined`           | 否   | -      | 文件上传配置                                             |

## Events

| 事件             | detail                                                                          | 说明                               |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------------------- |
| share            | `void`                                                                          | 用户点击分享时触发                 |
| terminate        | `void`                                                                          | 用户点击终止任务时触发             |
| feedback.submit  | `FeedbackDetail` — { plan: 计划步骤列表, result: 结果列表, feedback: 反馈文本 } | 用户提交反馈时触发                 |
| feedback.on.view | `string` — 生成视图的 viewId                                                    | 用户查看生成视图时的反馈事件触发   |
| ui.switch        | `"chat"` — 切换目标 UI 模式，值为 "chat"                                        | 用户点击切换到对话流视图按钮时触发 |
| detail.change    | `ConversationDetail` — { projectId: 关联的项目 ID }                             | 对话详情信息变化时触发             |

## Methods

| 方法                 | 参数                       | 返回值 | 说明                                   |
| -------------------- | -------------------------- | ------ | -------------------------------------- |
| resumed              | `() => void`               | `void` | 通知组件任务已恢复，用于继续中断的对话 |
| feedbackSubmitDone   | `() => void`               | `void` | 通知组件反馈提交成功                   |
| feedbackSubmitFailed | `() => void`               | `void` | 通知组件反馈提交失败                   |
| feedbackOnViewDone   | `(viewId: string) => void` | `void` | 通知组件查看视图的反馈处理完成         |

## Examples

### Basic

展示 AI 任务画布的基本用法，通过 conversationId 加载已有对话的执行过程。

```yaml preview
brick: ai-portal.cruise-canvas
properties:
  conversationId: conv-001
events:
  share:
    action: console.log
  terminate:
    action: console.log
```

### With Feedback

开启反馈功能，在任务完成后收集用户反馈。

```yaml preview
- brick: ai-portal.cruise-canvas
  properties:
    id: cruiseCanvas
    conversationId: conv-001
    showFeedback: true
    showFeedbackAfterFailed: true
    showFeedbackOnView: true
  events:
    feedback.submit:
      useProvider: my-feedback-provider
      args:
        - <% EVENT.detail %>
      callback:
        success:
          target: "#cruiseCanvas"
          method: feedbackSubmitDone
        error:
          target: "#cruiseCanvas"
          method: feedbackSubmitFailed
    detail.change:
      action: console.log
```

### With UI Switch and Canvas Options

启用 UI 切换按钮，并展示隐藏节点和独立说明。

```yaml preview
brick: ai-portal.cruise-canvas
properties:
  conversationId: conv-001
  showUiSwitch: true
  showHiddenJobs: true
  showHumanActions: true
  separateInstructions: true
  showJsxEditor: true
events:
  ui.switch:
    action: console.log
```

### Replay Mode

使用回放模式展示历史任务的执行过程。

```yaml preview
brick: ai-portal.cruise-canvas
properties:
  conversationId: conv-001
  replay: true
  replayDelay: 2
```

### With Upload and Show Cases

配置文件上传及示例场景，丰富画布的入口展示。

```yaml preview
brick: ai-portal.cruise-canvas
properties:
  conversationId: conv-001
  uploadOptions:
    enabled: true
    accept: image/*,.pdf
    maxFiles: 3
  showCases:
    - conversationId: show-001
      title: 自动化部署流程
      summary: 通过 AI 自动完成服务部署
      scenario: devops
  exampleProjects:
    - instanceId: proj-001
      name: 示例项目
  tryItOutUrl: /try-it-out
  previewUrlTemplate: /preview/{viewId}
events:
  share:
    action: console.log
```
