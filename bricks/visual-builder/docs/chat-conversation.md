---
tagName: visual-builder.chat-conversation
displayName: WrappedVisualBuilderChatConversation
description: 用于 Visual Builder 的智能聊天对话列表，解析 AI 回复中的 Storyboard 代码块并触发更新事件
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.chat-conversation

> 用于 Visual Builder 的智能聊天对话列表，解析 AI 回复中的 Storyboard 代码块并触发更新事件

## Props

| 属性          | 类型        | 必填 | 默认值 | 说明                                                                            |
| ------------- | ----------- | ---- | ------ | ------------------------------------------------------------------------------- |
| messages      | `Message[]` | 否   | -      | 对话消息列表，包含用户和 AI 助手的消息，支持流式（partial）和失败（failed）状态 |
| errorBoundary | `boolean`   | 否   | -      | 是否为解析出的砖块启用错误边界，防止单个砖块异常导致整个预览崩溃                |

## Events

| 事件              | detail                               | 说明                                     |
| ----------------- | ------------------------------------ | ---------------------------------------- |
| storyboard.update | `BrickConf[]` — 解析出的砖块配置列表 | 从 AI 回复中解析出新的 Storyboard 时触发 |

## Examples

### Basic

展示包含用户消息和 AI 回复的完整对话列表，AI 回复中嵌入了 Storyboard 代码块。

````yaml preview
brick: visual-builder.chat-conversation
properties:
  messages:
    - role: user
      content: 生成一个主机列表页面
      key: 1
    - role: assistant
      content: |
        好的，我们来逐步确认页面的各个区块需求。

        1. **页头区**：您需要在这个区域放置什么内容？比如标题、横幅图片或者搜索框等。
        2. **全局操作区**：您希望有哪些全局操作的按钮？如您所示，已有"管理"、"刷新"、"新建"、"删除"、"执行"、"导入"和"导出"，这些都足够了吗？
        3. **标签导航区**：是否需要多个标签页？如果有，需要显示哪些内容或数据？
        4. **数据控制区**：对于搜索，需要哪些字段作为搜索条件？"最近访问"和"基础筛选"需要哪些具体筛选条件？
        5. **列表区**：列表中应显示主机的哪些属性？例如，是否显示`主机名`、`IP`、`供应商`等信息？是否需要编辑和删除功能？列表是否可排序？用户是否可以多选列表项？分页功能需要吗？

        请根据您的需求回答这些问题，或者告诉我哪些区块的默认设置即可。
      key: 2
    - role: user
      content: |
        不包含页头区。
        全局操作区包含新建、删除两个按钮。数据控制区提供搜索功能，用户可以按IP搜索。列表区展示每条主机的IP、主机名、运营状态、创建时间。
        其他区块不需要。
      key: 3
    - role: assistant
      content: |
        了解了您的需求，以下是根据您的回答总结的最终需求：

        ```json
        {
          "requirement": "生成一个主机列表页面，不包含页头区。全局操作区包含'新建'和'删除'两个按钮。数据控制区提供搜索功能，用户可以按IP进行搜索。列表区展示每条主机的IP、主机名、运营状态和创建时间。其他区块如标签导航区、数据控制区的其他功能（如最近访问、基础筛选）以及列表区的编辑、排序、选择和分页功能都不需要。"
        }
        ```

        ```easy_cmd_vb_block_page
        [{"uuid": "96e55a2a556049eba1e5c1a8cd1e6ef3", "seq": 0, "conversationId": "db2e41dc-932c-4f76-aad4-19da09bea036", "brick": "", "brick_desc": "包含新建和删除按钮", "user_desc": "", "storyboard": null, "type": "block", "name": "全局操作区", "children": ["d7ef5946776445ba96ebf2beb2f680a5", "da3e65baf08d4fc28b938d1efd768265"], "parent": "", "properties": null, "hasContainer": false}, {"uuid": "d7ef5946776445ba96ebf2beb2f680a5", "seq": 0, "conversationId": "db2e41dc-932c-4f76-aad4-19da09bea036", "brick": "", "brick_desc": "生成一个新建按钮，textContent为新建，type为primary（主要按钮），大小为medium，形状为默认方形，非禁用状态，无危险状态，无图标，无tooltip", "user_desc": "", "storyboard": null, "type": "item", "name": "新建", "children": [], "parent": "96e55a2a556049eba1e5c1a8cd1e6ef3", "properties": null, "hasContainer": false}, {"uuid": "da3e65baf08d4fc28b938d1efd768265", "seq": 1, "conversationId": "db2e41dc-932c-4f76-aad4-19da09bea036", "brick": "", "brick_desc": "生成一个删除按钮，textContent为删除，type为danger（危险按钮），大小为medium，形状为默认方形，非禁用状态，有危险状态，无图标，无tooltip", "user_desc": "", "storyboard": null, "type": "item", "name": "删除", "children": [], "parent": "96e55a2a556049eba1e5c1a8cd1e6ef3", "properties": null, "hasContainer": false}, {"uuid": "a66ff62152ea4b808f2e5d957c24b2ef", "seq": 2, "conversationId": "db2e41dc-932c-4f76-aad4-19da09bea036", "brick": "", "brick_desc": "展示每条主机的IP、主机名、运营状态和创建时间", "user_desc": "", "storyboard": null, "type": "block", "name": "列表区", "children": [], "parent": "", "properties": null, "hasContainer": true}]
        ```

        ```easy_cmd_vb_block_storyboard
        {"uuid": "d7ef5946776445ba96ebf2beb2f680a5", "storyboard": {"brick": "eo-button", "events": {"click": []}, "properties": {"textContent": "新建", "type": "primary", "size": "medium"}}}
        ```

        ```easy_cmd_vb_block_storyboard
        {"uuid": "da3e65baf08d4fc28b938d1efd768265", "storyboard": {"brick": "eo-button", "events": {"click": []}, "properties": {"textContent": "删除", "type": "danger", "size": "medium", "danger": true}}}
        ```

        ```easy_cmd_vb_block_storyboard
        {"uuid": "a66ff62152ea4b808f2e5d957c24b2ef", "storyboard": {"brick": "eo-next-table", "properties": {"columns": [{"title": "IP", "dataIndex": "ip"}, {"title": "主机名", "dataIndex": "hostname"}, {"title": "运营状态", "dataIndex": "status"}, {"title": "创建时间", "dataIndex": "createTime"}], "dataSource": {"list": [{"ip": "192.168.1.1", "hostname": "host-001", "status": "运行中", "createTime": "2024-01-01"}]}}}}
        ```
      key: 4
      partial: true
events:
  storyboard.update:
    action: console.log
````

### Errors

展示包含失败消息的对话，failed 状态的消息会以错误样式展示。

```yaml preview
brick: visual-builder.chat-conversation
properties:
  messages:
    - role: user
      content: Create a page to show server host list.
      key: 1
    - role: assistant
      content: OK, let's do it
      key: 2
      failed: true
    - role: assistant
      content: Internal Server Error
      key: 3
      failed: true
```

### With Error Boundary

启用错误边界后，单个砖块渲染失败不会导致整个预览崩溃。

```yaml preview
brick: visual-builder.chat-conversation
properties:
  errorBoundary: true
  messages:
    - role: user
      content: 生成一个简单页面
      key: 1
    - role: assistant
      content: 好的，正在生成...
      key: 2
```
