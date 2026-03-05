---
tagName: nav.poll-announce
displayName: WrappedNavPollAnnounce
description: 轮询获取通知消息并展示，从 v2 构件 `nav-legacy.poll-announce` 迁移而来
category: ""
source: "@next-bricks/nav"
---

# WrappedNavPollAnnounce

> 轮询获取通知消息并展示，从 v2 构件 `nav-legacy.poll-announce` 迁移而来

## 导入

```tsx
import { WrappedNavPollAnnounce } from "@easyops/wrapped-components";
```

## Props

| 属性            | 类型      | 必填 | 默认值 | 说明                                                                                                                                                      |
| --------------- | --------- | ---- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pollEnabled     | `boolean` | 否   | -      | 是否启用轮询。启用时将不断轮询通知列表接口；未启用时通过 `realTimeMessage` 属性传入实时通知消息（注意：v2 构件该属性名为 `pollDisabled`，迁移时已重命名） |
| realTimeMessage | `Message` | 否   | -      | 实时通知消息（通常通过 WebSocket 消息得到），仅在 `pollEnabled` 为 `false` 时生效                                                                         |

## Events

| 事件                | detail | 说明                                     |
| ------------------- | ------ | ---------------------------------------- |
| onNotificationClose | `void` | 通知框关闭后，调用忽略通知接口完成后触发 |
| onNotificationOpen  | `void` | 轮询得到新的通知时触发                   |

## Examples

### Basic

通过 `realTimeMessage` 属性传入实时通知消息并展示通知弹窗。

```tsx
<WrappedNavPollAnnounce
  realTimeMessage={{
    title: "Hello",
    data: "World",
    instanceId: "docs-basic",
  }}
  onNotificationOpen={(e) => console.log("notification.open")}
  onNotificationClose={(e) => console.log("notification.close")}
/>
```

### 启用轮询模式

启用轮询时，构件将持续调用通知接口并在有新通知时自动弹出。

```tsx
<WrappedNavPollAnnounce
  pollEnabled={true}
  onNotificationOpen={(e) => console.log("notification.open")}
  onNotificationClose={(e) => console.log("notification.close")}
/>
```
