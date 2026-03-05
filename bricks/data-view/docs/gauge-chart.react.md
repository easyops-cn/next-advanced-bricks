---
tagName: data-view.gauge-chart
displayName: WrappedDataViewGaugeChart
description: 大屏仪表盘
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewGaugeChart

> 大屏仪表盘

## 导入

```tsx
import { WrappedDataViewGaugeChart } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型     | 必填 | 默认值 | 说明                                         |
| ----------- | -------- | ---- | ------ | -------------------------------------------- |
| value       | `number` | -    | -      | 值，范围在 [0-100]                           |
| radius      | `number` | -    | -      | 仪表盘半径                                   |
| strokeWidth | `number` | -    | `20`   | 仪表盘圆弧的宽度，也用于计算值终点圆点的大小 |
| description | `string` | -    | -      | 描述文字，显示在数值下方                     |
| fontSize    | `number` | -    | `35`   | 值的字体大小                                 |

## Examples

### Basic

展示大屏仪表盘的基本用法，包含值、半径和圆弧宽度。

```tsx
<WrappedDataViewGaugeChart
  value={75}
  radius={150}
  strokeWidth={20}
  description="已部署 750 个 / 1000 个"
/>
```

### With Slot Content

使用默认插槽在仪表盘下方插入自定义内容。

```tsx
<WrappedDataViewGaugeChart
  value={100}
  radius={180}
  strokeWidth={20}
  description="已部署 1490 个 / 3300个"
>
  <div
    style={{
      fontSize: "16px",
      fontWeight: 500,
      color: "#fff",
      margin: "0 0 300px 0",
    }}
  >
    已部署 1490 个 / 3300个
  </div>
</WrappedDataViewGaugeChart>
```

### Custom Font Size

自定义值的字体大小。

```tsx
<WrappedDataViewGaugeChart
  value={60}
  radius={120}
  strokeWidth={15}
  description="系统负载"
  fontSize={28}
/>
```
