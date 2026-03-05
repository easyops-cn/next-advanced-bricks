---
tagName: visual-builder.pre-generated-config
displayName: WrappedVisualBuilderPreGeneratedConfig
description: AI 预生成配置选择器，以 iframe 预览方式展示属性列表，允许用户勾选、排序和调整可视权重，生成最终砖块配置
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.pre-generated-config

> AI 预生成配置选择器，以 iframe 预览方式展示属性列表，允许用户勾选、排序和调整可视权重，生成最终砖块配置

## Props

| 属性            | 类型                        | 必填 | 默认值 | 说明                                                                                       |
| --------------- | --------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------ |
| previewUrl      | `string`                    | 否   | -      | 预览 iframe 的地址，默认使用内置预览地址                                                   |
| attrList        | `ObjectAttr[]`              | 否   | -      | 属性列表，支持对象属性（ObjectAttr）和指标属性（MetricAttr）                               |
| mockList        | `Record<string, unknown>[]` | 否   | -      | 模拟数据列表，用于在预览列中展示真实渲染效果                                               |
| metricGroups    | `MetricGroup[]`             | 否   | -      | 指标分组配置，仅在 containerConfig.type 为 "grouped-chart" 时生效                          |
| containerConfig | `ContainerConfig`           | 否   | -      | 容器配置，决定生成的砖块布局类型（table/descriptions/cards/chart/grouped-chart）及数据绑定 |

## Events

| 事件         | detail                                                                  | 说明                                                 |
| ------------ | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| brick.change | `BrickConf \| null` — 根据当前选择和权重生成的砖块配置，无选中时为 null | 用户选择、排序或调整权重后，生成的砖块配置变化时触发 |

## Examples

### Basic

展示预生成配置选择器基本用法，提供属性列表让用户选择和排序。

```yaml preview
brick: visual-builder.pre-generated-config
properties:
  attrList:
    - id: name
      name: 名称
      candidates:
        - visualWeight: 0
    - id: status
      name: 状态
      candidates:
        - visualWeight: 0
    - id: createTime
      name: 创建时间
      candidates:
        - visualWeight: 0
  mockList:
    - name: 主机-001
      status: 运行中
      createTime: "2024-01-01"
    - name: 主机-002
      status: 已停止
      createTime: "2024-01-02"
  containerConfig:
    type: table
    dataName: hostList
events:
  brick.change:
    action: console.log
```

### Descriptions Container

使用描述列表容器类型展示属性配置。

```yaml preview
brick: visual-builder.pre-generated-config
properties:
  attrList:
    - id: name
      name: 名称
      candidates:
        - visualWeight: 0
    - id: ip
      name: IP 地址
      candidates:
        - visualWeight: 0
    - id: status
      name: 运营状态
      candidates:
        - visualWeight: 0
  mockList:
    - name: 主机-001
      ip: "192.168.1.1"
      status: 运行中
  containerConfig:
    type: descriptions
    dataName: hostDetail
events:
  brick.change:
    action: console.log
```
