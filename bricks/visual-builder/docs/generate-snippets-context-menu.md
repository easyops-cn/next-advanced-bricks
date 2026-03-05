---
tagName: visual-builder.generate-snippets-context-menu
displayName: WrappedVisualBuilderGenerateSnippetsContextMenu
description: 用于 Visual Builder 的代码片段右键上下文菜单，支持拖拽片段到画布，菜单位置自动适配视口边界
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.generate-snippets-context-menu

> 用于 Visual Builder 的代码片段右键上下文菜单，支持拖拽片段到画布，菜单位置自动适配视口边界

## Props

| 属性     | 类型              | 必填 | 默认值 | 说明                                                          |
| -------- | ----------------- | ---- | ------ | ------------------------------------------------------------- |
| options  | `SnippetOption[]` | 否   | -      | 菜单选项列表，每组包含标题和子菜单项                          |
| active   | `boolean`         | 否   | -      | 菜单是否处于激活（显示）状态，通过 open/close 方法控制        |
| position | `Position`        | 否   | -      | 菜单显示位置，格式为 `[clientX, clientY]`，超出视口时自动修正 |

## Events

| 事件            | detail                                                                                         | 说明                                       |
| --------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------ |
| item.drag.start | `SnippetItem` — { text: 片段文本, icon: 图标, dragConf: { format: 数据格式, data: 数据内容 } } | 用户开始拖拽菜单项时触发                   |
| item.drag.end   | `SnippetItem` — { text: 片段文本, icon: 图标, dragConf: { format: 数据格式, data: 数据内容 } } | 用户结束拖拽菜单项时触发，同时菜单自动关闭 |

## Methods

| 方法  | 参数                               | 返回值 | 说明                           |
| ----- | ---------------------------------- | ------ | ------------------------------ |
| open  | `({ position }: OpenInfo) => void` | `void` | 打开上下文菜单并定位到指定位置 |
| close | `() => void`                       | `void` | 关闭上下文菜单                 |

## Examples

### Basic

展示代码片段上下文菜单的基本用法，右键点击区域后显示菜单，可拖拽菜单项。

```yaml preview
- brick: div
  properties:
    textContent: 右键点击此区域打开菜单
    style:
      padding: 40px
      border: 1px dashed #ccc
      textAlign: center
      userSelect: none
  events:
    contextmenu:
      target: "#snippet-menu"
      method: open
      args:
        - position:
            - "<% EVENT.clientX %>"
            - "<% EVENT.clientY %>"
- brick: visual-builder.generate-snippets-context-menu
  properties:
    id: snippet-menu
    options:
      - title: 基础组件
        children:
          - text: 按钮
            icon:
              lib: antd
              icon: border
            dragConf:
              format: text/plain
              data:
                brick: eo-button
                properties:
                  textContent: 新按钮
          - text: 输入框
            icon:
              lib: antd
              icon: edit
            dragConf:
              format: text/plain
              data:
                brick: eo-input
      - title: 布局组件
        children:
          - text: 卡片
            icon:
              lib: antd
              icon: credit-card
            tooltip: 拖拽以添加卡片
            dragConf:
              format: text/plain
              data:
                brick: eo-card
  events:
    item.drag.start:
      action: console.log
    item.drag.end:
      action: console.log
```

### With Disabled Items

展示带有禁用状态的菜单项，禁用项不可拖拽。

```yaml preview
- brick: div
  properties:
    textContent: 右键点击此区域打开菜单（部分选项已禁用）
    style:
      padding: 40px
      border: 1px dashed #ccc
      textAlign: center
      userSelect: none
  events:
    contextmenu:
      target: "#snippet-menu-disabled"
      method: open
      args:
        - position:
            - "<% EVENT.clientX %>"
            - "<% EVENT.clientY %>"
- brick: visual-builder.generate-snippets-context-menu
  properties:
    id: snippet-menu-disabled
    options:
      - title: 组件列表
        children:
          - text: 按钮（可用）
            icon:
              lib: antd
              icon: border
            dragConf:
              format: text/plain
              data:
                brick: eo-button
          - text: 表格（禁用）
            icon:
              lib: antd
              icon: table
            disabled: true
            tooltip: 该组件在当前场景不可用
```
