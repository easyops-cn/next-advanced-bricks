---
tagName: data-view.cabinet-app-layer
displayName: WrappedDataViewCabinetAppLayer
description: cabinet子构件----应用层
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.cabinet-app-layer

> cabinet子构件----应用层

## Props

| 属性     | 类型                  | 必填 | 默认值 | 说明     |
| -------- | --------------------- | ---- | ------ | -------- |
| appTitle | `string`              | 是   | -      | 标题     |
| status   | `"active" \| "faded"` | 否   | -      | 当前状态 |

## Examples

### Basic

展示 cabinet 应用层子构件的基本用法。

```yaml preview
- brick: data-view.cabinet-app-layer
  properties:
    appTitle: inventory-api
    style:
      width: 600px
      background-color: "#1c1e21"
```

### Status

展示不同状态下的 cabinet 应用层。

```yaml preview
- brick: div
  properties:
    textContent: active 状态
- brick: data-view.cabinet-app-layer
  properties:
    appTitle: inventory-api
    status: active
    style:
      width: 600px
      background-color: "#1c1e21"
- brick: div
  properties:
    textContent: faded 状态
    style:
      margin-top: 20px
- brick: data-view.cabinet-app-layer
  properties:
    appTitle: inventory-api
    status: faded
    style:
      width: 600px
      background-color: "#1c1e21"
```
