---
tagName: ai-portal.home-container
displayName: WrappedAiPortalHomeContainer
description: AI Portal 首页容器，通过 sticky 属性控制顶部吸附行为，内容通过默认插槽传入。
category: layout-component
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalHomeContainer

> AI Portal 首页容器，通过 sticky 属性控制顶部吸附行为，内容通过默认插槽传入。

## 导入

```tsx
import { WrappedAiPortalHomeContainer } from "@easyops/wrapped-components";
```

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

```tsx
<WrappedAiPortalHomeContainer>
  <span style={{ padding: 16, display: "block" }}>Hello world</span>
</WrappedAiPortalHomeContainer>
```

### With Sticky

启用 sticky 吸附样式的首页容器。

```tsx
<WrappedAiPortalHomeContainer sticky>
  <span style={{ padding: 16, display: "block" }}>吸附布局内容</span>
</WrappedAiPortalHomeContainer>
```
