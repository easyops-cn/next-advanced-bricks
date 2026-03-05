---
tagName: data-view.modern-style-treemap
displayName: WrappedDataViewModernStyleTreemap
description: 现代风树图
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewModernStyleTreemap

> 现代风树图

## 导入

```tsx
import { WrappedDataViewModernStyleTreemap } from "@easyops/wrapped-components";
```

## Props

| 属性               | 类型                                                                                                                   | 必填 | 默认值              | 说明              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---- | ------------------- | ----------------- |
| data               | `TreemapData`                                                                                                          | 是   | -                   | 数据              |
| tail               | `"treemapBinary" \| "treemapDice" \| "treemapResquarify" \| "treemapSlice" \| "treemapSliceDice" \| "treemapSquarify"` | 否   | `"treemapSquarify"` | 平铺方法          |
| leafUseBrick       | `{ useBrick: UseBrickConf }`                                                                                           | 否   | -                   | 叶子节点 useBrick |
| leafContainerStyle | `React.CSSProperties`                                                                                                  | 否   | -                   | 叶子节点容器样式  |
| tooltipUseBrick    | `{ useBrick: UseBrickConf }`                                                                                           | 否   | -                   | tooltip useBrick  |
| tooltipStyle       | `React.CSSProperties`                                                                                                  | 否   | -                   | tooltip 容器样式  |

## Events

| 事件           | detail                                                                    | 说明               |
| -------------- | ------------------------------------------------------------------------- | ------------------ |
| onTreemapClick | `TreemapData` — { name: 节点名称, value: 节点数值, children: 子节点列表 } | 点击叶子节点时触发 |

## Examples

### Basic

展示现代风树图的基本用法，包含叶子节点自定义渲染和 tooltip 配置。

```tsx
<WrappedDataViewModernStyleTreemap
  style={{
    width: "100%",
    height: "800px",
    display: "block",
    backgroundColor: "#1c1e21",
  }}
  data={{
    name: "flare",
    children: [
      {
        name: "analytics",
        children: [
          { name: "AgglomerativeCluster", value: 3938 },
          { name: "CommunityStructure", value: 3812 },
          { name: "HierarchicalCluster", value: 6714 },
        ],
      },
      {
        name: "animate",
        children: [
          { name: "Easing", value: 17010 },
          { name: "FunctionSequence", value: 5842 },
        ],
      },
      {
        name: "data",
        children: [
          { name: "DataField", value: 1759 },
          { name: "DataSchema", value: 2165 },
          { name: "DataSet", value: 586 },
        ],
      },
    ],
  }}
  tooltipUseBrick={{
    useBrick: {
      brick: "span",
      properties: { textContent: "<% DATA.data?.name %>" },
    },
  }}
  leafUseBrick={{
    useBrick: {
      brick: "div",
      properties: {
        textContent: "<% DATA.data.name %>",
        style: { color: "#FFFFFF", padding: "8px" },
      },
    },
  }}
  onTreemapClick={(e) => console.log(e.detail)}
/>
```

### Custom Tiling

展示使用不同平铺算法的现代风树图。

```tsx
<WrappedDataViewModernStyleTreemap
  tail="treemapBinary"
  leafContainerStyle={{ border: "1px solid rgba(74, 234, 255, 0.3)" }}
  data={{
    name: "root",
    children: [
      { name: "A", value: 500 },
      { name: "B", value: 300 },
      { name: "C", value: 200 },
      { name: "D", value: 150 },
      { name: "E", value: 100 },
    ],
  }}
  style={{
    width: "100%",
    height: "400px",
    display: "block",
    backgroundColor: "#1c1e21",
  }}
  leafUseBrick={{
    useBrick: {
      brick: "div",
      properties: {
        textContent: "<% DATA.data.name %>",
        style: { color: "#FFFFFF", padding: "8px" },
      },
    },
  }}
/>
```
