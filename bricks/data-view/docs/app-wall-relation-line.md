---
tagName: data-view.app-wall-relation-line
displayName: WrappedDataViewAppWallRelationLine
description: 应用墙子构件----关联连线
category: big-screen-layout
source: "@next-bricks/data-view"
---

# data-view.app-wall-relation-line

> 应用墙子构件----关联连线

## Props

| 属性       | 类型                 | 必填 | 默认值   | 说明     |
| ---------- | -------------------- | ---- | -------- | -------- |
| lightColor | `"blue" \| "purple"` | 否   | `"blue"` | 光线颜色 |

## Examples

### Basic

展示应用墙关联连线的基本用法及颜色效果。

```yaml preview
- brick: data-view.app-wall-relation-line
  properties:
    lightColor: purple
    style:
      height: 200px
```
