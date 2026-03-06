---
tagName: data-view.indicator-card
displayName: WrappedDataViewIndicatorCard
description: 指标卡片
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.indicator-card

> 指标卡片

## Props

| 属性       | 类型                                                         | 必填 | 默认值     | 说明                                                        |
| ---------- | ------------------------------------------------------------ | ---- | ---------- | ----------------------------------------------------------- |
| layout     | `"column" \| "column-townhouse" \| "row" \| "row-townhouse"` | 否   | `"column"` | 展示类型，`column` 类型为上下三行、`row` 类型为左右两行模式 |
| datasource | `Datasource[]`                                               | 否   | `[]`       | 数据源                                                      |

## Examples

### Column

展示纵向排列（上下三行）的指标卡片。

```yaml preview
- brick: data-view.indicator-card
  properties:
    layout: "column"
    datasource:
      - value: 300
        desc: 月碳排放量
        unit: (吨)
      - value: 1000.33
        desc: 季度碳排放总量
        unit: (吨)
      - value: 2507.55
        desc: 年度碳排放总量
        unit: (吨)
```

### Column Townhouse

展示纵向联排（多列上下）的指标卡片。

```yaml preview
- brick: data-view.indicator-card
  properties:
    layout: "column-townhouse"
    datasource:
      - value: 300
        desc: 月碳排放量
        unit: (吨)
      - value: 1000.33
        desc: 季度碳排放总量
        unit: (吨)
      - value: 2507.55
        desc: 年度碳排放总量
        unit: (吨)
```

### Row

展示横向排列（左右两行）的指标卡片。

```yaml preview
- brick: data-view.indicator-card
  properties:
    layout: "row"
    datasource:
      - value: 300
        desc: 月碳排放量
        unit: (吨)
      - value: 1000.33
        desc: 季度碳排放总量
        unit: (吨)
      - value: 2507.55
        desc: 年度碳排放总量
        unit: (吨)
```

### Row Townhouse

展示横向联排（多行左右）的指标卡片。

```yaml preview
- brick: data-view.indicator-card
  properties:
    layout: "row-townhouse"
    datasource:
      - value: 300
        desc: 月碳排放量
        unit: (吨)
      - value: 1000.33
        desc: 季度碳排放总量
        unit: (吨)
      - value: 2507.55
        desc: 年度碳排放总量
        unit: (吨)
```
