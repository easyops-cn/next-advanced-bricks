---
tagName: visual-builder.raw-data-preview
displayName: WrappedVisualBuilderRawDataPreview
description: 原始数据预览，在 iframe 中渲染属性生成候选编排的对比表格，支持批注和确认操作
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.raw-data-preview

> 原始数据预览，在 iframe 中渲染属性生成候选编排的对比表格，支持批注和确认操作

## Props

| 属性        | 类型                                                                                        | 必填 | 默认值    | 说明                                             |
| ----------- | ------------------------------------------------------------------------------------------- | ---- | --------- | ------------------------------------------------ |
| previewUrl  | `string`                                                                                    | 否   | -         | 预览 iframe 地址，默认使用内置预览地址           |
| generations | `AttributeGeneration[]`                                                                     | 否   | -         | 属性生成数据列表                                 |
| mocks       | `Record<string, unknown>[]`                                                                 | 否   | -         | 模拟数据列表，作为各属性的候补示例数据           |
| busy        | `boolean`                                                                                   | 否   | -         | 是否处于加载中状态，为 true 时禁用批注和确认操作 |
| category    | `"detail-item" \| "form-item" \| "table-column" \| "card-item" \| "metric-item" \| "value"` | 否   | `"value"` | 预览分类，影响数据容器的渲染方式                 |
| theme       | `string`                                                                                    | 否   | -         | 预览主题                                         |
| uiVersion   | `string`                                                                                    | 否   | -         | UI 版本                                          |
| app         | `MicroApp`                                                                                  | 否   | -         | 微应用信息                                       |

## Events

| 事件             | detail                                                                                                                                                                                                        | 说明                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| comment          | `CommentDetail` — { comment: 批注内容, propertyInstanceId: 属性实例 ID }                                                                                                                                      | 提交批注时触发（在批注文本框中按 ⌘/Ctrl + 回车） |
| approve          | `ApproveDetail` — { approved: 是否已确认, propertyInstanceId: 属性实例 ID }                                                                                                                                   | 点击确认 checkbox 时触发                         |
| view.attr.prompt | `AttributeGeneration` — { generationId: 生成 ID, objectId: 对象 ID, objectName: 对象名称, propertyId: 属性 ID, propertyName: 属性名称, propertyType: 属性类型, candidates: 候选编排列表, mockData: 模拟数据 } | 点击属性类型链接查看提示词时触发                 |

## Examples

### Basic

展示多个对象属性的候选编排，支持批注和确认操作。

```yaml preview minHeight="500px"
brick: visual-builder.raw-data-preview
properties:
  previewUrl: /preview/
  theme: <% THEME.getTheme() %>
  uiVersion: "8.2"
  style:
    height: calc(100vh - 4em)
  generations:
    - generationId: 6202dcb92c165
      objectId: IDEA
      objectName: 想法
      propertyId: predictDeliveryTime
      propertyName: 预计交付时间
      propertyInstanceId: 61df43df88cc1
      candidates:
        - display: text
          formatter:
            format: relative
            type: date-time
          type: date-time
          visualWeight: -1
        - display: text
          formatter:
            format: accurate
            type: date-time
          type: date-time
          visualWeight: 0
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 1
        - display: text
          formatter:
            format: full
            type: date-time
          type: date-time
          visualWeight: 2
      mockData:
        - predictDeliveryTime: "2024-06-30T12:00:00Z"
        - predictDeliveryTime: "2024-12-31T00:00:00Z"
    - generationId: 6202d9c17c601
      objectId: IDEA
      objectName: 想法
      propertyId: createRole
      propertyName: 创建 idea 的用户角色
      propertyInstanceId: 61df43df88d89
      candidates:
        - display: text
          style:
            color: var(--text-color-secondary)
            size: medium
          type: string
          visualWeight: -1
        - display: text
          style:
            color: var(--text-color-default)
            size: medium
          type: string
          visualWeight: 0
        - display: text
          style:
            color: var(--text-color-default)
            fontWeight: bold
            size: large
          type: string
          visualWeight: 2
      mockData:
        - createRole: Admin
        - createRole: Developer
  events:
    comment:
      - action: console.log
    approve:
      - action: console.log
    view.attr.prompt:
      - action: console.log
```

### 加载中状态

将 busy 设置为 true 以禁用批注和确认操作，适用于后台处理过程中。

```yaml preview minHeight="300px"
brick: visual-builder.raw-data-preview
properties:
  busy: true
  theme: <% THEME.getTheme() %>
  uiVersion: "8.2"
  style:
    height: 300px
  generations:
    - generationId: abc001
      objectId: HOST
      objectName: 主机
      propertyId: hostname
      propertyName: 主机名
      propertyInstanceId: inst001
      candidates:
        - display: text
          type: string
          visualWeight: 0
      mockData:
        - hostname: server-01
```
