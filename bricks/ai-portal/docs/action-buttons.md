---
tagName: ai-portal.action-buttons
displayName: WrappedAiPortalActionButtons
description: 动作按钮组，支持选中状态切换，用于聊天框的功能入口。
category: ai-portal
source: "@next-bricks/ai-portal"
---

# ai-portal.action-buttons

> 动作按钮组，支持选中状态切换，用于聊天框的功能入口。

## Props

| 属性      | 类型                          | 必填 | 默认值 | 说明                                                       |
| --------- | ----------------------------- | ---- | ------ | ---------------------------------------------------------- |
| items     | `ActionItem[] \| undefined`   | 否   | -      | 按钮列表配置，每项包含文本、唯一键值及可选图标             |
| activeKey | `string \| null \| undefined` | 否   | -      | 当前选中按钮的键值，选中后显示删除图标，再次点击可取消选中 |

## Events

| 事件   | detail                                                                                                                          | 说明                         |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| change | `ActionItem \| null` — { key: 按钮键值, text: 按钮文本, icon: 按钮图标 } \| null — 选中时为选中的 ActionItem，取消选中时为 null | 选中或取消选中动作按钮时触发 |

## Examples

### Basic

展示动作按钮组的基本用法，点击按钮切换选中状态。

```yaml preview
brick: ai-portal.chat-box
children:
  - brick: ai-portal.action-buttons
    slot: actions
    properties:
      items:
        - key: think
          text: 深度思考
          icon:
            lib: antd
            theme: outlined
            icon: reddit
        - key: networking
          text: 联网搜索
          icon:
            lib: antd
            theme: outlined
            icon: global
    events:
      change:
        action: console.log
```

### With activeKey

通过 `activeKey` 属性预设选中的按钮。

```yaml preview
brick: ai-portal.action-buttons
properties:
  activeKey: think
  items:
    - key: think
      text: 深度思考
      icon:
        lib: antd
        theme: outlined
        icon: reddit
    - key: networking
      text: 联网搜索
      icon:
        lib: antd
        theme: outlined
        icon: global
events:
  change:
    action: console.log
```
