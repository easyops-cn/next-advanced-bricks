---
tagName: data-view.app-wall-card-item
displayName: WrappedDataViewAppWallCardItem
description: 应用墙子构件----卡片项
category: big-screen-layout
source: "@next-bricks/data-view"
---

# WrappedDataViewAppWallCardItem

> 应用墙子构件----卡片项

## 导入

```tsx
import { WrappedDataViewAppWallCardItem } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型                    | 必填 | 默认值     | 说明 |
| ----------- | ----------------------- | ---- | ---------- | ---- |
| status      | `"normal" \| "warning"` | 否   | `"normal"` | 状态 |
| cardTitle   | `string`                | 是   | -          | 标题 |
| description | `string`                | 是   | -          | 描述 |

## Examples

### Basic

展示应用墙卡片项的基本用法。

```tsx
<WrappedDataViewAppWallCardItem
  style={{ width: "100px", height: "120px" }}
  cardTitle="pos"
  description="店铺货管通"
/>
```

### Status

展示不同状态下的应用墙卡片项。

```tsx
<WrappedDataViewAppWallCardItem
  style={{ width: "100px", height: "120px" }}
  status="warning"
  cardTitle="pos"
  description="店铺货管通"
/>
```
