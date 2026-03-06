---
tagName: api-market.apis-directory-tree
displayName: WrappedApiMarketApisDirectoryTree
description: API目录树
category:
source: "@next-bricks/api-market"
---

# WrappedApiMarketApisDirectoryTree

> API目录树

## 导入

```tsx
import { WrappedApiMarketApisDirectoryTree } from "@easyops/wrapped-components";
```

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

| 事件          | detail                                                                                          | 说明             |
| ------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| onExpand      | `{ keys: string[]; node: NodeData }` — { keys: 展开的 key 列表, node: 触发展开的节点数据 }      | 展开事件         |
| onSelect      | `{ keys: string[]; node: NodeData }` — { keys: 选择的 key 列表, node: 触发选择的节点数据 }      | 选择事件         |
| onActionClick | `{ data: NodeData; action: SimpleActionType }` — { data: 点击的节点数据, action: 点击的操作项 } | actions 点击事件 |

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

```tsx
import { useRef } from "react";
import { WrappedApiMarketApisDirectoryTree } from "@easyops/wrapped-components";
import { WrappedEoMiniActions } from "@easyops/wrapped-components";
import { WrappedEoTag } from "@easyops/wrapped-components";

function BasicExample() {
  const treeRef = useRef<any>();

  const data = [
    { key: "0", title: "第一层级 - 0", type: "group" },
    {
      key: "1",
      title: "第一层级 - 1",
      type: "group",
      children: [
        { key: "1-0", title: "第二层级 - 0", type: "group" },
        {
          key: "1-1",
          title: "第二层级 - 1",
          type: "group",
          children: [
            {
              key: "1-1-0",
              title: "第三层级 - 0",
              type: "item",
              data: { method: "DELETE" },
            },
            {
              key: "1-1-1",
              title: "第三层级 - 1",
              type: "item",
              data: { method: "GET" },
            },
            {
              key: "1-1-2",
              title: "第三层级 - 2",
              type: "item",
              data: { method: "POST" },
            },
          ],
        },
        { key: "1-3", title: "第二层级 - 2", type: "group" },
      ],
    },
    { key: "2", title: "第一层级 - 2", type: "group" },
    { key: "3", title: "第一层级 - 3", type: "group" },
    { key: "4", title: "第一层级 - 4", type: "group" },
  ];

  return (
    <WrappedApiMarketApisDirectoryTree
      ref={treeRef}
      style={{ width: 400 }}
      directoryTitle="目录名称标题"
      placeholder="输入关键词"
      searchable={true}
      selectedKeys={["1-1-1"]}
      data={data}
      onExpand={(e) => console.log(e.detail)}
      onSelect={(e) => console.log(e.detail)}
      onActionClick={(e) => console.log(e.detail)}
    >
      <WrappedEoMiniActions
        slot="toolbar"
        actions={[
          {
            icon: { lib: "antd", icon: "down", theme: "outlined" },
            isDropdown: false,
            event: "expand.all",
          },
          {
            icon: { lib: "antd", icon: "up", theme: "outlined" },
            isDropdown: false,
            event: "collapse.all",
          },
          {
            icon: { lib: "antd", icon: "aim", theme: "outlined" },
            isDropdown: false,
            event: "aim",
          },
        ]}
        onExpandAll={() => treeRef.current?.expandAll()}
        onCollapseAll={() => treeRef.current?.collapseAll()}
        onAim={() => treeRef.current?.expandAccordingToSelectedKeys()}
      />
    </WrappedApiMarketApisDirectoryTree>
  );
}
```

### Hidden Node Suffix

隐藏节点右侧操作区域的用法。

```tsx
import { WrappedApiMarketApisDirectoryTree } from "@easyops/wrapped-components";

function HiddenNodeSuffixExample() {
  const data = [
    {
      key: "1",
      title: "分组 A",
      type: "group",
      children: [
        { key: "1-1", title: "接口 A-1", type: "item" },
        { key: "1-2", title: "接口 A-2", type: "item" },
      ],
    },
    {
      key: "2",
      title: "分组 B",
      type: "group",
      children: [{ key: "2-1", title: "接口 B-1", type: "item" }],
    },
  ];

  return (
    <WrappedApiMarketApisDirectoryTree
      style={{ width: 400 }}
      directoryTitle="隐藏操作"
      hiddenNodeSuffix={true}
      data={data}
    />
  );
}
```

### Search Fields

使用 searchFields 指定额外的搜索字段，支持按嵌套路径搜索。

```tsx
import { WrappedApiMarketApisDirectoryTree } from "@easyops/wrapped-components";

function SearchFieldsExample() {
  const data = [
    {
      key: "1",
      title: "用户管理",
      type: "group",
      children: [
        {
          key: "1-1",
          title: "获取用户列表",
          type: "item",
          data: { method: "GET" },
        },
        {
          key: "1-2",
          title: "创建用户",
          type: "item",
          data: { method: "POST" },
        },
      ],
    },
    {
      key: "2",
      title: "权限管理",
      type: "group",
      children: [
        {
          key: "2-1",
          title: "删除权限",
          type: "item",
          data: { method: "DELETE" },
        },
      ],
    },
  ];

  return (
    <WrappedApiMarketApisDirectoryTree
      style={{ width: 400 }}
      directoryTitle="额外搜索字段"
      searchable={true}
      placeholder="搜索关键字或方法"
      searchFields={["type", ["data", "method"]]}
      data={data}
    />
  );
}
```

### Expanded Keys

通过 expandedKeys 控制展开的节点。

```tsx
import { WrappedApiMarketApisDirectoryTree } from "@easyops/wrapped-components";

function ExpandedKeysExample() {
  const data = [
    {
      key: "1",
      title: "分组 A",
      type: "group",
      children: [
        {
          key: "1-1",
          title: "子分组 A-1",
          type: "group",
          children: [{ key: "1-1-1", title: "接口 A-1-1", type: "item" }],
        },
        { key: "1-2", title: "接口 A-2", type: "item" },
      ],
    },
    {
      key: "2",
      title: "分组 B",
      type: "group",
      children: [{ key: "2-1", title: "接口 B-1", type: "item" }],
    },
  ];

  return (
    <WrappedApiMarketApisDirectoryTree
      style={{ width: 400 }}
      directoryTitle="控制展开"
      expandedKeys={["1", "1-1"]}
      data={data}
    />
  );
}
```
