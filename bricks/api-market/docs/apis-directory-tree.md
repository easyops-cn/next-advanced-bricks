---
tagName: api-market.apis-directory-tree
displayName: WrappedApiMarketApisDirectoryTree
description: API目录树
category:
source: "@next-bricks/api-market"
---

# api-market.apis-directory-tree

> API目录树

## Props

| 属性             | 类型                     | 必填 | 默认值  | 说明                            |
| ---------------- | ------------------------ | ---- | ------- | ------------------------------- |
| data             | `TreeItem[]`             | 否   | `[]`    | 数据源                          |
| directoryTitle   | `string`                 | 否   | -       | 目录标题                        |
| searchable       | `boolean`                | 否   | -       | 可搜索                          |
| hiddenNodeSuffix | `boolean`                | 否   | `false` | 隐藏node节点右侧操作            |
| placeholder      | `string`                 | 否   | -       | 搜索占位说明                    |
| searchFields     | `(string \| string[])[]` | 否   | -       | 除了 title 以外，额外的搜索字段 |
| selectedKeys     | `string[]`               | 否   | -       | 选中的 keys                     |
| expandedKeys     | `string[]`               | 否   | -       | 展开的 keys                     |

## Events

| 事件         | detail                                                                                          | 说明             |
| ------------ | ----------------------------------------------------------------------------------------------- | ---------------- |
| expand       | `{ keys: string[]; node: NodeData }` — { keys: 展开的 key 列表, node: 触发展开的节点数据 }      | 展开事件         |
| select       | `{ keys: string[]; node: NodeData }` — { keys: 选择的 key 列表, node: 触发选择的节点数据 }      | 选择事件         |
| action.click | `{ data: NodeData; action: SimpleActionType }` — { data: 点击的节点数据, action: 点击的操作项 } | actions 点击事件 |

## Methods

| 方法                          | 参数 | 返回值 | 说明           |
| ----------------------------- | ---- | ------ | -------------- |
| expandAll                     | -    | `void` | 展开全部       |
| collapseAll                   | -    | `void` | 收起全部       |
| expandAccordingToSelectedKeys | -    | `void` | 根据选择项展开 |

## Slots

| 名称    | 说明                     |
| ------- | ------------------------ |
| toolbar | 目录标题右侧的工具栏区域 |

## Examples

### Basic

基本用法，展示带搜索、选中和工具栏的 API 目录树。

```yaml preview
brick: api-market.apis-directory-tree
events:
  expand:
    - action: console.log
      args:
        - <% EVENT.detail %>
  select:
    - action: console.log
      args:
        - <% EVENT.detail %>
  action.click:
    - action: console.log
      args:
        - <% EVENT.detail %>
properties:
  id: directory-tree
  style:
    width: 400px
  directoryTitle: 目录名称标题
  placeholder: 输入关键词
  searchable: true
  selectedKeys:
    - "1-1-1"
  suffixBrick:
    useBrick:
      if: <% !Array.isArray(DATA.data.children) %>
      brick: eo-tag
      properties:
        textContent: <% DATA.data.key %>
  data:
    - key: "0"
      title: "第一层级 - 0"
      type: "group"
    - key: "1"
      title: "第一层级 - 1"
      type: "group"
      children:
        - key: 1-0
          title: "第二层级 - 0"
          type: "group"
        - key: 1-1
          title: "第二层级 - 1"
          type: "group"
          children:
            - key: 1-1-0
              title: "第三层级 - 0"
              type: "item"
              data:
                method: "DELETE"
            - key: 1-1-1
              title: "第三层级 - 1"
              type: "item"
              data:
                method: "GET"
            - key: 1-1-2
              title: "第三层级 - 2"
              type: "item"
              data:
                method: "POST"
        - key: 1-3
          title: "第二层级 - 2"
          type: "group"
    - key: "2"
      title: "第一层级 - 2"
      type: "group"
    - key: "3"
      title: "第一层级 - 3"
      type: "group"
    - key: "4"
      title: "第一层级 - 4"
      type: "group"
children:
  - slot: toolbar
    brick: eo-mini-actions
    events:
      expand.all:
        - target: "#directory-tree"
          method: expandAll
      collapse.all:
        - target: "#directory-tree"
          method: collapseAll
      aim:
        - target: "#directory-tree"
          method: expandAccordingToSelectedKeys
    properties:
      actions:
        - icon:
            lib: antd
            icon: down
            theme: outlined
          isDropdown: false
          event: expand.all
        - icon:
            lib: antd
            icon: up
            theme: outlined
          isDropdown: false
          event: collapse.all
        - icon:
            lib: antd
            icon: aim
            theme: outlined
          isDropdown: false
          event: aim
```

### Hidden Node Suffix

隐藏节点右侧操作区域的用法。

```yaml preview
brick: api-market.apis-directory-tree
properties:
  style:
    width: 400px
  directoryTitle: 隐藏操作
  hiddenNodeSuffix: true
  data:
    - key: "1"
      title: "分组 A"
      type: "group"
      children:
        - key: 1-1
          title: "接口 A-1"
          type: "item"
        - key: 1-2
          title: "接口 A-2"
          type: "item"
    - key: "2"
      title: "分组 B"
      type: "group"
      children:
        - key: 2-1
          title: "接口 B-1"
          type: "item"
```

### Search Fields

使用 searchFields 指定额外的搜索字段，支持按嵌套路径搜索。

```yaml preview
brick: api-market.apis-directory-tree
properties:
  style:
    width: 400px
  directoryTitle: 额外搜索字段
  searchable: true
  placeholder: 搜索关键字或方法
  searchFields:
    - type
    - - data
      - method
  data:
    - key: "1"
      title: "用户管理"
      type: "group"
      children:
        - key: 1-1
          title: "获取用户列表"
          type: "item"
          data:
            method: "GET"
        - key: 1-2
          title: "创建用户"
          type: "item"
          data:
            method: "POST"
    - key: "2"
      title: "权限管理"
      type: "group"
      children:
        - key: 2-1
          title: "删除权限"
          type: "item"
          data:
            method: "DELETE"
```

### Expanded Keys

通过 expandedKeys 控制展开的节点。

```yaml preview
brick: api-market.apis-directory-tree
properties:
  style:
    width: 400px
  directoryTitle: 控制展开
  expandedKeys:
    - "1"
    - "1-1"
  data:
    - key: "1"
      title: "分组 A"
      type: "group"
      children:
        - key: 1-1
          title: "子分组 A-1"
          type: "group"
          children:
            - key: 1-1-1
              title: "接口 A-1-1"
              type: "item"
        - key: 1-2
          title: "接口 A-2"
          type: "item"
    - key: "2"
      title: "分组 B"
      type: "group"
      children:
        - key: 2-1
          title: "接口 B-1"
          type: "item"
```
