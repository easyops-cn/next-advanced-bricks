---
tagName: data-view.hi-tech-button
displayName: WrappedDataViewHiTechButton
description: 大屏按钮
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.hi-tech-button

> 大屏按钮

## Props

| 属性        | 类型                                                                     | 必填 | 默认值      | 说明     |
| ----------- | ------------------------------------------------------------------------ | ---- | ----------- | -------- |
| type        | `"default" \| "parallelogram" \| "stereoscopic" \| "shading" \| "round"` | 否   | `"default"` | 按钮类型 |
| buttonStyle | `React.CSSProperties`                                                    | 否   | -           | 按钮样式 |
| disabled    | `boolean`                                                                | 否   | `false`     | 是否禁用 |

## Slots

| 名称      | 说明     |
| --------- | -------- |
| (default) | 按钮内容 |

## Examples

### Basic

展示默认样式的大屏按钮。

```yaml preview
- brick: data-view.hi-tech-button
  slots:
    "":
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: BUTTON
```

### Parallelogram

展示平行四边形样式的大屏按钮。

```yaml preview
- brick: data-view.hi-tech-button
  properties:
    type: parallelogram
  slots:
    "":
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: BUTTON
```

### Stereoscopic

展示立体样式的大屏按钮。

```yaml preview
- brick: data-view.hi-tech-button
  properties:
    type: stereoscopic
  slots:
    "":
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: BUTTON
```

### Shading

展示阴影样式的大屏按钮。

```yaml preview
- brick: data-view.hi-tech-button
  properties:
    type: shading
  slots:
    "":
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: BUTTON
```

### Round

展示圆形样式的大屏按钮。

```yaml preview
- brick: data-view.hi-tech-button
  properties:
    type: round
  slots:
    "":
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: BUTTON
```

### Click

展示点击事件绑定及按钮样式定制。

```yaml preview
- brick: data-view.hi-tech-button
  properties:
    buttonStyle:
      fontSize: 16px
  events:
    click:
      action: message.success
      args:
        - Click!
  slots:
    "":
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: BUTTON
```

### Disabled

展示禁用状态的大屏按钮。

```yaml preview
- brick: data-view.hi-tech-button
  properties:
    disabled: true
  slots:
    "":
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: BUTTON
```
