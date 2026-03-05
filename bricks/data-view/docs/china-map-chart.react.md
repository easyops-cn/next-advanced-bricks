---
tagName: data-view.china-map-chart
displayName: WrappedDataViewChinaMapChart
description: 中国地图图表构件，可以显示省级指标数据
category: ""
source: "@next-bricks/data-view"
deprecated: 已废弃，请使用 `data-view.china-map`
---

# WrappedDataViewChinaMapChart

> 中国地图图表构件，可以显示省级指标数据

**已废弃，请使用 `WrappedDataViewChinaMap`。**

## 导入

```tsx
import { WrappedDataViewChinaMapChart } from "@easyops/wrapped-components";
```

## Props

| 属性               | 类型                         | 必填 | 默认值 | 说明                                                                   |
| ------------------ | ---------------------------- | ---- | ------ | ---------------------------------------------------------------------- |
| province           | `string \| undefined`        | 否   | -      | 省份名称，例如"广东"。如果设置，则只显示该省份的地图，否则显示全国地图 |
| dataSource         | `DataSource[] \| undefined`  | 否   | -      | 数据源                                                                 |
| detailContentStyle | `CSSProperties \| undefined` | 否   | -      | 描述内容样式                                                           |
| fillContainer      | `boolean \| undefined`       | 否   | -      | 是否铺满容器（注意：该属性不同时兼容 detail 插槽）                     |

## Events

| 事件               | detail                                                                                           | 说明                       |
| ------------------ | ------------------------------------------------------------------------------------------------ | -------------------------- |
| onDetailOpenChange | `{ open: boolean; data: Record<string, any>; }` — { open: 当前是否可见, data: 当前展示的数据项 } | 当提示可见性开始变化时触发 |

## Slots

| 名称   | 说明                       |
| ------ | -------------------------- |
| detail | 点击标签时弹出的详情内容区 |

## Examples

### Basic

展示全国地图并在各省显示文字标签。

```tsx
<WrappedDataViewChinaMapChart
  dataSource={[
    { text: "西藏 12311", city: "西藏" },
    { text: "四川 89781169", city: "四川" },
    { text: "台湾 234181", city: "台湾" },
    { text: "江西 21348", city: "江西" },
  ]}
/>
```

### Fill container

铺满容器展示地图。

```tsx
<div style={{ height: "calc(100vh - 4em)", position: "relative" }}>
  <WrappedDataViewChinaMapChart
    fillContainer={true}
    dataSource={[
      { text: "西藏 12311", city: "西藏" },
      { text: "四川 89781169", city: "四川" },
      { text: "台湾 234181", city: "台湾" },
      { text: "江西 21348", city: "江西" },
    ]}
  />
</div>
```

### Province map

展示指定省份的地图。

```tsx
<div style={{ height: "calc(100vh - 4em)", position: "relative" }}>
  <WrappedDataViewChinaMapChart
    fillContainer={true}
    province="广东"
    dataSource={[
      { text: "广州 12311", city: "广州" },
      { text: "深圳 89781169", city: "深圳" },
      { text: "湛江 234181", city: "湛江" },
    ]}
  />
</div>
```

### With detail

点击标签时展示详情内容，并通过事件监听可见性变化。

```tsx
<WrappedDataViewChinaMapChart
  detailContentStyle={{ background: "yellow" }}
  dataSource={[
    { text: "西藏 12311", detailDisplayLocation: "textBottom", city: "西藏" },
    {
      text: "四川 89781169",
      detailDisplayLocation: "textBottom",
      city: "四川",
    },
    { text: "台湾 234181", detailDisplayLocation: "pageCenter", city: "台湾" },
    { text: "江西 21348", detailDisplayLocation: "pageCenter", city: "江西" },
  ]}
  onDetailOpenChange={(e) => console.log(e.detail)}
>
  <div slot="detail">内容区</div>
</WrappedDataViewChinaMapChart>
```
