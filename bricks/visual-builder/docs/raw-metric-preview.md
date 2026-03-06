---
tagName: visual-builder.raw-metric-preview
displayName: WrappedVisualBuilderRawMetricPreview
description: 原始指标预览，在 iframe 中渲染指标生成候选图表的对比表格
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.raw-metric-preview

> 原始指标预览，在 iframe 中渲染指标生成候选图表的对比表格

## Props

| 属性        | 类型                 | 必填 | 默认值 | 说明                                     |
| ----------- | -------------------- | ---- | ------ | ---------------------------------------- |
| previewUrl  | `string`             | 否   | -      | 预览 iframe 地址，默认使用内置预览地址   |
| generations | `MetricGeneration[]` | 否   | -      | 指标生成数据列表                         |
| grouped     | `boolean`            | 否   | -      | 是否按分组显示，启用后表格额外显示分组列 |
| busy        | `boolean`            | 否   | -      | 是否处于加载中状态                       |
| theme       | `string`             | 否   | -      | 预览主题                                 |
| uiVersion   | `string`             | 否   | -      | UI 版本                                  |
| app         | `MicroApp`           | 否   | -      | 微应用信息                               |

## Examples

### Basic

展示指标生成候选图表的对比表格，按视觉重量分列渲染不同展示形式。

```yaml preview minHeight="400px"
brick: visual-builder.raw-metric-preview
properties:
  theme: <% THEME.getTheme() %>
  uiVersion: "8.2"
  style:
    height: 400px
  generations:
    - objectId: HOST
      objectName: 主机
      propertyId: cpu_usage
      propertyName: CPU 使用率
      propertyUnit: percent(100)
      propertyDataType: double
      candidates: []
      mockData:
        - 45.2
        - 67.8
        - 23.1
        - 89.5
        - 55.0
```

### 分组展示

启用 grouped 属性将相关指标合并展示在同一分组下。

```yaml preview minHeight="400px"
brick: visual-builder.raw-metric-preview
properties:
  theme: <% THEME.getTheme() %>
  uiVersion: "8.2"
  grouped: true
  style:
    height: 400px
  generations:
    - objectId: HOST
      objectName: 主机
      propertyId: bytes_in
      propertyName: 入流量
      propertyUnit: bytes
      propertyDataType: long
      groupIndex: 0
      group: 网络流量
      candidates: []
      mockData:
        - 1024
        - 2048
        - 512
    - objectId: HOST
      objectName: 主机
      propertyId: bytes_out
      propertyName: 出流量
      propertyUnit: bytes
      propertyDataType: long
      groupIndex: 0
      group: 网络流量
      candidates: []
      mockData:
        - 768
        - 1536
        - 256
```
