---
tagName: eo-mini-line-chart
displayName: WrappedEoMiniLineChart
description: 迷你折线图，支持平滑曲线、面积填充及自适应尺寸。
category: chart
source: "@next-bricks/mini-chart"
---

# eo-mini-line-chart

> 迷你折线图，支持平滑曲线、面积填充及自适应尺寸。

## Props

| 属性      | 类型                       | 必填 | 默认值                 | 说明                                         |
| --------- | -------------------------- | ---- | ---------------------- | -------------------------------------------- |
| width     | `string`                   | 否   | `"155"`                | 图表宽度，设置 `auto` 可适应容器宽度         |
| height    | `string`                   | 否   | `"40"`                 | 图表高度，设置 `auto` 可适应容器高度         |
| smooth    | `boolean`                  | 否   | `true`                 | 是否使用平滑曲线                             |
| lineColor | `string`                   | 否   | `"var(--color-brand)"` | 折线颜色，支持 CSS 颜色值和 CSS 变量         |
| lineWidth | `number`                   | 否   | `2`                    | 折线宽度（像素）                             |
| showArea  | `boolean`                  | 否   | -                      | 是否填充折线下方面积                         |
| min       | `number`                   | 否   | -                      | 指定 y 轴最小值，不指定时根据数据自动计算    |
| max       | `number`                   | 否   | -                      | 指定 y 轴最大值，不指定时根据数据自动计算    |
| xField    | `string`                   | 否   | `"0"`                  | 数据中作为 x 轴值的字段名                    |
| yField    | `string`                   | 否   | `"1"`                  | 数据中作为 y 轴值的字段名                    |
| data      | `Record<string, number>[]` | 否   | -                      | 图表数据数组，每项为包含 x 和 y 字段值的记录 |

## Examples

### Basic

使用不同折线颜色展示多条迷你折线图。

```yaml preview
brick: :forEach
dataSource:
  - var(--palette-orange-5)
  - darkcyan
  - darkred
children:
  - brick: eo-mini-line-chart
    properties:
      xField: time
      yField: request_total
      lineColor: <% ITEM %>
      data:
        - request_total: 642.2
          time: 1730597995.403
        - request_total: 621.3
          time: 1730599200
        - request_total: 600.2
          time: 1730601000
        - request_total: 601.9666666666667
          time: 1730602800
        - request_total: 592.4
          time: 1730604600
        - request_total: 567.8666666666667
          time: 1730606400
        - request_total: 651.3333333333334
          time: 1730608200
        - request_total: 571.9677419354839
          time: 1730610000
        - request_total: 550.2
          time: 1730611800
        - request_total: 556.5666666666667
          time: 1730613600
```

### Auto Size

使用自适应尺寸，填充容器宽高，并开启面积填充。

```yaml preview
brick: div
properties:
  style:
    display: flex
    height: 100px
children:
  - brick: :forEach
    dataSource:
      - var(--palette-orange-5)
      - darkcyan
      - darkred
    children:
      - brick: eo-mini-line-chart
        properties:
          xField: time
          yField: request_total
          lineColor: <% ITEM %>
          showArea: true
          width: auto
          height: auto
          style:
            flex: 1
            minWidth: 0
          data:
            - request_total: 642.2
              time: 1730597995.403
            - request_total: 621.3
              time: 1730599200
            - request_total: 600.2
              time: 1730601000
            - request_total: 601.9666666666667
              time: 1730602800
            - request_total: 592.4
              time: 1730604600
            - request_total: 567.8666666666667
              time: 1730606400
            - request_total: 651.3333333333334
              time: 1730608200
            - request_total: 571.9677419354839
              time: 1730610000
            - request_total: 550.2
              time: 1730611800
            - request_total: 556.5666666666667
              time: 1730613600
```

### Custom Line Style

自定义折线宽度和 y 轴范围，展示固定最大值的折线图。

```yaml preview
brick: eo-mini-line-chart
properties:
  xField: time
  yField: value
  lineWidth: 3
  smooth: false
  min: 0
  max: 1000
  data:
    - value: 200
      time: 1
    - value: 450
      time: 2
    - value: 300
      time: 3
    - value: 700
      time: 4
    - value: 550
      time: 5
    - value: 800
      time: 6
    - value: 620
      time: 7
```
