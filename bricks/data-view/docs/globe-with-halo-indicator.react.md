---
tagName: data-view.globe-with-halo-indicator
displayName: WrappedDataViewGlobeWithHaloIndicator
description: 地球加光环的数据展示构件。
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewGlobeWithHaloIndicator

> 地球加光环的数据展示构件。

## 导入

```tsx
import { WrappedDataViewGlobeWithHaloIndicator } from "@easyops/wrapped-components";
```

## Props

| 属性             | 类型               | 必填 | 默认值 | 说明                                    |
| ---------------- | ------------------ | ---- | ------ | --------------------------------------- |
| dataSource       | `DataItem[]`       | -    | -      | 指标数据列表（显示在环上），最多显示8项 |
| centerDataSource | `DataItem`         | -    | -      | 中心数据（显示在中心地球内）            |
| cornerDataSource | `CornerDataItem[]` | -    | -      | 左上角指标数据列表                      |
| maxScale         | `number`           | -    | `1`    | 最大缩放比例                            |

## Examples

### Basic

展示地球加光环的完整用法，包含中心数据、环上指标和角落指标。

```tsx
<div style={{ height: "calc(100vh - 2em)" }}>
  <WrappedDataViewGlobeWithHaloIndicator
    centerDataSource={{ label: "资产总数", value: 30123 }}
    dataSource={[
      { label: "低值易耗品", value: 3889 },
      { label: "摊销资产", value: 2087 },
      { label: "固定资产", value: 12088 },
      { label: "无形资产", value: 1082 },
      { label: "在建工程", value: 10997 },
    ]}
    cornerDataSource={[
      { label: "资产增长", value: 43, color: "red" },
      { label: "资产减少", value: 21, color: "green" },
    ]}
  />
</div>
```

### Max Scale

通过 maxScale 限制最大缩放比例。

```tsx
<div style={{ height: "calc(100vh - 2em)" }}>
  <WrappedDataViewGlobeWithHaloIndicator
    maxScale={0.8}
    centerDataSource={{ label: "服务总数", value: 8800 }}
    dataSource={[
      { label: "健康服务", value: 7200 },
      { label: "异常服务", value: 1600 },
    ]}
    cornerDataSource={[{ label: "新增", value: 55, color: "#83F5E1" }]}
  />
</div>
```
