---
tagName: data-view.bubbles-indicator
displayName: WrappedDataViewBubblesIndicator
description: 气泡样式的数据展示构件。
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.bubbles-indicator

> 气泡样式的数据展示构件。

## Props

| 属性             | 类型               | 必填 | 默认值 | 说明                                             |
| ---------------- | ------------------ | ---- | ------ | ------------------------------------------------ |
| dataSource       | `DataItem[]`       | 否   | -      | 指标数据列表（显示在环上），注意最多显示12项数据 |
| centerDataSource | `DataItem`         | 否   | -      | 中心数据（显示在中心水晶球内）                   |
| cornerDataSource | `CornerDataItem[]` | 否   | -      | 左上角指标数据列表                               |
| maxScale         | `number`           | 否   | `1`    | 最大缩放比例                                     |

## Examples

### Basic

展示气泡指标构件的基本用法，包含中心数据、环上指标数据及左上角角标数据（仅在暗色主题下生效）。

```yaml preview height="660px"
brick: div
properties:
  style:
    height: calc(100vh - 2em)
children:
  - brick: data-view.bubbles-indicator
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
      maxScale: 1
    # Currently this brick only works within dark theme
    lifeCycle:
      onPageLoad:
        action: theme.setTheme
        args:
          - dark-v2
```
