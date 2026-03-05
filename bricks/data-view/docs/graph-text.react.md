---
tagName: data-view.graph-text
displayName: WrappedDataViewGraphText
description: Graph text
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewGraphText

> Graph text

## 导入

```tsx
import { WrappedDataViewGraphText } from "@easyops/wrapped-components";
```

## Props

| 属性  | 类型               | 必填 | 默认值 | 说明     |
| ----- | ------------------ | ---- | ------ | -------- |
| text  | `string`           | 是   | -      | 文本标题 |
| value | `string \| number` | 是   | -      | 文本值   |

## Examples

### Basic

展示 graph 文本节点的基本用法，包含标题和数值。

```tsx
<WrappedDataViewGraphText text="负载均衡数" value={234} />
```
