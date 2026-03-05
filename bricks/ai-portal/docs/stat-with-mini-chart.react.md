---
tagName: ai-portal.stat-with-mini-chart
displayName: WrappedAiPortalStatWithMiniChart
description: 带迷你折线图的统计数据展示构件，在统计数值旁边渲染一个迷你折线图。
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalStatWithMiniChart

> 带迷你折线图的统计数据展示构件，在统计数值旁边渲染一个迷你折线图。

## 导入

```tsx
import { WrappedAiPortalStatWithMiniChart } from "@easyops/wrapped-components";
```

## Props

| 属性      | 类型                       | 必填 | 默认值                 | 说明                                                |
| --------- | -------------------------- | ---- | ---------------------- | --------------------------------------------------- |
| label     | `string`                   | 否   | -                      | 统计指标标签名称                                    |
| value     | `string`                   | 否   | -                      | 统计数值文本                                        |
| size      | `"medium" \| "small"`      | 否   | `"medium"`             | 展示尺寸，medium 时图表高度为 92px，small 时为 55px |
| lineColor | `string`                   | 否   | `"var(--color-brand)"` | 折线颜色                                            |
| showArea  | `boolean`                  | 否   | -                      | 是否在折线下方显示渐变填充区域                      |
| min       | `number`                   | 否   | -                      | 指定 y 轴最小值，未指定时从数据中计算               |
| max       | `number`                   | 否   | -                      | 指定 y 轴最大值，未指定时从数据中计算               |
| xField    | `string`                   | 否   | `"0"`                  | x 轴字段名（数据中时间字段的 key）                  |
| yField    | `string`                   | 否   | `"1"`                  | y 轴字段名（数据中数值字段的 key）                  |
| data      | `Record<string, number>[]` | 否   | -                      | 图表数据源，每项为包含 xField 和 yField 字段的对象  |

## Examples

### 基础使用（medium 尺寸）

展示带标签、数值和迷你折线图的统计卡片，默认 medium 尺寸。

```tsx
<WrappedAiPortalStatWithMiniChart
  label="请求数"
  value="563.5"
  xField="time"
  yField="request_total"
  lineColor="#295DFF"
  data={[
    { request_total: 642.2, time: 1730597995.403 },
    { request_total: 621.3, time: 1730599200 },
    { request_total: 600.2, time: 1730601000 },
    { request_total: 601.97, time: 1730602800 },
    { request_total: 592.4, time: 1730604600 },
    { request_total: 567.87, time: 1730606400 },
    { request_total: 651.33, time: 1730608200 },
    { request_total: 571.97, time: 1730610000 },
    { request_total: 550.2, time: 1730611800 },
    { request_total: 563.5, time: 1730683800 },
  ]}
/>
```

### Small 尺寸

small 尺寸时图表高度为 55px，标签和数值紧凑排列在图表左侧。

```tsx
<WrappedAiPortalStatWithMiniChart
  label="请求数"
  value="563.5"
  size="small"
  xField="time"
  yField="request_total"
  lineColor="#295DFF"
  data={[
    { request_total: 642.2, time: 1730597995.403 },
    { request_total: 621.3, time: 1730599200 },
    { request_total: 600.2, time: 1730601000 },
    { request_total: 601.97, time: 1730602800 },
    { request_total: 592.4, time: 1730604600 },
    { request_total: 567.87, time: 1730606400 },
    { request_total: 651.33, time: 1730608200 },
    { request_total: 571.97, time: 1730610000 },
    { request_total: 550.2, time: 1730611800 },
    { request_total: 563.5, time: 1730683800 },
  ]}
/>
```

### 带填充区域和 y 轴范围

开启 showArea 并指定 min/max 固定 y 轴范围。

```tsx
<WrappedAiPortalStatWithMiniChart
  label="CPU 使用率"
  value="78.5%"
  xField="time"
  yField="cpu"
  lineColor="#FF6B6B"
  showArea={true}
  min={0}
  max={100}
  data={[
    { cpu: 65.2, time: 1730597995 },
    { cpu: 72.1, time: 1730599200 },
    { cpu: 78.5, time: 1730601000 },
    { cpu: 80.3, time: 1730602800 },
    { cpu: 75.6, time: 1730604600 },
    { cpu: 70.2, time: 1730606400 },
    { cpu: 78.5, time: 1730608200 },
  ]}
/>
```
