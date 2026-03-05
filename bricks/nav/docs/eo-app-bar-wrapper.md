---
tagName: eo-app-bar-wrapper
displayName: WrappedEoAppBarWrapper
description: 应用顶部容器
category: ""
source: "@next-bricks/nav"
---

# eo-app-bar-wrapper

> 应用顶部容器

## Props

| 属性                    | 类型                               | 必填 | 默认值    | 说明                                                         |
| ----------------------- | ---------------------------------- | ---- | --------- | ------------------------------------------------------------ |
| isFixed                 | `boolean \| undefined`             | 否   | `true`    | 是否固定定位。已废弃，使用 `position` 属性代替               |
| position                | `"static" \| "fixed" \| undefined` | 否   | `"fixed"` | 设置定位方式：静态定位或固定定位。设置时优先级高于 `isFixed` |
| displayCenter           | `boolean \| undefined`             | 否   | `false`   | 居中显示                                                     |
| extraAppBarContentStyle | `React.CSSProperties \| undefined` | 否   | —         | 自定义样式                                                   |

## Slots

| 名称  | 说明       |
| ----- | ---------- |
| left  | 左侧内容区 |
| right | 右侧内容区 |

## Examples

### Basic

展示基础的顶部容器，左右区域分别放置内容。

```yaml preview
- brick: eo-app-bar-wrapper
  properties:
    position: static
  slots:
    left:
      bricks:
        - brick: div
          properties:
            textContent: Left Content
      type: bricks
    right:
      bricks:
        - brick: div
          properties:
            textContent: Right Content
      type: bricks
```

### DisplayCenter

将内容区域居中对齐显示。

```yaml preview
- brick: eo-app-bar-wrapper
  properties:
    position: static
    displayCenter: true
  slots:
    left:
      bricks:
        - brick: div
          properties:
            textContent: Left Content
      type: bricks
    right:
      bricks:
        - brick: div
          properties:
            textContent: Right Content
      type: bricks
```

### Custom Style

通过 extraAppBarContentStyle 自定义内容区域样式。

```yaml preview
- brick: eo-app-bar-wrapper
  properties:
    position: static
    extraAppBarContentStyle:
      background: "#f5f5f5"
      padding: 8px 16px
  slots:
    left:
      bricks:
        - brick: div
          properties:
            textContent: Left Content
      type: bricks
    right:
      bricks:
        - brick: div
          properties:
            textContent: Right Content
      type: bricks
```
