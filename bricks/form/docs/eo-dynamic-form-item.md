---
tagName: eo-dynamic-form-item
displayName: EoDynamicFormItem
description: 动态表单
category: form-input-basic
source: "@next-bricks/form"
---

# eo-dynamic-form-item

> 动态表单

## Props

| 属性                 | 类型                                                                | 必填 | 默认值 | 说明                     |
| -------------------- | ------------------------------------------------------------------- | ---- | ------ | ------------------------ |
| name                 | `string`                                                            | 否   | -      | 字段名称                 |
| label                | `string`                                                            | 否   | -      | 字段说明                 |
| required             | `boolean`                                                           | 否   | -      | 是否必填                 |
| value                | `DynamicFormValuesItem[]`                                           | 否   | -      | 值                       |
| message              | `Record<string, string>`                                            | 否   | -      | 校验文本                 |
| useBrick             | `UseBrickConf`                                                      | 否   | -      | 动态表单子项构件列表     |
| hideAddButton        | `boolean \| ((value: Record<string, any>[]) => boolean)`            | 否   | -      | 是否隐藏添加的按钮       |
| disabledAddButton    | `boolean \| ((value: Record<string, any>[]) => boolean)`            | 否   | -      | 是否禁止添加的按钮       |
| hideRemoveButton     | `boolean \| ((row: Record<string, any>, index: number) => boolean)` | 否   | -      | 是否隐藏每一行删除的按钮 |
| disabledRemoveButton | `boolean \| ((row: Record<string, any>, index: number) => boolean)` | 否   | -      | 是否禁止每一行删除的按钮 |

## Events

| 事件       | detail                                                      | 说明             |
| ---------- | ----------------------------------------------------------- | ---------------- |
| change     | `DynamicFormValuesItem[]` — 整个动态表单当前所有行的值列表  | 表单值改变时触发 |
| row.add    | `rowDataType` — { detail: 该行的默认值, index: 该行的位置 } | 增加一行时触发   |
| row.remove | `rowDataType` — { detail: 该行的值, index: 该行的位置 }     | 移除一行时触发   |

## Examples

### 与表单集成

在 eo-form 中使用动态表单，支持必填校验和唯一性校验。

```yaml preview
- brick: eo-form
  properties:
    layout: vertical
    values:
      id: request_5XXX
      dimension:
        - dimensionName: one
          dimensionId: one
          dimensionValue: 1
  children:
    - brick: eo-input
      properties:
        name: id
        label: 指标ID
        required: true
    - brick: eo-dynamic-form-item
      properties:
        name: dimension
        label: 维度
        useBrick:
          - brick: eo-input
            properties:
              name: dimensionName
              required: true
              message:
                required: 维度名称为必填项
              label: 维度名称
          - brick: eo-input
            properties:
              name: dimensionId
              required: true
              message:
                required: 维度id为必填项
              label: 维度id
              unique: true
              validator: '<% (value) => (value.length > 5 ? "维度id不能超过5" : "") %>'
          - brick: eo-input
            properties:
              name: dimensionValue
              label: 维度值
    - brick: eo-submit-buttons
      properties:
        cancelText: 取消
        submitText: 提交
```

### 显示标签

展示带有 label 标签的动态表单。

```yaml preview
- brick: eo-dynamic-form-item
  properties:
    label: Label
    useBrick:
      - brick: eo-input
        properties:
          name: input
      - brick: eo-select
        properties:
          name: select
          options:
            - Beijing
            - Shanghai
            - Guangzhou
            - Shenzhen
```

### 设置初始值

通过 value 属性设置动态表单的初始数据。

```yaml preview
- brick: eo-dynamic-form-item
  properties:
    value:
      - input: 北京
        select: Beijing
      - input: 上海
        select: Shanghai
    useBrick:
      - brick: eo-input
        properties:
          name: input
      - brick: eo-select
        properties:
          name: select
          options:
            - Beijing
            - Shanghai
            - Guangzhou
            - Shenzhen
```

### 隐藏或禁用按钮

通过函数动态控制添加和删除按钮的显示与禁用状态。

```yaml preview
- brick: eo-dynamic-form-item
  properties:
    hideAddButton: "<% (value) => value.length === 5 %>"
    disabledAddButton: "<% (value) => value.length === 4 %>"
    hideRemoveButton: "<% (row, index) => index === 1 %>"
    disabledRemoveButton: "<% (row, index) => index === 0 %>"
    value:
      - input: hello1
        select: abc1
      - input: hello2
        select: abc2
      - input: hello3
        select: abc3
    useBrick:
      - brick: eo-input
        properties:
          name: input
      - brick: eo-select
        properties:
          name: select
          options:
            - abc1
            - abc2
            - abc3
            - abc4
```

### 监听事件

监听动态表单的值变化、添加行和删除行事件。

```yaml preview
- brick: eo-dynamic-form-item
  properties:
    name: dynamicForm
    useBrick:
      - brick: eo-input
        properties:
          name: input
      - brick: eo-select
        properties:
          name: select
          options:
            - Beijing
            - Shanghai
            - Guangzhou
            - Shenzhen
  events:
    change:
      - action: message.success
        args:
          - "<% JSON.stringify(EVENT.detail) %>"
    row.add:
      action: console.log
    row.remove:
      action: console.log
```
