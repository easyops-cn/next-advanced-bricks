---
tagName: data-view.radar-chart
displayName: WrappedDataViewRadarChart
description: 雷达图
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.radar-chart

> 雷达图

## Props

| 属性       | 类型               | 必填 | 默认值 | 说明                                           |
| ---------- | ------------------ | ---- | ------ | ---------------------------------------------- |
| dataSource | `Data[]`           | 是   | -      | 数据                                           |
| width      | `number`           | 是   | -      | 容器宽度                                       |
| height     | `number`           | 是   | -      | 容器高度                                       |
| radius     | `number`           | 是   | -      | 多边形半径                                     |
| scale      | `number`           | 是   | `0.25` | 取值[0-1]，默认半径的缩放比例,radius不传时生效 |
| value      | `number \| string` | 是   | -      | 中心评分                                       |
| dataFill   | `DataFill`         | 是   | -      | 数据多边形填充样式                             |
| dataCircle | `DataCircle`       | 是   | -      | 数据点圆圈的样式配置                           |
| dataLine   | `DataLine`         | 是   | -      | 数据线条的样式配置                             |

## Examples

### Basic

展示基础雷达图，配置数据源和中心评分。

```yaml preview
brick: data-view.radar-chart
properties:
  dataSource:
    - name: JavaScript
      maxValue: 100
      value: 60
      percentValue: 45.8%
    - name: Java
      maxValue: 100
      value: 30
      percentValue: 45.8%
    - name: CSS
      maxValue: 100
      value: 70
      percentValue: 45.8%
    - name: Python
      maxValue: 100
      value: 30
      percentValue: 45.8%
    - name: Three.js
      maxValue: 100
      value: 50
      percentValue: 45.8%
  value: 85.9
  dataCircle:
    fillStyle: red
    r: 3
  style:
    display: block
    background-color: "#1c1e21"
```

### Custom Styles

展示自定义数据多边形填充色、线条和圆圈样式的雷达图。

```yaml preview
brick: data-view.radar-chart
properties:
  dataSource:
    - name: 性能
      maxValue: 100
      value: 80
    - name: 可用性
      maxValue: 100
      value: 65
    - name: 安全性
      maxValue: 100
      value: 90
    - name: 扩展性
      maxValue: 100
      value: 55
    - name: 维护性
      maxValue: 100
      value: 70
  value: 72
  width: 400
  height: 400
  dataFill:
    fillStyle: "rgba(0, 200, 255, 0.3)"
  dataLine:
    strokeStyle: "#00C8FF"
    lineWidth: 2
  dataCircle:
    fillStyle: "#00C8FF"
    strokeStyle: "#ffffff"
    r: 4
  style:
    display: block
    background-color: "#1c1e21"
```
