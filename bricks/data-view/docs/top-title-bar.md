---
tagName: data-view.top-title-bar
displayName: WrappedDataViewTopTitleBar
description: 大屏标题栏三种样式构件
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.top-title-bar

> 大屏标题栏三种样式构件

## Props

| 属性 | 类型           | 必填 | 默认值     | 说明     |
| ---- | -------------- | ---- | ---------- | -------- |
| text | `string`       | 是   | -          | 标题文本 |
| type | `TitleBarType` | 是   | `"normal"` | 标题类型 |

## Examples

### Basic

展示默认（normal）样式的顶部标题栏。

```yaml preview
- brick: data-view.top-title-bar
  properties:
    text: 标题
```

### Sample

展示 sample 样式的顶部标题栏。

```yaml preview
- brick: data-view.top-title-bar
  properties:
    text: 标题
    type: sample
```

### Square

展示 square 样式的顶部标题栏。

```yaml preview
- brick: data-view.top-title-bar
  properties:
    text: 标题
    type: square
```
