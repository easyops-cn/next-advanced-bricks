---
tagName: ai-portal.notice-list
displayName: WrappedAiPortalNoticeList
description: 消息通知列表构件，用于展示消息列表，支持批量操作
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalNoticeList

> 消息通知列表构件，用于展示消息列表，支持批量操作

## 导入

```tsx
import { WrappedAiPortalNoticeList } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型           | 必填 | 默认值 | 说明               |
| ----------- | -------------- | ---- | ------ | ------------------ |
| dataSource  | `NoticeItem[]` | 否   | -      | 消息数据列表       |
| emptyText   | `string`       | 否   | -      | 空状态文案         |
| urlTemplate | `string`       | 否   | -      | 详情链接           |
| urlTarget   | `Target`       | 否   | -      | 详情链接目标       |
| selectedIds | `string[]`     | 否   | -      | 选中的消息 ID 数组 |

## Events

| 事件            | detail                              | 说明               |
| --------------- | ----------------------------------- | ------------------ |
| onNoticeClick   | `NoticeItem` — 消息项数据           | 消息项点击事件     |
| onMarkItemsRead | `NoticeItem[]` — 选中的消息 ID 数组 | 标记消息项已读事件 |
| onMarkAllRead   | `void`                              | 全部已读事件       |

## Examples

### 基础使用

展示消息列表，支持批量选择和标记已读操作。

```tsx
<WrappedAiPortalNoticeList
  dataSource={[
    {
      id: "1",
      type: "project",
      isRead: true,
      title: "协作流【研发设计】已完成",
      time: 1761207261887,
    },
    {
      id: "2",
      type: "account",
      isRead: true,
      title: "您的账户资源配额即将达到限制",
      time: 1761812267887,
    },
    {
      id: "3",
      type: "system",
      isRead: false,
      title: "服务通知：服务维护",
      time: 1761818247887,
    },
    {
      id: "4",
      type: "space",
      isRead: false,
      title: "Luna 在项目【系统资源收集】中@了你",
      time: 1761820851887,
    },
    {
      id: "5",
      type: "project",
      isRead: false,
      title: "协作流【设计规范】已完成",
      time: 1761821891887,
    },
  ]}
  onNoticeClick={(e) => console.log("消息点击:", e.detail)}
  onMarkItemsRead={(e) => console.log("消息已读:", e.detail)}
  onMarkAllRead={(e) => console.log("全部已读")}
/>
```

### 空状态

空状态展示，可以自定义空状态文案。

```tsx
<WrappedAiPortalNoticeList dataSource={[]} emptyText="暂无新消息通知" />
```

### 带链接跳转

配置 urlTemplate 使消息项点击后跳转到详情页。

```tsx
<WrappedAiPortalNoticeList
  urlTemplate="/notices/{{id}}"
  urlTarget="_blank"
  dataSource={[
    {
      id: "1",
      type: "project",
      isRead: false,
      title: "协作流【研发设计】已完成",
      time: 1761207261887,
    },
    {
      id: "2",
      type: "account",
      isRead: false,
      title: "您的账户资源配额即将达到限制",
      time: 1761812267887,
    },
  ]}
/>
```
