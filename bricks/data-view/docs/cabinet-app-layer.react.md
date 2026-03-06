---
tagName: data-view.cabinet-app-layer
displayName: WrappedDataViewCabinetAppLayer
description: cabinet子构件----应用层
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewCabinetAppLayer

> cabinet子构件----应用层

## 导入

```tsx
import { WrappedDataViewCabinetAppLayer } from "@easyops/wrapped-components";
```

## Props

| 属性     | 类型                  | 必填 | 默认值 | 说明     |
| -------- | --------------------- | ---- | ------ | -------- |
| appTitle | `string`              | 是   | -      | 标题     |
| status   | `"active" \| "faded"` | 否   | -      | 当前状态 |

## Examples

### Basic

展示 cabinet 应用层子构件的基本用法。

```tsx
<WrappedDataViewCabinetAppLayer
  style={{ width: "600px", backgroundColor: "#1c1e21" }}
  appTitle="inventory-api"
/>
```

### Status

展示不同状态下的 cabinet 应用层。

```tsx
<>
  <div>active 状态</div>
  <WrappedDataViewCabinetAppLayer
    style={{ width: "600px", backgroundColor: "#1c1e21" }}
    appTitle="inventory-api"
    status="active"
  />
  <div style={{ marginTop: "20px" }}>faded 状态</div>
  <WrappedDataViewCabinetAppLayer
    style={{ width: "600px", backgroundColor: "#1c1e21" }}
    appTitle="inventory-api"
    status="faded"
  />
</>
```
