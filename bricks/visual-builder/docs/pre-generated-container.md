---
tagName: visual-builder.pre-generated-container
displayName: WrappedVisualBuilderPreGeneratedContainer
description: 预生成编排容器，使用 useBrick 渲染指定的构件配置，并将 dataSource 作为数据传入
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.pre-generated-container

> 预生成编排容器，使用 useBrick 渲染指定的构件配置，并将 dataSource 作为数据传入

## Props

| 属性       | 类型           | 必填 | 默认值 | 说明             |
| ---------- | -------------- | ---- | ------ | ---------------- |
| useBrick   | `UseBrickConf` | 否   | -      | 要渲染的构件配置 |
| dataSource | `unknown`      | 否   | -      | 传入构件的数据   |

## Examples

### Basic

使用 useBrick 配置渲染一个简单的文本构件，并通过 dataSource 注入数据。

```yaml preview
brick: visual-builder.pre-generated-container
properties:
  useBrick:
    brick: span
    properties:
      textContent: "<% DATA.label %>"
  dataSource:
    label: Hello World
```

### 渲染列表构件

通过 useBrick 渲染列表构件，将 dataSource 传递给列表。

```yaml preview
brick: visual-builder.pre-generated-container
properties:
  useBrick:
    brick: eo-descriptions
    properties:
      list:
        - label: 名称
          field: name
        - label: 状态
          field: status
      dataSource: "<% DATA %>"
  dataSource:
    name: 示例对象
    status: 运行中
```
