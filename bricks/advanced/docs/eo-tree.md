---
tagName: eo-tree
displayName: WrappedEoTree
description: 树形构件
category: display
source: "@next-bricks/advanced"
---

# eo-tree

> 树形构件

## Props

| 属性             | 类型                               | 必填 | 默认值 | 说明                                                                            |
| ---------------- | ---------------------------------- | ---- | ------ | ------------------------------------------------------------------------------- |
| dataSource       | `TreeNode[]`                       | 否   | -      | 树形数据源                                                                      |
| checkable        | `boolean`                          | 否   | -      | 是否显示 Checkbox，开启后可勾选节点                                             |
| selectable       | `boolean`                          | 否   | -      | 是否可选中节点                                                                  |
| defaultExpandAll | `boolean`                          | 否   | -      | 是否默认展开所有树节点                                                          |
| showLine         | `boolean`                          | 否   | -      | 是否显示连接线                                                                  |
| expandedKeys     | `TreeNodeKey[]`                    | 否   | -      | 受控展开的节点 key 集合                                                         |
| checkedKeys      | `TreeNodeKey[]`                    | 否   | -      | 受控勾选的节点 key 集合（仅在 checkable 为 true 时有效）                        |
| nodeDraggable    | `boolean \| { icon?: false }`      | 否   | -      | 是否允许拖拽节点，也可传入对象配置是否显示拖拽图标                              |
| switcherIcon     | `"auto" \| "chevron" \| false`     | 否   | -      | 自定义展开/折叠图标，可选 auto（默认箭头）、chevron（下箭头）或 false（不显示） |
| allowDrop        | `(info: AllowDropInfo) => boolean` | 否   | -      | 是否允许拖放到指定位置的判断函数                                                |
| titleSuffixBrick | `{ useBrick: UseBrickConf }`       | 否   | -      | 节点标题后缀插槽，通过 useBrick 在每个节点标题后渲染自定义构件                  |

## Events

| 事件         | detail                                                                                                                           | 说明                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| check        | `TreeNodeKey[]` — 所有勾选节点的 key 数组                                                                                        | 勾选状态变化时触发                 |
| check.detail | `CheckDetail` — { checkedKeys: 已勾选的节点 key 数组, halfCheckedKeys: 半选中的节点 key 数组 }                                   | 勾选状态变化时触发，包含半选中状态 |
| expand       | `TreeNodeKey[]` — 当前展开的节点 key 数组                                                                                        | 展开/折叠节点时触发                |
| node.drop    | `DropDetail` — { dragNode: 被拖拽的节点, dropNode: 放置目标节点, dropPosition: 放置位置（0 表示内部，-1 表示上方，1 表示下方） } | 节点拖拽放置时触发                 |

## Examples

### Basic

展示树形构件的基本用法，默认展开所有节点。

```yaml preview
brick: eo-tree
properties:
  defaultExpandAll: true
  dataSource:
    - title: parent 1
      key: 0-0
      children:
        - title: parent 1-0
          key: 0-0-0
          children:
            - title: leaf
              key: 0-0-0-0
            - title: leaf
              key: 0-0-0-1
        - title: parent 1-1
          key: 0-0-1
          children:
            - title: sss
              key: 0-0-1-0
```

### Checkable

开启 checkable 显示勾选框，并配置 showLine 显示连接线，勾选变化时触发 check 事件。

```yaml preview
brick: eo-tree
properties:
  defaultExpandAll: true
  checkable: true
  selectable: false
  showLine: true
  switcherIcon: chevron
  dataSource:
    - title: parent 1
      key: 0-0
      children:
        - title: parent 1-0
          key: 0-0-0
          children:
            - title: leaf
              key: 0-0-0-0
            - title: leaf
              key: 0-0-0-1
        - title: parent 1-1
          key: 0-0-1
          children:
            - title: sss
              key: 0-0-1-0
events:
  check:
    action: console.log
  check.detail:
    action: console.log
```

### Title Suffix Brick

通过 titleSuffixBrick 在每个节点标题后渲染自定义构件。

```yaml preview
brick: eo-tree
properties:
  defaultExpandAll: true
  titleSuffixBrick:
    useBrick:
      brick: eo-link
      properties:
        icon:
          lib: antd
          icon: edit
          theme: outlined
        style:
          margin-left: 5px
          font-size: 12px
  dataSource:
    - title: parent 1
      key: 0-0
      children:
        - title: parent 1-0
          key: 0-0-0
          children:
            - title: leaf
              key: 0-0-0-0
            - title: leaf
              key: 0-0-0-1
        - title: parent 1-1
          key: 0-0-1
          children:
            - title: sss
              key: 0-0-1-0
```

### Draggable

开启 nodeDraggable 允许拖拽节点，拖拽放置后触发 node.drop 事件。

```yaml preview
brick: eo-tree
properties:
  defaultExpandAll: true
  nodeDraggable: true
  dataSource:
    - title: parent 1
      key: 0-0
      children:
        - title: parent 1-0
          key: 0-0-0
          children:
            - title: leaf
              key: 0-0-0-0
            - title: leaf
              key: 0-0-0-1
        - title: parent 1-1
          key: 0-0-1
          children:
            - title: sss
              key: 0-0-1-0
events:
  node.drop:
    action: console.log
```

### Controlled Expand and Check

通过 expandedKeys 和 checkedKeys 受控管理展开与勾选状态，并监听 expand 事件。

```yaml preview
brick: eo-tree
properties:
  checkable: true
  expandedKeys:
    - 0-0
  checkedKeys:
    - 0-0-0-0
  dataSource:
    - title: parent 1
      key: 0-0
      children:
        - title: parent 1-0
          key: 0-0-0
          children:
            - title: leaf
              key: 0-0-0-0
            - title: leaf
              key: 0-0-0-1
        - title: parent 1-1
          key: 0-0-1
          children:
            - title: sss
              key: 0-0-1-0
events:
  expand:
    action: console.log
  check:
    action: console.log
```
