---
tagName: data-view.gear-background
displayName: WrappedDataViewGearBackground
description: 齿轮背景
category: big-screen-layout
source: "@next-bricks/data-view"
---

# data-view.gear-background

> 齿轮背景

## Props

| 属性  | 类型                           | 必填 | 默认值      | 说明         |
| ----- | ------------------------------ | ---- | ----------- | ------------ |
| color | `React.CSSProperties["color"]` | -    | `"#3366FF"` | 背景条纹颜色 |

## Examples

### Basic

展示齿轮背景的基本用法，通过设置容器尺寸控制显示区域。

```yaml preview
brick: data-view.gear-background
properties:
  style:
    width: 300px
    height: 300px
    display: block
    background: "#1c1e21"
```

### Custom Color

自定义齿轮背景的条纹颜色。

```yaml preview
brick: data-view.gear-background
properties:
  color: "#00eaff"
  style:
    width: 400px
    height: 400px
    display: block
    background: "#0a0e1a"
```
