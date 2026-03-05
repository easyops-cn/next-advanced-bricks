---
tagName: data-view.graph-layout-grid
displayName: WrappedDataViewGraphLayoutGrid
description: Graph grid 布局
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewGraphLayoutGrid

> Graph grid 布局

## 导入

```tsx
import { WrappedDataViewGraphLayoutGrid } from "@easyops/wrapped-components";
```

## Props

| 属性       | 类型               | 必填 | 默认值 | 说明                                                                                           |
| ---------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------------------- |
| columns    | `number`           | 是   | -      | 布局的列数                                                                                     |
| rows       | `number`           | 是   | -      | 布局的行数                                                                                     |
| dataSource | `DataSourceType[]` | -    | -      | 数据源，每项包含 text、value 和 url 字段                                                       |
| isReverse  | `boolean`          | -    | -      | 布局是否反转。默认奇数行位置13579…，偶数行位置02468…；反转后偶数行位置13579…，奇数行位置02468… |

## Examples

### Basic

展示 graph grid 布局的基本用法，按网格规律排列图文节点。

```tsx
<WrappedDataViewGraphLayoutGrid
  columns={7}
  rows={3}
  style={{
    width: "960px",
    height: "600px",
    display: "block",
    backgroundColor: "#1c1e21",
  }}
  dataSource={[
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "应用",
      value: 7348,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "存储卷数",
      value: 638,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "应用",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "守护进程数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "容器组数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "无状态服务数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
  ]}
/>
```

### IsReverse

开启 isReverse 后，节点排布方式按偶数行优先排列。

```tsx
<WrappedDataViewGraphLayoutGrid
  columns={7}
  rows={3}
  isReverse={true}
  style={{
    width: "960px",
    height: "600px",
    display: "block",
    backgroundColor: "#1c1e21",
  }}
  dataSource={[
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "应用",
      value: 7348,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "存储卷数",
      value: 638,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "应用",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "守护进程数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "容器组数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "无状态服务数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
    {
      text: "负载均衡数",
      value: 200,
      url: "https://user-assets.sxlcdn.com/images/367275/FtgabYjUD_Xhmne2wsyLPcKqlgCi.png",
    },
  ]}
/>
```
