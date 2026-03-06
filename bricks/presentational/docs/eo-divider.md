---
tagName: eo-divider
displayName: WrappedEoDivider
description: 分割线
category: container-display
source: "@next-bricks/presentational"
---

# eo-divider

> 分割线

## Props

| 属性         | 类型                                        | 必填 | 默认值         | 说明                                                                   |
| ------------ | ------------------------------------------- | ---- | -------------- | ---------------------------------------------------------------------- |
| orientation  | `"left" \| "center" \| "right"`             | 否   | `"center"`     | 标题位置，在 `horizontal` 类型的分割线中使用                           |
| dashed       | `boolean`                                   | 否   | `false`        | 是否渲染为虚线                                                         |
| type         | `"horizontal" \| "vertical" \| "radiation"` | 否   | `"horizontal"` | 分割线类型：水平、垂直或放射。`radiation` 是特殊样式类型，外观固定     |
| proportion   | `[number, number]`                          | 否   | -              | 数值比例，仅在 `type="radiation"` 时生效。例如展示"1/3"时传入 `[1, 3]` |
| dividerStyle | `CSSProperties`                             | 否   | -              | 分割线容器的自定义内联样式                                             |

## Examples

### Basic

水平分割线，无文字内容。

```yaml preview
- brick: eo-divider
```

### orientation

设置 `orientation` 控制插槽文字在水平分割线中的对齐位置。

```yaml preview
- brick: div
  properties:
    style:
      display: flex
      flexDirection: column
      gap: 8px
  children:
    - brick: eo-divider
      properties:
        orientation: left
      children:
        - brick: span
          properties:
            textContent: 左对齐
    - brick: eo-divider
      properties:
        orientation: center
      children:
        - brick: span
          properties:
            textContent: 居中
    - brick: eo-divider
      properties:
        orientation: right
      children:
        - brick: span
          properties:
            textContent: 右对齐
```

### dashed

启用 `dashed` 后分割线以虚线样式呈现。

```yaml preview
- brick: eo-divider
  properties:
    dashed: true
  children:
    - brick: span
      properties:
        textContent: 虚线分割
```

### type vertical

`type="vertical"` 用于行内元素之间的垂直分隔。

```yaml preview
- brick: div
  properties:
    style:
      display: flex
      alignItems: center
  children:
    - brick: span
      properties:
        textContent: 文本A
    - brick: eo-divider
      properties:
        type: vertical
    - brick: span
      properties:
        textContent: 文本B
    - brick: eo-divider
      properties:
        type: vertical
        dashed: true
    - brick: span
      properties:
        textContent: 文本C
```

### type radiation

`type="radiation"` 配合 `proportion` 展示数值比例（如进度或占比）。

```yaml preview
- brick: eo-divider
  properties:
    type: radiation
    proportion:
      - 1
      - 3
  children:
    - brick: span
      properties:
        textContent: 完成进度
```

### dividerStyle

通过 `dividerStyle` 自定义分割线容器的内联样式。

```yaml preview
- brick: eo-divider
  properties:
    dividerStyle:
      borderColor: "#1890ff"
      margin: "16px 0"
  children:
    - brick: span
      properties:
        textContent: 自定义样式
```
