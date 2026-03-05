---
tagName: data-view.crystal-ball-indicator
displayName: WrappedDataViewCrystalBallIndicator
description: 有水晶球动画的数据展示构件。
category: ""
source: "@next-bricks/data-view"
---

# data-view.crystal-ball-indicator

> 有水晶球动画的数据展示构件。

## Props

| 属性             | 类型                            | 必填 | 默认值 | 说明                                         |
| ---------------- | ------------------------------- | ---- | ------ | -------------------------------------------- |
| dataSource       | `DataItem[] \| undefined`       | 否   | -      | 指标数据列表（显示在环上，最多显示12项数据） |
| centerDataSource | `DataItem \| undefined`         | 否   | -      | 中心数据（显示在中心水晶球内）               |
| cornerDataSource | `CornerDataItem[] \| undefined` | 否   | -      | 左上角指标数据列表                           |
| maxScale         | `number \| undefined`           | 否   | `1`    | 最大缩放比例                                 |

## Examples

### Basic

展示带水晶球动画的数据环形指标卡，包含环上标签、中心数值及左上角指标。

```yaml preview height="660px"
brick: div
properties:
  style:
    height: calc(100vh - 2em)
children:
  - brick: data-view.crystal-ball-indicator
    properties:
      centerDataSource:
        label: 资产总数
        value: 30123
      dataSource:
        - label: 低值易耗品
          value: 3889
        - label: 摊销资产
          value: 2087
        - label: 固定资产
          value: 12088
        - label: 无形资产
          value: 1082
        - label: 在建工程
          value: 10997
      cornerDataSource:
        - label: 资产增长
          value: 43
          color: red
        - label: 资产减少
          value: 21
          color: green
    # Currently this brick only works within dark theme
    lifeCycle:
      onPageLoad:
        action: theme.setTheme
        args:
          - dark-v2
```

### Max scale

通过 maxScale 限制构件的最大缩放比例。

```yaml preview height="660px"
brick: div
properties:
  style:
    height: calc(100vh - 2em)
children:
  - brick: data-view.crystal-ball-indicator
    properties:
      maxScale: 0.8
      centerDataSource:
        label: 在线主机
        value: 8899
      dataSource:
        - label: 物理机
          value: 1200
        - label: 虚拟机
          value: 5678
        - label: 容器
          value: 2021
      cornerDataSource:
        - label: 新增
          value: 15
          color: "#00c8ff"
    # Currently this brick only works within dark theme
    lifeCycle:
      onPageLoad:
        action: theme.setTheme
        args:
          - dark-v2
```
