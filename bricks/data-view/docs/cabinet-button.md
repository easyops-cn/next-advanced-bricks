---
tagName: data-view.cabinet-button
displayName: WrappedDataViewCabinetButton
description: 大屏按钮
category: ""
source: "@next-bricks/data-view"
---

# data-view.cabinet-button

> 大屏按钮

## Props

| 属性        | 类型                  | 必填 | 默认值 | 说明       |
| ----------- | --------------------- | ---- | ------ | ---------- |
| buttonStyle | `React.CSSProperties` | 否   | -      | 按钮的样式 |

## Examples

### Basic

展示一个带自定义样式的大屏关闭按钮。

```yaml preview
- brick: data-view.cabinet-button
  properties:
    buttonStyle:
      width: 50px
      height: 50px
      background: "#1c1e21"
```
