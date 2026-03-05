---
tagName: ai-portal.chat-box
displayName: WrappedAiPortalChatBox
description: 大型聊天输入框，用于首页，支持命令联想、@提及数字人、文件上传等功能。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# ai-portal.chat-box

> 大型聊天输入框，用于首页，支持命令联想、@提及数字人、文件上传等功能。

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

| 事件           | detail                                                                                                      | 说明                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| message.submit | `string` — 用户输入的消息文本内容                                                                           | 用户提交消息时触发（已废弃，请使用 chat.submit 事件） |
| chat.submit    | `ChatPayload` — { content: 消息内容, files: 上传的文件列表, cmd: 命令载荷, aiEmployeeId: @提及的数字人 ID } | 用户提交聊天消息时触发                                |

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

```yaml preview
brick: ai-portal.chat-box
properties:
  placeholder: 请输入您的问题，按 Enter 发送
events:
  chat.submit:
    action: console.log
```

### With Action Buttons

通过 actions 插槽添加动作按钮，实现深度思考和联网搜索等功能入口。

```yaml preview
brick: ai-portal.chat-box
properties:
  placeholder: 请输入您的问题
children:
  - brick: ai-portal.action-buttons
    slot: actions
    properties:
      items:
        - key: think
          text: 深度思考
          icon:
            lib: antd
            theme: outlined
            icon: reddit
        - key: networking
          text: 联网搜索
          icon:
            lib: antd
            theme: outlined
            icon: global
events:
  chat.submit:
    action: console.log
```

### With File Upload

配置 uploadOptions 属性，启用文件上传功能。

```yaml preview
brick: ai-portal.chat-box
properties:
  placeholder: 请输入您的问题，或拖入文件
  uploadOptions:
    enabled: true
    accept: image/*,.pdf
    maxFiles: 5
    maxSize: 10485760
    readableAccept: 图片或 PDF
    readableMaxSize: 10MB
events:
  chat.submit:
    action: console.log
```

### With AI Employees

配置 aiEmployees 属性，支持在输入时 @ 提及数字人。

```yaml preview
brick: ai-portal.chat-box
properties:
  placeholder: 输入 @ 可提及数字人
  aiEmployees:
    - employeeId: emp001
      name: 运维工程师小李
    - employeeId: emp002
      name: 数据分析师小张
events:
  chat.submit:
    action: console.log
```

### Programmatic Control

通过方法调用控制输入框，实现预填内容和焦点管理。

```yaml preview
- brick: eo-button
  properties:
    textContent: 填写示例问题
  events:
    click:
      target: "#chatBox"
      method: setValue
      args:
        - 如何优化服务器性能？
- brick: ai-portal.chat-box
  properties:
    id: chatBox
    placeholder: 请输入您的问题
  events:
    chat.submit:
      action: console.log
```
