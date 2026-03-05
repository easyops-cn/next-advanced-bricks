---
tagName: ai-portal.blank-state
displayName: WrappedAiPortalBlankState
description: 空状态展示组件，提供预置插画和描述文字，并支持通过默认插槽插入自定义内容。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# ai-portal.blank-state

> 空状态展示组件，提供预置插画和描述文字，并支持通过默认插槽插入自定义内容。

## Props

| 属性         | 类型                                  | 必填 | 默认值 | 说明                                                                                                   |
| ------------ | ------------------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------ |
| illustration | `BlankStateIllustration \| undefined` | 否   | -      | 插画类型，可选 "goals"、"activities"、"collaboration-spaces"、"serviceflows"，默认使用 activities 插画 |
| description  | `string \| undefined`                 | 否   | -      | 描述文字                                                                                               |

## Slots

| 名称      | 说明                                           |
| --------- | ---------------------------------------------- |
| (default) | 默认插槽，用于插入自定义内容（如按钮等操作项） |

## Examples

### Basic

展示空状态组件的基本用法，使用 goals 插画和描述文字。

```yaml preview
brick: ai-portal.blank-state
properties:
  illustration: goals
  description: 暂无目标，快来创建第一个吧
```

### Different Illustrations

展示不同插画类型的空状态效果。

```yaml preview
- brick: ai-portal.blank-state
  properties:
    illustration: activities
    description: 暂无活动记录
- brick: ai-portal.blank-state
  properties:
    illustration: collaboration-spaces
    description: 暂无协作空间
- brick: ai-portal.blank-state
  properties:
    illustration: serviceflows
    description: 暂无服务流
```

### With Slot Content

通过默认插槽插入操作按钮。

```yaml preview
brick: ai-portal.blank-state
properties:
  illustration: goals
  description: 暂无目标，快来创建第一个吧
children:
  - brick: eo-button
    properties:
      type: primary
      textContent: 创建目标
```
