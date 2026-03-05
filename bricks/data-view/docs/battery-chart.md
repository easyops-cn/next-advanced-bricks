---
tagName: data-view.battery-chart
displayName: WrappedDataViewBatteryChart
description: 大屏电池
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.battery-chart

> 大屏电池

## Props

| 属性            | 类型               | 必填 | 默认值 | 说明                                                                                                |
| --------------- | ------------------ | ---- | ------ | --------------------------------------------------------------------------------------------------- |
| value           | `number`           | 是   | -      | 值，默认范围在 [0-100]，范围还可通过 thresholdColors 来改变，将取第一个和最后一个配置项的值作为区间 |
| batteryWidth    | `number`           | 是   | -      | 电池的宽度                                                                                          |
| batteryHeight   | `number`           | 是   | -      | 电池的高度                                                                                          |
| thresholdColors | `ThresholdColor[]` | 是   | -      | 阈值范围以及颜色的配置                                                                              |
| thresholdValue  | `number`           | 是   | -      | 阈值刻度线                                                                                          |

## Slots

| 名称        | 说明                                   |
| ----------- | -------------------------------------- |
| _(default)_ | 电池右侧内容插槽，可放置标题和数据信息 |
| left        | 电池左侧阈值线附近内容插槽             |

## Examples

### Basic

基本用法，展示默认配置的电池图表。

```yaml preview
- brick: data-view.battery-chart
  properties:
    value: 30
    batteryWidth: 38
    batteryHeight: 58
    thresholdValue: 50
    thresholdColors:
      - color: "linear-gradient(180deg, #246EFF 0%, #26CE90 100%)"
        startValue: 0
        endValue: 50
        headerColor: "#246EFF"
      - color: "linear-gradient(180deg, #FF772A 0%, #FFC22A 100%)"
        startValue: 50
        endValue: 100
        headerColor: "#FF772A"
    style:
      background-color: "#1c1e21"
      display: block
```

### ThresholdValue

自定义阈值范围、电池尺寸，并通过插槽展示标题和数据信息。

```yaml preview
- brick: data-view.battery-chart
  properties:
    value: 100
    thresholdValue: 120
    batteryHeight: 80
    batteryWidth: 50
    thresholdColors:
      - color: "linear-gradient(180deg, #246EFF 0%, #26CE90 100%)"
        startValue: 0
        endValue: 120
        headerColor: "#246EFF"
      - color: "linear-gradient(180deg, #FF772A 0%, #FFC22A 100%)"
        startValue: 120
        endValue: 200
        headerColor: "#FF772A"
    style:
      background-color: "#1c1e21"
      display: block
  slots:
    "":
      type: bricks
      bricks:
        - brick: div
          properties:
            textContent: 标题
            style:
              color: "#fff"
              opacity: 0.6
              marginTop: 10px
              fontSize: 14px
        - brick: div
          properties:
            textContent: 数据信息
            style:
              color: "#fff"
              fontSize: 20px
              line-height: 29px
              fontWeight: 500
    left:
      type: bricks
      bricks:
        - brick: div
          properties:
            textContent: 标题
            style:
              color: "#fff"
              opacity: 0.6
              marginTop: 10px
              fontSize: 14px
        - brick: div
          properties:
            textContent: 数据信息
            style:
              color: "#fff"
              fontSize: 20px
              line-height: 29px
              fontWeight: 500
```
