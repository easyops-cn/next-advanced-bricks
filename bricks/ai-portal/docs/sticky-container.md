---
tagName: ai-portal.sticky-container
displayName: WrappedAiPortalStickyContainer
description: 粘性容器构件，使内容在页面滚动时固定在顶部。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.sticky-container

> 粘性容器构件，使内容在页面滚动时固定在顶部。

## Props

| 属性    | 类型                  | 必填 | 默认值      | 说明                                                           |
| ------- | --------------------- | ---- | ----------- | -------------------------------------------------------------- |
| variant | `"default" \| "home"` | 否   | `"default"` | 变体风格，通过 CSS attribute selector 控制样式，不触发重新渲染 |

## Slots

| 名称      | 说明   |
| --------- | ------ |
| (default) | 内容   |
| header    | 头部   |
| toolbar   | 工具栏 |

## Examples

### 基础使用

将内容放入粘性容器，页面滚动时内容固定在顶部。

```yaml preview
brick: ai-portal.sticky-container
children:
  - brick: div
    properties:
      textContent: "这段内容会在滚动时保持固定"
      style:
        padding: "16px"
        background: "var(--antd-color-bg-container)"
```

### Home 变体

使用 home 变体风格，适用于首页场景。

```yaml preview
brick: ai-portal.sticky-container
properties:
  variant: home
children:
  - brick: div
    slot: header
    properties:
      textContent: "头部内容"
      style:
        padding: "8px 16px"
  - brick: div
    properties:
      textContent: "主体内容"
      style:
        padding: "16px"
```
