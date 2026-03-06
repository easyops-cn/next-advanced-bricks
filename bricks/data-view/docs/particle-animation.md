---
tagName: data-view.particle-animation
displayName: WrappedDataViewParticleAnimation
description: 大屏粒子加载动效
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.particle-animation

> 大屏粒子加载动效

## Props

| 属性           | 类型                  | 必填 | 默认值 | 说明                                                     |
| -------------- | --------------------- | ---- | ------ | -------------------------------------------------------- |
| colors         | `ColorType`           | 是   | -      | 颜色配置，由于光标有三段颜色，中间色段为特效中光点的颜色 |
| containerStyle | `React.CSSProperties` | 否   | -      | 容器样式                                                 |

## Slots

| 名称      | 说明                       |
| --------- | -------------------------- |
| (default) | 粒子动效容器内的自定义内容 |

## Examples

### Basic

展示大屏粒子上升动效的基本用法，包含颜色和容器样式配置。

```yaml preview
- brick: data-view.particle-animation
  properties:
    containerStyle:
      width: 150px
      height: 150px
    colors:
      startColor: "#44E6F300"
      middleColor: "#48D9EE"
      endColor: "#E4FFFF"
    style:
      display: block
      background-color: "#1c1e21"
```

### Custom Colors

展示自定义不同颜色主题的粒子动效。

```yaml preview
- brick: data-view.particle-animation
  properties:
    containerStyle:
      width: 200px
      height: 200px
    colors:
      startColor: "#FF6B6B00"
      middleColor: "#FF6B6B"
      endColor: "#FFE0E0"
    style:
      display: block
      background-color: "#1c1e21"
```
