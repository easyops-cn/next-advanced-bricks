---
tagName: ai-portal.space-workbench
displayName: WrappedAiPortalSpaceWorkbench
description: 协作空间工作台，集成顶部导航、侧边栏（知识库、业务实例）、聊天区域和服务流等核心功能的一体化工作台构件。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.space-workbench

> 协作空间工作台，集成顶部导航、侧边栏（知识库、业务实例）、聊天区域和服务流等核心功能的一体化工作台构件。

## Props

| 属性            | 类型              | 必填 | 默认值 | 说明                   |
| --------------- | ----------------- | ---- | ------ | ---------------------- |
| spaceDetail     | `SpaceDetail`     | 是   | -      | 空间详情信息，必填     |
| notifyCenterUrl | `string`          | 是   | -      | 消息中心跳转链接，必填 |
| notices         | `NoticeItem[]`    | 否   | -      | 消息通知列表           |
| knowledges      | `KnowledgeItem[]` | 否   | -      | 知识库列表             |
| uploadOptions   | `UploadOptions`   | 否   | -      | 文件上传配置选项       |

## Events

| 事件            | detail                                                                                     | 说明                   |
| --------------- | ------------------------------------------------------------------------------------------ | ---------------------- |
| go.back         | `void`                                                                                     | 点击返回按钮时触发     |
| members.click   | `void`                                                                                     | 点击成员按钮时触发     |
| notice.click    | `NoticeItem` — { id: 消息ID, type: 消息类型, isRead: 是否已读, title: 标题, time: 时间戳 } | 点击消息通知项时触发   |
| mark.all.read   | `void`                                                                                     | 点击全部已读按钮时触发 |
| space.edit      | `void`                                                                                     | 点击编辑空间按钮时触发 |
| knowledge.click | `KnowledgeItem` — 知识条目数据                                                             | 点击知识条目时触发     |
| knowledge.add   | `void`                                                                                     | 点击添加知识按钮时触发 |

## Examples

### 基础使用

展示包含空间信息、消息通知的协作空间工作台。

```yaml preview
brick: ai-portal.space-workbench
properties:
  spaceDetail:
    name: "产品设计空间"
    instanceId: "space-001"
    description: "这是一个用于产品设计协作的空间"
  notifyCenterUrl: "/notify-center"
  notices:
    - id: "msg-1"
      isRead: false
      type: "project"
      title: "协作流【研发设计】已完成"
    - id: "msg-2"
      isRead: false
      type: "space"
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
    - id: "msg-3"
      type: "account"
      isRead: true
      title: "【项目协作功能】已发布"
events:
  go.back:
    action: console.log
    args:
      - "点击了返回按钮"
  members.click:
    action: console.log
    args:
      - "点击了成员按钮"
  notice.click:
    action: console.log
    args:
      - "点击了消息："
      - "<% EVENT.detail %>"
  mark.all.read:
    action: console.log
    args:
      - "点击了全部已读"
  space.edit:
    action: console.log
    args:
      - "点击了编辑空间"
  knowledge.click:
    action: console.log
    args:
      - "点击了知识:"
      - "<% EVENT.detail %>"
  knowledge.add:
    action: console.log
    args:
      - "点击了添加知识"
```

### 无消息通知

空间没有消息通知时的展示。

```yaml preview
brick: ai-portal.space-workbench
properties:
  spaceDetail:
    name: "研发协作空间"
    instanceId: "space-002"
    description: "研发团队的协作空间"
  notifyCenterUrl: "/notify-center"
  notices: []
events:
  go.back:
    action: console.log
    args:
      - "返回"
  members.click:
    action: console.log
    args:
      - "查看成员"
  space.edit:
    action: console.log
    args:
      - "编辑空间"
```
