---
tagName: data-view.cabinet-node
displayName: WrappedDataViewCabinetNode
description: cabinet子构件----节点
category: ""
source: "@next-bricks/data-view"
---

# data-view.cabinet-node

> cabinet子构件----节点

## Props

| 属性      | 类型                                                                    | 必填 | 默认值 | 说明         |
| --------- | ----------------------------------------------------------------------- | ---- | ------ | ------------ |
| type      | `"container-group" \| "physical-machine" \| "virtual-machine" \| "pod"` | 是   | -      | 类型         |
| nodeTitle | `string`                                                                | 是   | -      | 标题         |
| status    | `"active" \| "faded"`                                                   | 否   | -      | 当前状态     |
| isAlert   | `boolean`                                                               | 否   | -      | 是否是告警态 |

## Examples

### Basic

展示容器组类型的节点。

```yaml preview
- brick: data-view.cabinet-node
  properties:
    type: container-group
    nodeTitle: 容器组
    style:
      width: 100px
      background: "#1c1e21"
```

### IsAlert

展示处于告警态的节点（图标变为告警样式）。

```yaml preview
- brick: data-view.cabinet-node
  properties:
    type: container-group
    nodeTitle: 容器组
    isAlert: true
    style:
      width: 100px
      background: "#1c1e21"
```

### Status

展示不同状态（高亮或淡化）下的节点。

```yaml preview
- brick: data-view.cabinet-node
  properties:
    type: virtual-machine
    nodeTitle: 虚拟机
    status: faded
    style:
      width: 100px
      background: "#1c1e21"
```
