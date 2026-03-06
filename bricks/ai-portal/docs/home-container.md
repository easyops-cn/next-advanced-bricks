---
tagName: ai-portal.home-container
displayName: WrappedAiPortalHomeContainer
description: AI Portal 首页容器，通过 sticky 属性控制顶部吸附行为，内容通过默认插槽传入。
category: layout-component
source: "@next-bricks/ai-portal"
---

# ai-portal.home-container

> AI Portal 首页容器，通过 sticky 属性控制顶部吸附行为，内容通过默认插槽传入。

## Props

| 属性   | 类型      | 必填 | 默认值 | 说明                                                              |
| ------ | --------- | ---- | ------ | ----------------------------------------------------------------- |
| sticky | `boolean` | 否   | -      | 是否启用顶部吸附样式，通过 CSS 属性选择器控制布局，不触发重新渲染 |

## Slots

| 名称    | 说明         |
| ------- | ------------ |
| default | 页面内容区域 |

## Examples

### Basic

作为页面内容的包裹容器，传入子构件。

```yaml preview
brick: ai-portal.home-container
children:
  - brick: span
    properties:
      textContent: Hello world
      style:
        padding: 16px
        display: block
```

### With Sticky

启用 sticky 吸附样式的首页容器。

```yaml preview
brick: ai-portal.home-container
properties:
  sticky: true
children:
  - brick: span
    properties:
      textContent: 吸附布局内容
      style:
        padding: 16px
        display: block
```
