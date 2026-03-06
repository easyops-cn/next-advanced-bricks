---
tagName: data-view.data-display-flipper-sixth
displayName: WrappedDataViewDataDisplayFlipperSixth
description: 翻牌器-type-6
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.data-display-flipper-sixth

> 翻牌器-type-6

## Props

| 属性         | 类型                  | 必填 | 默认值 | 说明       |
| ------------ | --------------------- | ---- | ------ | ---------- |
| flipperTitle | `string`              | -    | -      | 翻牌器标题 |
| data         | `number \| string`    | -    | -      | 翻牌器数值 |
| flipperStyle | `React.CSSProperties` | -    | -      | 翻牌器样式 |

## Examples

### Basic

展示翻牌器基本用法，包含标题和数值。

```yaml preview
brick: data-view.data-display-flipper-sixth
properties:
  flipperTitle: 翻牌器名称
  data: 699
```

### Custom Style

使用 flipperStyle 自定义翻牌器容器样式。

```yaml preview
brick: data-view.data-display-flipper-sixth
properties:
  flipperTitle: 在线设备
  data: 12345
  flipperStyle:
    width: 200px
    color: "#00eaff"
```
