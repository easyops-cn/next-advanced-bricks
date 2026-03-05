---
tagName: ai-portal.notice-dropdown
displayName: WrappedAiPortalNoticeDropdown
description: 消息通知下拉框构件，用于展示消息列表
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.notice-dropdown

> 消息通知下拉框构件，用于展示消息列表

## Props

| 属性                   | 类型                  | 必填 | 默认值 | 说明                     |
| ---------------------- | --------------------- | ---- | ------ | ------------------------ |
| dataSource             | `NoticeItem[]`        | 否   | -      | 消息数据列表             |
| popoverPlacement       | `Placement`           | 否   | -      | 弹窗位置                 |
| emptyText              | `string`              | 否   | -      | 空状态文案               |
| notifyCenterUrl        | `string`              | 否   | -      | 通知中心URL              |
| urlTemplate            | `string`              | 否   | -      | 详情链接                 |
| urlTarget              | `Target`              | 否   | -      | 详情链接目标             |
| dropdownMaxWidth       | `string \| number`    | 否   | -      | 下拉框最大宽度           |
| dropdownContentStyle   | `React.CSSProperties` | 否   | -      | 下拉框内容样式           |
| hideNotifyCenterButton | `boolean`             | 否   | -      | 是否隐藏进入消息中心按钮 |

## Events

| 事件          | detail                                                                                                                       | 说明             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| notice.click  | `NoticeItem` — { id: 消息ID, type: 消息类型, isRead: 是否已读, title: 标题, description: 描述, time: 时间戳, url: 详情链接 } | 消息项点击事件   |
| mark.all.read | `void`                                                                                                                       | 全部已读点击事件 |

## Slots

| 名称    | 说明                                     |
| ------- | ---------------------------------------- |
| trigger | 自定义触发器，默认为带角标的铃铛图标按钮 |

## Examples

### 基础使用（带消息列表）

展示包含多条不同类型消息的下拉通知列表。

```yaml preview
brick: ai-portal.notice-dropdown
properties:
  dataSource:
    - id: "msg-1"
      isRead: false
      type: "project"
      title: "协作流【研发设计】已完成【项目协作功能】已发布【项目协作功能】已发布【项目协作功能】已发布【项目协作功能】已发布"
    - id: "msg-2"
      isRead: false
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
      type: "space"
    - id: "msg-3"
      type: "account"
      isRead: true
      title: "【项目协作功能】已发布"
    - id: "msg-4"
      type: "system"
      isRead: true
      title: "Samuel在项目【项目A】@了你"
    - id: "msg-5"
      type: "account"
      isRead: false
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
    - id: "msg-6"
      type: "system"
      isRead: true
      title: "【项目协作功能】已发布"
    - id: "msg-7"
      type: "project"
      isRead: true
      title: "Samuel在项目【项目A】@了你"
    - id: "msg-8"
      type: "space"
      isRead: false
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
    - id: "msg-9"
      type: "space"
      isRead: true
      title: "【项目协作功能】已发布"
    - id: "msg-10"
      type: "system"
      isRead: true
      title: "Samuel在项目【项目A】@了你"
events:
  notice.click:
    action: console.log
    args:
      - "点击了消息："
      - "<% EVENT.detail %>"
  mark.all.read:
    action: console.log
    args:
      - "点击了全部已读"
```

### 空状态

当没有消息时展示空状态提示文案。

```yaml preview
brick: ai-portal.notice-dropdown
properties:
  dataSource: []
  emptyText: "暂无新消息"
```

### 自定义触发器

使用 trigger 插槽放置自定义触发器元素（如按钮）。

```yaml preview
brick: ai-portal.notice-dropdown
properties:
  dataSource:
    - id: "msg-1"
      isRead: false
      type: "project"
      title: "协作流【研发设计】已完成"
    - id: "msg-2"
      isRead: false
      type: "space"
      title: "协作流【协作流名称】需要人工确认"
    - id: "msg-3"
      type: "account"
      isRead: true
      title: "【项目协作功能】已发布"
  hideNotifyCenterButton: true
  dropdownMaxWidth: 400
children:
  - brick: eo-button
    slot: trigger
    properties:
      type: primary
      icon:
        lib: "antd"
        icon: "bell"
      textContent: "查看通知"
```
