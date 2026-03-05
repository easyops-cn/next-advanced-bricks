---
tagName: data-view.title-text
displayName: WrappedDataViewTitleText
description: 大屏标题文本构件
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.title-text

> 大屏标题文本构件

## Props

| 属性          | 类型                             | 必填 | 默认值     | 说明                                                            |
| ------------- | -------------------------------- | ---- | ---------- | --------------------------------------------------------------- |
| text          | `string`                         | 是   | -          | 标题文本                                                        |
| type          | `TitleType`                      | 是   | `"normal"` | 文本样式，`normal` 纯白， `stroke` 渐变加描边， `gradient` 渐变 |
| fontSize      | `CSSProperties["fontSize"]`      | 是   | -          | 字体大小                                                        |
| fontWeight    | `CSSProperties["fontWeight"]`    | 是   | -          | 字体粗细                                                        |
| letterSpacing | `CSSProperties["letterSpacing"]` | 是   | -          | 字体间距                                                        |

## Examples

### Basic

展示默认样式（纯白色）的标题文本。

```yaml preview
- brick: data-view.title-text
  properties:
    text: 大标题
```

### Stroke

展示渐变加描边样式的标题文本。

```yaml preview
- brick: data-view.title-text
  properties:
    text: 大标题
    type: stroke
```

### Gradient

展示渐变样式的标题文本。

```yaml preview
- brick: data-view.title-text
  properties:
    text: 大标题
    type: gradient
```

### Custom Font

展示自定义字体大小、粗细和间距的标题文本。

```yaml preview
- brick: data-view.title-text
  properties:
    text: 自定义字体
    type: gradient
    fontSize: 60px
    fontWeight: 700
    letterSpacing: 20px
```
