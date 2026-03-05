---
tagName: eo-directory-tree
displayName: WrappedEoDirectoryTree
description: 目录树
category: ""
source: "@next-bricks/nav"
---

# WrappedEoDirectoryTree

> 目录树

## 导入

```tsx
import { WrappedEoDirectoryTree } from "@easyops/wrapped-components";
```

## Props

| 属性                   | 类型                                  | 必填 | 默认值 | 说明                                       |
| ---------------------- | ------------------------------------- | ---- | ------ | ------------------------------------------ |
| data                   | `TreeItem[]`                          | 是   | `[]`   | 数据源                                     |
| directoryTitle         | `string \| undefined`                 | 否   | —      | 目录标题                                   |
| internalNodeSelectable | `boolean \| undefined`                | 否   | —      | 设置中间节点是否可选，默认只有叶子节点可选 |
| searchable             | `boolean \| undefined`                | 否   | —      | 可搜索                                     |
| placeholder            | `string \| undefined`                 | 否   | —      | 搜索占位说明                               |
| searchFields           | `(string \| string[])[] \| undefined` | 否   | —      | 除了 title 以外，额外的搜索字段            |
| suffixBrick            | `SuffixBrickConf \| undefined`        | 否   | —      | 后缀 useBrick                              |
| selectedKeys           | `string[] \| undefined`               | 否   | —      | 选中的 keys                                |
| expandedKeys           | `string[] \| undefined`               | 否   | —      | 展开的 keys                                |

## Events

| 事件     | detail                                                                                      | 说明     |
| -------- | ------------------------------------------------------------------------------------------- | -------- |
| onExpand | `{ keys: string[]; node: NodeData }` — { keys: 展开的 keys 列表, node: 触发展开的节点数据 } | 展开事件 |
| onSelect | `{ keys: string[]; node: NodeData }` — { keys: 选中的 keys 列表, node: 触发选择的节点数据 } | 选择事件 |

## Methods

| 方法                          | 参数         | 返回值 | 说明           |
| ----------------------------- | ------------ | ------ | -------------- |
| expandAll                     | `() => void` | `void` | 展开全部       |
| collapseAll                   | `() => void` | `void` | 收起全部       |
| expandAccordingToSelectedKeys | `() => void` | `void` | 根据选择项展开 |

## Examples

### Basic

展示可搜索的多层级目录树，支持展开/收起和节点选择。

```tsx
const ref = useRef<any>();

<WrappedEoDirectoryTree
  ref={ref}
  style={{ width: 400 }}
  directoryTitle="目录名称标题"
  placeholder="输入关键词"
  searchable={true}
  selectedKeys={["1-1-1"]}
  suffixBrick={{
    useBrick: {
      if: "<% !Array.isArray(DATA.data.children) %>",
      brick: "eo-tag",
      properties: { textContent: "<% DATA.data.key %>" },
    },
  }}
  data={[
    { key: "0", title: "第一层级 - 0" },
    {
      key: "1",
      title: "第一层级 - 1",
      children: [
        { key: "1-0", title: "第二层级 - 0" },
        {
          key: "1-1",
          title: "第二层级 - 1",
          children: [
            { key: "1-1-0", title: "第三层级 - 0" },
            { key: "1-1-1", title: "第三层级 - 1" },
            { key: "1-1-2", title: "第三层级 - 2" },
          ],
        },
        { key: "1-3", title: "第二层级 - 2" },
      ],
    },
    { key: "2", title: "第一层级 - 2" },
    { key: "3", title: "第一层级 - 3" },
    { key: "4", title: "第一层级 - 4" },
  ]}
  onExpand={(e) => console.log(e.detail)}
  onSelect={(e) => console.log(e.detail)}
/>
<button onClick={() => ref.current?.expandAll()}>展开全部</button>
<button onClick={() => ref.current?.collapseAll()}>收起全部</button>
<button onClick={() => ref.current?.expandAccordingToSelectedKeys()}>定位选中项</button>
```

### Internal Node Selectable

允许中间节点（非叶子节点）被选中。

```tsx
<WrappedEoDirectoryTree
  style={{ width: 400 }}
  directoryTitle="可选中间节点"
  internalNodeSelectable={true}
  data={[
    {
      key: "parent1",
      title: "父节点1",
      children: [
        { key: "child1", title: "子节点1" },
        { key: "child2", title: "子节点2" },
      ],
    },
    {
      key: "parent2",
      title: "父节点2",
      children: [{ key: "child3", title: "子节点3" }],
    },
  ]}
  onSelect={(e) => console.log(e.detail)}
/>
```

### Custom Search Fields

指定额外的搜索字段，在 title 之外扩展搜索范围。

```tsx
<WrappedEoDirectoryTree
  style={{ width: 400 }}
  directoryTitle="扩展搜索字段"
  searchable={true}
  placeholder="搜索名称或描述"
  searchFields={["description"]}
  expandedKeys={["parent1"]}
  data={[
    {
      key: "parent1",
      title: "应用服务",
      children: [
        { key: "child1", title: "服务A", description: "核心业务服务" },
        { key: "child2", title: "服务B", description: "辅助工具服务" },
      ],
    },
  ]}
/>
```
