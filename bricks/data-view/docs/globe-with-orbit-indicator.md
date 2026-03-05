---
tagName: data-view.globe-with-orbit-indicator
displayName: WrappedDataViewGlobeWithOrbitIndicator
description: 地球加轨道的数据展示构件。
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.globe-with-orbit-indicator

> 地球加轨道的数据展示构件。

## Props

| 属性             | 类型               | 必填 | 默认值 | 说明                                      |
| ---------------- | ------------------ | ---- | ------ | ----------------------------------------- |
| dataSource       | `DataItem[]`       | -    | -      | 指标数据列表（显示在轨道上），最多显示8项 |
| centerDataSource | `DataItem`         | -    | -      | 中心数据（显示在中心地球内）              |
| cornerDataSource | `CornerDataItem[]` | -    | -      | 左上角指标数据列表                        |
| maxScale         | `number`           | -    | `1`    | 最大缩放比例                              |

其中 `DataItem` 的类型为：

| 字段  | 类型               | 说明     |
| ----- | ------------------ | -------- |
| label | `string`           | 标签文字 |
| value | `string \| number` | 数值     |

`CornerDataItem` 在 `DataItem` 基础上扩展：

| 字段  | 类型     | 说明           |
| ----- | -------- | -------------- |
| color | `string` | 可选，标签颜色 |

## Examples

### Basic

展示地球加轨道的完整用法，包含中心数据、轨道上指标和角落指标。

```yaml preview height="660px"
brick: div
properties:
  style:
    height: calc(100vh - 2em)
children:
  - brick: data-view.globe-with-orbit-indicator
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
        - label: 其他资产
          value: 4203
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

### Max Scale

通过 maxScale 限制最大缩放比例。

```yaml preview height="660px"
brick: div
properties:
  style:
    height: calc(100vh - 2em)
children:
  - brick: data-view.globe-with-orbit-indicator
    properties:
      maxScale: 0.8
      centerDataSource:
        label: 主机总数
        value: 6000
      dataSource:
        - label: 运行中
          value: 5200
        - label: 已停止
          value: 800
      cornerDataSource:
        - label: 新增主机
          value: 30
          color: "#83F5E1"
    lifeCycle:
      onPageLoad:
        action: theme.setTheme
        args:
          - dark-v2
```
