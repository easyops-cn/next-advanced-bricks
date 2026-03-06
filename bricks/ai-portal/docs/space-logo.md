---
tagName: ai-portal.space-logo
displayName: WrappedAiPortalSpaceLogo
description: 协作空间的 Logo 展示组件
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.space-logo

> 协作空间的 Logo 展示组件

## Props

| 属性 | 类型     | 必填 | 默认值 | 说明                                                      |
| ---- | -------- | ---- | ------ | --------------------------------------------------------- |
| size | `number` | 否   | `48`   | Logo 容器尺寸（px），图标为容器的 87.5%，圆角为容器的 25% |

## Examples

### 基础使用

使用默认尺寸（48px）展示协作空间 Logo。

```yaml preview
brick: ai-portal.space-logo
```

### 自定义尺寸

通过 size 属性控制 Logo 容器的像素大小，图标和圆角按比例缩放。

```yaml preview
brick: div
properties:
  style:
    display: flex
    gap: 16px
    alignItems: center
children:
  - brick: ai-portal.space-logo
    properties:
      size: 32
  - brick: ai-portal.space-logo
    properties:
      size: 48
  - brick: ai-portal.space-logo
    properties:
      size: 64
  - brick: ai-portal.space-logo
    properties:
      size: 96
```
