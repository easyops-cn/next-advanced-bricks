---
tagName: eo-directory-tree-internal-node
displayName: WrappedEoDirectoryTreeInternalNode
description: 目录树中间节点
category: ""
source: "@next-bricks/nav"
---

# eo-directory-tree-internal-node

> 目录树中间节点

## Props

| 属性       | 类型                            | 必填 | 默认值 | 说明             |
| ---------- | ------------------------------- | ---- | ------ | ---------------- |
| depth      | `number`                        | 是   | `0`    | 深度             |
| expanded   | `boolean \| undefined`          | 否   | —      | 是否展开         |
| selectable | `boolean \| undefined`          | 否   | —      | 可选择           |
| selected   | `boolean \| undefined`          | 否   | —      | 是否选中         |
| icon       | `GeneralIconProps \| undefined` | 否   | —      | 节点图标         |
| faded      | `boolean \| undefined`          | 否   | —      | 节点是否淡化显示 |

## Events

| 事件   | detail                                                    | 说明                |
| ------ | --------------------------------------------------------- | ------------------- |
| expand | `boolean` — 展开后的状态（true 表示展开，false 表示收起） | 节点展开/收起时触发 |
| select | `void`                                                    | 节点被选中时触发    |

## Slots

| 名称     | 说明         |
| -------- | ------------ |
| label    | 节点标签内容 |
| suffix   | 节点后缀内容 |
| （默认） | 子节点内容   |

## Examples

### Basic

展示包含标签和后缀内容的可展开目录树节点。

```yaml preview
brick: eo-directory-tree-internal-node
events:
  expand:
    - action: console.log
      args:
        - <% EVENT.detail %>
properties:
  style:
    width: 200px
children:
  - brick: span
    slot: label
    properties:
      textContent: 第一层级
  - brick: eo-tag
    slot: suffix
    properties:
      textContent: suffixBrick
      color: red
  - brick: eo-directory-tree-leaf
    properties:
      depth: 1
    children:
      - brick: span
        properties:
          textContent: 第二层级-1
  - brick: eo-directory-tree-leaf
    properties:
      depth: 1
    children:
      - brick: span
        properties:
          textContent: 第二层级-2
  - brick: eo-directory-tree-leaf
    properties:
      depth: 1
    children:
      - brick: span
        properties:
          textContent: 第二层级-3
```

### Selectable

展示节点可选中的目录树节点，支持独立点击展开和选中。

```yaml preview
brick: eo-directory-tree-internal-node
events:
  expand:
    - action: console.log
      args:
        - <% EVENT.detail %>
  select:
    - action: console.log
      args:
        - <% EVENT.detail %>
properties:
  selectable: true
  style:
    width: 200px
children:
  - brick: span
    slot: label
    properties:
      textContent: 第一层级
  - brick: eo-tag
    slot: suffix
    properties:
      textContent: suffixBrick
      color: red
  - brick: eo-directory-tree-leaf
    properties:
      depth: 1
    children:
      - brick: span
        properties:
          textContent: 第二层级-1
  - brick: eo-directory-tree-leaf
    properties:
      depth: 1
    children:
      - brick: span
        properties:
          textContent: 第二层级-2
  - brick: eo-directory-tree-leaf
    properties:
      depth: 1
    children:
      - brick: span
        properties:
          textContent: 第二层级-3
```

### With Icon

展示带有节点图标的目录树中间节点，以及 faded 淡化状态效果。

```yaml preview
brick: eo-directory-tree-internal-node
properties:
  style:
    width: 200px
  icon:
    lib: antd
    icon: folder
    theme: outlined
  expanded: true
  selected: true
  faded: false
children:
  - brick: span
    slot: label
    properties:
      textContent: 文件夹节点
  - brick: eo-directory-tree-leaf
    properties:
      depth: 1
      faded: true
    children:
      - brick: span
        properties:
          textContent: 子文件1（淡化）
```
