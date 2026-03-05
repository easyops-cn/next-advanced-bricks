---
tagName: ai-portal.flow-tabs
displayName: WrappedAiPortalFlowTabs
description: 流程标签页组件，提供带背景画布动效的标签导航，支持工具栏插槽和默认内容插槽。
category: navigate
source: "@next-bricks/ai-portal"
---

# ai-portal.flow-tabs

> 流程标签页组件，提供带背景画布动效的标签导航，支持工具栏插槽和默认内容插槽。

## Props

| 属性      | 类型     | 必填 | 默认值 | 说明                                  |
| --------- | -------- | ---- | ------ | ------------------------------------- |
| tabs      | `Tab[]`  | 否   | -      | 标签列表，每项包含 `id` 和 `label`    |
| activeTab | `string` | 否   | -      | 当前激活的标签 ID，点击标签时自动更新 |

## Events

| 事件      | detail                                       | 说明                                      |
| --------- | -------------------------------------------- | ----------------------------------------- |
| tab.click | `Tab` — { id: 标签 ID, label: 标签显示文本 } | 点击标签项时触发，同时更新 activeTab 属性 |

## Slots

| 名称    | 说明                 |
| ------- | -------------------- |
| toolbar | 标签栏右侧工具栏区域 |
| default | 标签页内容区域       |

## Examples

### Basic

基础标签页，展示多个流程步骤标签。

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.flow-tabs
    properties:
      tabs:
        - id: foo
          label: Fooooo
        - id: bar
          label: Baaaaar
        - id: baz
          label: Baaaaaz
      activeTab: foo
    events:
      tab.click:
        action: "console.log"
```

### With Toolbar Slot

在标签栏右侧添加工具栏操作按钮。

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.flow-tabs
    properties:
      tabs:
        - id: design
          label: 设计阶段
        - id: develop
          label: 开发阶段
        - id: test
          label: 测试阶段
        - id: deploy
          label: 部署阶段
      activeTab: design
    children:
      - brick: ai-portal.icon-button
        slot: toolbar
        properties:
          icon:
            lib: antd
            icon: filter
          tooltip: 筛选
    events:
      tab.click:
        action: "console.log"
```

### With Content

标签页带内容区域，点击标签切换展示不同内容。

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.flow-tabs
    properties:
      tabs:
        - id: overview
          label: 概览
        - id: detail
          label: 详情
        - id: history
          label: 历史
      activeTab: overview
    children:
      - brick: span
        properties:
          textContent: 这里是内容区域
          style:
            padding: 16px
            display: block
    events:
      tab.click:
        action: "console.log"
```
