---
tagName: data-view.complex-search
displayName: WrappedDataViewComplexSearch
description: 大屏搜索构件
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.complex-search

> 大屏搜索构件

## Props

| 属性            | 类型                          | 必填 | 默认值 | 说明             |
| --------------- | ----------------------------- | ---- | ------ | ---------------- |
| value           | `string \| undefined`         | 否   | -      | 初始值           |
| placeholder     | `string \| undefined`         | 否   | -      | 占位符           |
| options         | `OptionItem[]`                | 是   | -      | 下拉选项         |
| tooltipUseBrick | `ReactUseMultipleBricksProps` | 是   | -      | tooltip useBrick |

## Events

| 事件   | detail                                            | 说明            |
| ------ | ------------------------------------------------- | --------------- |
| change | `string` — 当前输入框的文本值                     | input值改变事件 |
| search | `string` — 当前搜索的文本值                       | input值搜索事件 |
| select | `OptionItem` — { icon: 图标配置, name: 选项名称 } | 下拉选择事件    |
| focus  | -                                                 | 聚焦事件        |
| blur   | -                                                 | 失焦事件        |

## Examples

### Basic

基本用法，展示带下拉选项的搜索框，支持搜索、选择和聚焦事件。

```yaml preview
- brick: data-view.complex-search
  properties:
    placeholder: Search
    style:
      background: "#1c1e21"
      display: block
      height: 300px
    options:
      - name: 主机1
        icon:
          lib: "antd"
          icon: "account-book"
          theme: "outlined"
      - name: 主机2
        icon:
          lib: "antd"
          icon: "account-book"
          theme: "outlined"
  events:
    change:
      - action: console.log
    select:
      - action: console.log
    search:
      - action: console.log
    focus:
      - action: console.log
    blur:
      - action: console.log
```

### With Value and TooltipUseBrick

设置初始值，并通过 tooltipUseBrick 自定义下拉项的 tooltip 内容。

```yaml preview
- brick: data-view.complex-search
  properties:
    value: 主机1
    placeholder: 请输入搜索内容
    style:
      background: "#1c1e21"
      display: block
      height: 300px
    options:
      - name: 主机1
        icon:
          lib: "antd"
          icon: "account-book"
          theme: "outlined"
        description: 这是主机1的描述
      - name: 主机2
        icon:
          lib: "antd"
          icon: "account-book"
          theme: "outlined"
        description: 这是主机2的描述
    tooltipUseBrick:
      useBrick:
        - brick: div
          properties:
            textContent: <% DATA.description %>
            style:
              color: "#fff"
              padding: 8px
  events:
    select:
      - action: console.log
    search:
      - action: console.log
```
