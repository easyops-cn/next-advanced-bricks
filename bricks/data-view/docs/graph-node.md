---
tagName: data-view.graph-node
displayName: WrappedDataViewGraphNode
description: Graph Node
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.graph-node

> Graph Node

## Props

| 属性 | 类型     | 必填 | 默认值 | 说明         |
| ---- | -------- | ---- | ------ | ------------ |
| url  | `string` | 是   | -      | 节点图片路径 |

## Examples

### Basic

展示 graph 节点的基本用法，通过 url 指定节点图片。

```yaml preview
brick: data-view.graph-node
properties:
  url: https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png
  style:
    width: 140px
    display: block
```
