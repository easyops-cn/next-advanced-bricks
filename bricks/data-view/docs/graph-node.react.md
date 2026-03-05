---
tagName: data-view.graph-node
displayName: WrappedDataViewGraphNode
description: Graph Node
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewGraphNode

> Graph Node

## 导入

```tsx
import { WrappedDataViewGraphNode } from "@easyops/wrapped-components";
```

## Props

| 属性 | 类型     | 必填 | 默认值 | 说明         |
| ---- | -------- | ---- | ------ | ------------ |
| url  | `string` | 是   | -      | 节点图片路径 |

## Examples

### Basic

展示 graph 节点的基本用法，通过 url 指定节点图片。

```tsx
<WrappedDataViewGraphNode
  url="https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png"
  style={{ width: "140px", display: "block" }}
/>
```
