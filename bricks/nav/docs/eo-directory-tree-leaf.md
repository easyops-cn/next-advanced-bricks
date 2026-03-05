---
tagName: eo-directory-tree-leaf
displayName: WrappedEoDirectoryTreeLeaf
description: 目录树叶子节点
category: ""
source: "@next-bricks/nav"
---

# eo-directory-tree-leaf

> 目录树叶子节点

## Props

| 属性     | 类型                            | 必填 | 默认值 | 说明             |
| -------- | ------------------------------- | ---- | ------ | ---------------- |
| depth    | `number`                        | 是   | `0`    | 深度             |
| selected | `boolean \| undefined`          | 否   | —      | 是否选中         |
| icon     | `GeneralIconProps \| undefined` | 否   | —      | 节点图标         |
| faded    | `boolean \| undefined`          | 否   | —      | 节点是否淡化显示 |

## Events

| 事件   | detail | 说明             |
| ------ | ------ | ---------------- |
| select | `void` | 节点被选中时触发 |

## Slots

| 名称     | 说明         |
| -------- | ------------ |
| （默认） | 节点标签内容 |
| suffix   | 节点后缀内容 |

## Examples

### Basic

展示基础叶子节点，包含标签和后缀内容，点击可触发选择事件。

```yaml preview
brick: eo-directory-tree-leaf
events:
  select:
    - action: console.log
properties:
  style:
    width: 200px
children:
  - brick: span
    properties:
      textContent: 第一层级
  - brick: eo-tag
    slot: suffix
    properties:
      textContent: suffixBrick
      color: red
```

### With Icon

展示带有节点图标的叶子节点。

```yaml preview
brick: eo-directory-tree-leaf
events:
  select:
    - action: console.log
      args:
        - <% EVENT.detail %>
properties:
  style:
    width: 200px
  icon:
    lib: antd
    icon: file
    theme: outlined
  selected: true
children:
  - brick: span
    properties:
      textContent: 文件节点
  - brick: eo-tag
    slot: suffix
    properties:
      textContent: 已选中
      color: green
```

### Faded State

展示淡化显示的叶子节点，用于表示禁用或不可用状态。

```yaml preview
brick: eo-directory-tree-leaf
properties:
  style:
    width: 200px
  faded: true
  depth: 0
children:
  - brick: span
    properties:
      textContent: 淡化节点
```
