---
tagName: data-view.gauge-chart
displayName: WrappedDataViewGaugeChart
description: 大屏仪表盘
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.gauge-chart

> 大屏仪表盘

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

```yaml preview
brick: data-view.gauge-chart
properties:
  value: 75
  radius: 150
  strokeWidth: 20
  description: 已部署 750 个 / 1000 个
```

### With Slot Content

使用默认插槽在仪表盘下方插入自定义内容。

```yaml preview
brick: data-view.gauge-chart
properties:
  value: 100
  radius: 180
  strokeWidth: 20
  description: 已部署 1490 个 / 3300个
slots:
  "":
    type: bricks
    bricks:
      - brick: div
        properties:
          textContent: 已部署 1490 个 / 3300个
          style:
            font-size: 16px
            font-weight: 500
            color: "#fff"
            margin: 0 0 300px 0
```

### Custom Font Size

自定义值的字体大小。

```yaml preview
brick: data-view.gauge-chart
properties:
  value: 60
  radius: 120
  strokeWidth: 15
  description: 系统负载
  fontSize: 28
```
