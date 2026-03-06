---
tagName: visual-builder.property-editor
displayName: WrappedVisualBuilderPropertyEditor
description: 构件属性编辑器，基于 Formily 渲染指定构件的属性编辑表单
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.property-editor

> 构件属性编辑器，基于 Formily 渲染指定构件的属性编辑表单

## Props

| 属性           | 类型             | 必填 | 默认值 | 说明                                             |
| -------------- | ---------------- | ---- | ------ | ------------------------------------------------ |
| editorName     | `string`         | 否   | -      | 构件名称，用于加载对应的属性编辑器               |
| values         | `any`            | 否   | -      | 属性编辑器的当前值                               |
| advancedMode   | `boolean`        | 否   | -      | 是否启用高级模式，高级模式下直接编辑原始属性对象 |
| dataList       | `DataItem[]`     | 是   | -      | 数据列表，用于编辑器中的数据绑定选项             |
| editorPackages | `BrickPackage[]` | 是   | -      | 构件包信息，用于加载自定义编辑器                 |
| links          | `any`            | 是   | -      | 链接配置，用于编辑器中的跳转链接选项             |
| extraLibs      | `SelectOptions`  | 是   | -      | 额外的代码补全库，用于代码编辑器的类型提示       |
| childSlots     | `SelectOptions`  | 是   | -      | 子插槽选项，用于编辑器中选择子插槽               |

## Events

| 事件             | detail                                             | 说明                            |
| ---------------- | -------------------------------------------------- | ------------------------------- |
| validate.success | `Record<string, unknown>` — 表单验证成功后的表单值 | 表单验证成功时触发事件          |
| validate.error   | `any[]` — 表单验证错误信息数组                     | 表单验证报错时触发事件          |
| values.change    | `any` — 当前表单的最新值                           | 表单值发生变化时触发            |
| token.click      | `string` — 被点击的 token 字符串                   | 点击代码编辑器中的 token 时触发 |
| trigger.action   | `string` — 触发的动作标识                          | 编辑器内部触发自定义动作时触发  |

## Methods

| 方法     | 参数         | 返回值 | 说明                                                                               |
| -------- | ------------ | ------ | ---------------------------------------------------------------------------------- |
| validate | `() => void` | `void` | 触发表单校验，验证成功后触发 validate.success 事件，失败后触发 validate.error 事件 |

## Examples

### Basic

选择构件后加载对应的属性编辑器，支持普通模式与高级模式切换，点击 Submit 触发校验。

```yaml preview
- brick: eo-select
  properties:
    label: 选择一个构件
    value: eo-button
    options: <% MISC.local_editors %>
    style:
      display: block
      marginBottom: 2em
  events:
    change:
      target: "#editor"
      properties:
        editorName: <% EVENT.detail.value %>
- brick: visual-builder.property-editor
  properties:
    id: editor
    editorName: eo-button
    advancedMode: <%= CTX.isAdvanced %>
  events:
    validate.success:
      - action: console.log
    validate.error:
      - action: console.log
    values.change:
      - action: console.log
- brick: eo-search-bar
  context:
    - name: isAdvanced
      value: false
  children:
    - brick: eo-button
      slot: start
      properties:
        textContent: Submit
      events:
        click:
          - target: "#editor"
            method: validate
    - brick: eo-link
      slot: end
      properties:
        textContent: |
          <%= `切换到${CTX.isAdvanced ? "普通" : "高级"}模式` %>
      events:
        click:
          - action: context.replace
            args:
              - isAdvanced
              - <% !CTX.isAdvanced %>
```
