---
tagName: visual-builder.workbench-pane
displayName: WrappedVisualBuilderWorkbenchPane
description: 工作台侧边栏面板，可折叠的内容面板，包含标题栏和可滚动的内容区
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.workbench-pane

> 工作台侧边栏面板，可折叠的内容面板，包含标题栏和可滚动的内容区

## Props

| 属性       | 类型      | 必填 | 默认值 | 说明                 |
| ---------- | --------- | ---- | ------ | -------------------- |
| titleLabel | `string`  | 否   | -      | 面板标题文本         |
| active     | `boolean` | 否   | -      | 是否展开面板         |
| badge      | `number`  | 否   | -      | 标题栏右侧的数字徽标 |

## Events

| 事件                  | detail                                              | 说明                               |
| --------------------- | --------------------------------------------------- | ---------------------------------- |
| active.change         | `boolean` — 当前展开状态，true 为展开，false 为折叠 | 面板展开/折叠状态变化时触发        |
| active.firstActivated | `void`                                              | 面板首次被展开时触发（仅触发一次） |

## Slots

| 名称      | 说明                                 |
| --------- | ------------------------------------ |
| title     | 标题栏自定义内容，显示在标题文本右侧 |
| actions   | 标题栏操作区，显示在 badge 左侧      |
| (default) | 面板内容区，可滚动                   |

## Examples

### Basic

展示一个可折叠的侧边栏面板，包含标题和内容区域。

```yaml preview
brick: visual-builder.workbench-pane
properties:
  titleLabel: 资源列表
  active: true
events:
  active.change:
    - action: console.log
children:
  - brick: div
    properties:
      textContent: 这是面板内容
      style:
        padding: 16px
```

### 带徽标和操作区

在标题栏右侧显示数字徽标，并在操作区提供额外按钮。

```yaml preview
brick: visual-builder.workbench-pane
properties:
  titleLabel: 告警列表
  active: true
  badge: 5
children:
  - brick: eo-button
    slot: actions
    properties:
      icon:
        lib: antd
        icon: plus
        theme: outlined
      type: text
      size: small
  - brick: div
    properties:
      textContent: 5 条告警信息
      style:
        padding: 16px
```

### 首次激活事件

监听面板首次展开时触发的一次性事件，适用于懒加载场景。

```yaml preview
brick: visual-builder.workbench-pane
properties:
  titleLabel: 延迟加载内容
  active: false
events:
  active.firstActivated:
    - action: console.log
      args:
        - "面板首次展开，开始加载数据"
children:
  - brick: div
    properties:
      textContent: 内容将在首次展开后加载
      style:
        padding: 16px
```
