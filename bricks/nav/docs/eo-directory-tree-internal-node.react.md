---
tagName: eo-directory-tree-internal-node
displayName: WrappedEoDirectoryTreeInternalNode
description: 目录树中间节点
category: ""
source: "@next-bricks/nav"
---

# WrappedEoDirectoryTreeInternalNode

> 目录树中间节点

## 导入

```tsx
import { WrappedEoDirectoryTreeInternalNode } from "@easyops/wrapped-components";
```

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

| 事件     | detail                                                    | 说明                |
| -------- | --------------------------------------------------------- | ------------------- |
| onExpand | `boolean` — 展开后的状态（true 表示展开，false 表示收起） | 节点展开/收起时触发 |
| onSelect | `void`                                                    | 节点被选中时触发    |

## Slots

| 名称     | 说明         |
| -------- | ------------ |
| label    | 节点标签内容 |
| suffix   | 节点后缀内容 |
| （默认） | 子节点内容   |

## Examples

### Basic

展示包含标签和后缀内容的可展开目录树节点。

```tsx
<WrappedEoDirectoryTreeInternalNode
  style={{ width: 200 }}
  onExpand={(e) => console.log(e.detail)}
>
  <span slot="label">第一层级</span>
  <WrappedEoTag slot="suffix" color="red">
    suffixBrick
  </WrappedEoTag>
  <WrappedEoDirectoryTreeLeaf depth={1}>
    <span>第二层级-1</span>
  </WrappedEoDirectoryTreeLeaf>
  <WrappedEoDirectoryTreeLeaf depth={1}>
    <span>第二层级-2</span>
  </WrappedEoDirectoryTreeLeaf>
  <WrappedEoDirectoryTreeLeaf depth={1}>
    <span>第二层级-3</span>
  </WrappedEoDirectoryTreeLeaf>
</WrappedEoDirectoryTreeInternalNode>
```

### Selectable

展示节点可选中的目录树节点，支持独立点击展开和选中。

```tsx
<WrappedEoDirectoryTreeInternalNode
  style={{ width: 200 }}
  selectable={true}
  onExpand={(e) => console.log(e.detail)}
  onSelect={(e) => console.log(e.detail)}
>
  <span slot="label">第一层级</span>
  <WrappedEoTag slot="suffix" color="red">
    suffixBrick
  </WrappedEoTag>
  <WrappedEoDirectoryTreeLeaf depth={1}>
    <span>第二层级-1</span>
  </WrappedEoDirectoryTreeLeaf>
  <WrappedEoDirectoryTreeLeaf depth={1}>
    <span>第二层级-2</span>
  </WrappedEoDirectoryTreeLeaf>
  <WrappedEoDirectoryTreeLeaf depth={1}>
    <span>第二层级-3</span>
  </WrappedEoDirectoryTreeLeaf>
</WrappedEoDirectoryTreeInternalNode>
```

### With Icon

展示带有节点图标的目录树中间节点，以及 faded 淡化状态效果。

```tsx
<WrappedEoDirectoryTreeInternalNode
  style={{ width: 200 }}
  icon={{ lib: "antd", icon: "folder", theme: "outlined" }}
  expanded={true}
  selected={true}
  faded={false}
>
  <span slot="label">文件夹节点</span>
  <WrappedEoDirectoryTreeLeaf depth={1} faded={true}>
    <span>子文件1（淡化）</span>
  </WrappedEoDirectoryTreeLeaf>
</WrappedEoDirectoryTreeInternalNode>
```
