---
tagName: ai-portal.chat-box
displayName: WrappedAiPortalChatBox
description: 大型聊天输入框，用于首页，支持命令联想、@提及数字人、文件上传等功能。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalChatBox

> 大型聊天输入框，用于首页，支持命令联想、@提及数字人、文件上传等功能。

## 导入

```tsx
import { WrappedAiPortalChatBox } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型                         | 必填 | 默认值 | 说明                                |
| ------------- | ---------------------------- | ---- | ------ | ----------------------------------- |
| disabled      | `boolean \| undefined`       | 否   | -      | 是否禁用输入框                      |
| placeholder   | `string \| undefined`        | 否   | -      | 输入框占位文字                      |
| autoFocus     | `boolean \| undefined`       | 否   | -      | 是否自动聚焦                        |
| aiEmployees   | `AIEmployee[] \| undefined`  | 否   | -      | 可 @ 提及的数字人列表               |
| commands      | `Command[] \| undefined`     | 否   | -      | 命令列表，支持通过 / 或搜索触发联想 |
| uploadOptions | `UploadOptions \| undefined` | 否   | -      | 文件上传配置                        |

## Events

| 事件            | detail                                                                                                      | 说明                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| onMessageSubmit | `string` — 用户输入的消息文本内容                                                                           | 用户提交消息时触发（已废弃，请使用 onChatSubmit） |
| onChatSubmit    | `ChatPayload` — { content: 消息内容, files: 上传的文件列表, cmd: 命令载荷, aiEmployeeId: @提及的数字人 ID } | 用户提交聊天消息时触发                            |

## Methods

| 方法         | 参数                      | 返回值 | 说明               |
| ------------ | ------------------------- | ------ | ------------------ |
| setValue     | `(value: string) => void` | `void` | 设置输入框的值     |
| getValue     | `() => void`              | `void` | 获取输入框当前的值 |
| focusOnInput | `() => void`              | `void` | 使输入框获得焦点   |

## Slots

| 名称    | 说明                                         |
| ------- | -------------------------------------------- |
| actions | 操作栏左侧插槽，用于放置动作按钮等自定义内容 |

## Examples

### Basic

展示大型聊天输入框的基本用法，配置占位文字和提交事件监听。

```tsx
<WrappedAiPortalChatBox
  placeholder="请输入您的问题，按 Enter 发送"
  onChatSubmit={(e) => console.log(e.detail)}
/>
```

### With Action Buttons

通过 actions 插槽添加动作按钮，实现深度思考和联网搜索等功能入口。

```tsx
<WrappedAiPortalChatBox
  placeholder="请输入您的问题"
  onChatSubmit={(e) => console.log(e.detail)}
>
  <WrappedAiPortalActionButtons
    slot="actions"
    items={[
      {
        key: "think",
        text: "深度思考",
        icon: { lib: "antd", theme: "outlined", icon: "reddit" },
      },
      {
        key: "networking",
        text: "联网搜索",
        icon: { lib: "antd", theme: "outlined", icon: "global" },
      },
    ]}
  />
</WrappedAiPortalChatBox>
```

### With File Upload

配置 uploadOptions 属性，启用文件上传功能。

```tsx
<WrappedAiPortalChatBox
  placeholder="请输入您的问题，或拖入文件"
  uploadOptions={{
    enabled: true,
    accept: "image/*,.pdf",
    maxFiles: 5,
    maxSize: 10485760,
    readableAccept: "图片或 PDF",
    readableMaxSize: "10MB",
  }}
  onChatSubmit={(e) => console.log(e.detail)}
/>
```

### With AI Employees

配置 aiEmployees 属性，支持在输入时 @ 提及数字人。

```tsx
<WrappedAiPortalChatBox
  placeholder="输入 @ 可提及数字人"
  aiEmployees={[
    { employeeId: "emp001", name: "运维工程师小李" },
    { employeeId: "emp002", name: "数据分析师小张" },
  ]}
  onChatSubmit={(e) => console.log(e.detail)}
/>
```

### Programmatic Control

通过方法调用控制输入框，实现预填内容和焦点管理。

```tsx
const ref = useRef<any>();

<>
  <button onClick={() => ref.current?.setValue("如何优化服务器性能？")}>
    填写示例问题
  </button>
  <WrappedAiPortalChatBox
    ref={ref}
    placeholder="请输入您的问题"
    onChatSubmit={(e) => console.log(e.detail)}
  />
</>;
```
