---
tagName: data-view.brick-notification
displayName: WrappedDataViewBrickNotification
description: 大屏提示构件
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.brick-notification

> 大屏提示构件

## Props

| 属性    | 类型               | 必填 | 默认值                               | 说明     |
| ------- | ------------------ | ---- | ------------------------------------ | -------- |
| message | `string`           | 是   | -                                    | 提示内容 |
| icon    | `GeneralIconProps` | 否   | `{ lib: "fa", icon: "volume-down" }` | 图标     |

## Examples

### Basic

展示大屏提示构件的基本用法。

```yaml preview
- brick: data-view.brick-notification
  properties:
    message: This is the content of the notification.
```

### Icon

展示自定义图标的大屏提示构件。

```yaml preview
- brick: data-view.brick-notification
  properties:
    message: This is the content of the notification.
    icon:
      icon: smile
      lib: antd
      theme: outlined
```
