---
tagName: eo-form
displayName: WrappedEoForm
description: 表单构件
category: form-input-basic
source: "@next-bricks/form"
---

# eo-form

> 表单构件

## Props

| 属性                      | 类型                      | 必填 | 默认值                                                                                          | 说明                                                                   |
| ------------------------- | ------------------------- | ---- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| staticValues              | `Record<string, unknown>` | 否   | -                                                                                               | 静态附加值，在表单验证成功时会合并到 validate.success 事件的 detail 中 |
| layout                    | `Layout`                  | 否   | `"vertical"`                                                                                    | 布局方式，可选值为 `vertical`、`horizontal`、`inline`                  |
| size                      | `ComponentSize`           | 否   | -                                                                                               | 表单组件尺寸                                                           |
| labelCol                  | `ColProps`                | 否   | `{ sm: { span: 24 }, md: { span: 24 }, lg: { span: 7 }, xl: { span: 5 }, xxl: { span: 4 } }`    | 标签列布局样式（仅当 layout="horizontal" 时有效）                      |
| wrapperCol                | `ColProps`                | 否   | `{ sm: { span: 18 }, md: { span: 18 }, lg: { span: 13 }, xl: { span: 16 }, xxl: { span: 18 } }` | 输入控件列布局样式（仅当 layout="horizontal" 时有效）                  |
| autoScrollToInvalidFields | `boolean`                 | 否   | -                                                                                               | 是否在验证失败时自动滚动到第一个错误字段                               |
| formStyle                 | `React.CSSProperties`     | 否   | -                                                                                               | 表单自定义样式                                                         |

## Events

| 事件             | detail                                                                                           | 说明                   |
| ---------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| values.change    | `Record<string, unknown>` — 当前所有表单字段的值                                                 | 表单值变更事件         |
| validate.success | `Record<string, unknown>` — 表单所有字段的值，包含合并后的 staticValues                          | 表单验证成功时触发事件 |
| validate.error   | `(MessageBody & { name: string })[]` — 校验失败的字段信息列表，每项包含 name（字段名）及错误消息 | 表单验证报错时触发事件 |

## Methods

| 方法               | 参数                                                                                                                                                                                                                                 | 返回值                               | 说明                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------- |
| validate           | -                                                                                                                                                                                                                                    | `boolean \| Record<string, unknown>` | 表单校验方法，校验通过触发 validate.success 事件，校验失败触发 validate.error 事件 |
| setInitValue       | <ul><li>`values: Record<string, unknown>` - 要设置的表单字段值</li><li>`options?: { runInMacrotask?: boolean; runInMicrotask?: boolean }` - 可选配置，支持 runInMicrotask（微任务中执行）和 runInMacrotask（宏任务中执行）</li></ul> | `void`                               | 表单设置值方法                                                                     |
| resetFields        | <ul><li>`name?: string` - 要重置的字段名，不传则重置所有字段</li></ul>                                                                                                                                                               | `void`                               | 表单重置值方法                                                                     |
| getFieldsValue     | <ul><li>`name?: string` - 要获取的字段名，不传则获取所有字段的值</li></ul>                                                                                                                                                           | `Record<string, unknown> \| unknown` | 获取表单值方法                                                                     |
| validateField      | <ul><li>`name: string` - 要校验的字段名</li></ul>                                                                                                                                                                                    | `void`                               | 校验表单字段方法                                                                   |
| resetValidateState | -                                                                                                                                                                                                                                    | `void`                               | 重置表单校验状态方法                                                               |

## Slots

| 名称     | 说明     |
| -------- | -------- |
| （默认） | 表单内容 |

## Examples

### Layout

展示 inline、horizontal、vertical 三种布局方式的表单。

```yaml preview
- brick: eo-form
  properties:
    layout: inline
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            label: input
        - brick: eo-select
          properties:
            label: select
- brick: div
  properties:
    style:
      height: 1px
      background: "#abc"
      margin: "20px 0"
- brick: eo-form
  properties:
    layout: horizontal
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            label: input
        - brick: eo-select
          properties:
            label: select
- brick: div
  properties:
    style:
      height: 1px
      background: "#abc"
      margin: "20px 0"
- brick: eo-form
  properties:
    layout: vertical
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            label: input
        - brick: eo-select
          properties:
            label: select
```

### Values

通过 `values` 属性为表单字段设置初始值。

```yaml preview
- brick: eo-form
  properties:
    values:
      input: This is default value
      select: Beijing
      radio: Guangzhou
      checkbox:
        - C
        - D
      textarea: "Hello World! \nNice to see you!"
      dynamicForm:
        - input: beijing
          select: Guangzhou
        - input: shenzhen
          select: Shenzhen
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            label: input
            name: input
        - brick: eo-select
          properties:
            label: select
            name: select
            options:
              - Beijing
              - Shanghai
        - brick: eo-radio
          properties:
            label: radio
            name: radio
            options:
              - Guangzhou
              - Shenzhen
        - brick: eo-checkbox
          properties:
            name: checkbox
            label: checkbox
            options:
              - A
              - B
              - C
              - D
        - brick: eo-textarea
          properties:
            name: textarea
            label: textarea
            autoSize:
              minRows: 3
        - brick: eo-dynamic-form-item
          properties:
            label: dynamic-form
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
```

### Events

监听 values.change、validate.success、validate.error 事件响应表单交互。

```yaml preview
- brick: eo-form
  events:
    values.change:
      - action: console.log
    validate.success:
      - action: message.success
        args:
          - 表单提交成功
    validate.error:
      - action: message.error
        args:
          - 表单校验失败
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            required: true
            name: name
            label: 姓名
            max: 6
            min: 2
            message:
              required: 一定要填写姓名哟
              max: 不能超过 6 个字符哟
              min: 最少填写 2 个字符哟
        - brick: eo-select
          properties:
            required: true
            name: sex
            label: 性别
            options:
              - label: 男
                value: 0
              - label: 女
                value: 1
        - brick: eo-submit-buttons
```

### Methods

通过方法调用实现表单校验、赋值、重置、取值及字段级校验等操作。

```yaml preview
- brick: eo-form
  properties:
    id: form
    autoScrollToInvalidFields: true
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            required: true
            name: name
            label: 姓名
            max: 6
            min: 2
        - brick: eo-select
          properties:
            required: true
            name: sex
            label: 性别
            options:
              - label: 男
                value: 0
              - label: 女
                value: 1
- brick: eo-button
  properties:
    textContent: validate
  events:
    click:
      - target: "#form"
        method: validate
- brick: eo-button
  properties:
    textContent: setInitValue
  events:
    click:
      - target: "#form"
        method: setInitValue
        args:
          - name: Mike
            sex: 0
- brick: eo-button
  properties:
    textContent: resetFields
  events:
    click:
      - target: "#form"
        method: resetFields
- brick: eo-button
  properties:
    textContent: resetFields(name)
  events:
    click:
      - target: "#form"
        method: resetFields
        args:
          - name
- brick: eo-button
  properties:
    textContent: getFieldsValue
  events:
    click:
      - target: "#form"
        method: getFieldsValue
        callback:
          success:
            - action: console.log
- brick: eo-button
  properties:
    textContent: getFieldsValue(name)
  events:
    click:
      - target: "#form"
        method: getFieldsValue
        args:
          - name
        callback:
          success:
            - action: console.log
- brick: eo-button
  properties:
    textContent: validateField(name)
  events:
    click:
      - target: "#form"
        method: validateField
        args:
          - name
- brick: eo-button
  properties:
    textContent: resetValidateState
  events:
    click:
      - target: "#form"
        method: resetValidateState
```

### Static Values

通过 staticValues 为验证成功事件附加额外的静态字段。

```yaml preview
- brick: eo-form
  properties:
    id: form2
    staticValues:
      source: web
      version: "1.0"
  events:
    validate.success:
      - action: console.log
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            name: username
            label: 用户名
            required: true
        - brick: eo-submit-buttons
```

### Custom Style

通过 formStyle 自定义表单容器样式。

```yaml preview
- brick: eo-form
  properties:
    layout: vertical
    formStyle:
      gap: 16px
      padding: 16px
      background: "#f5f5f5"
      borderRadius: 8px
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            name: username
            label: 用户名
        - brick: eo-select
          properties:
            name: city
            label: 城市
            options:
              - 北京
              - 上海
              - 深圳
        - brick: eo-submit-buttons
```

### Horizontal Layout with Column Config

使用 horizontal 布局并自定义 labelCol 和 wrapperCol 比例。

```yaml preview
- brick: eo-form
  properties:
    layout: horizontal
    labelCol:
      span: 6
    wrapperCol:
      span: 18
    size: large
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            name: name
            label: 姓名
        - brick: eo-input
          properties:
            name: email
            label: 邮箱
        - brick: eo-submit-buttons
```

### Theme variant Elevo

在 Elevo 主题下展示表单的视觉效果。

```yaml preview
# Use this container to emulate background
brick: ai-portal.home-container
properties:
  style:
    padding: 2em
    backgroundColor: "#d8d8d8"
children:
  - brick: eo-form
    properties:
      themeVariant: elevo
      layout: vertical
      values:
        city: 深圳
        public: true
        tags:
          - 活泼
    events:
      validate.success:
        useProvider: basic.show-dialog
        args:
          - title: 提交表单
            type: confirm
            content: 确定提交吗？
            themeVariant: elevo
    children:
      - brick: eo-input
        properties:
          label: 名称
          name: name
          themeVariant: elevo
          placeholder: 请输入
      - brick: eo-textarea
        properties:
          label: 说明
          name: desc
          themeVariant: elevo
          placeholder: 请输入
      - brick: eo-select
        properties:
          label: 类型
          name: type
          themeVariant: elevo
          placeholder: 请选择
          options:
            - 默认
            - 其他
      - brick: eo-radio
        properties:
          label: 城市
          name: city
          type: button
          themeVariant: elevo
          options:
            - 北京
            - 上海
            - 深圳
      - brick: eo-checkbox
        properties:
          label: 标签
          name: tags
          themeVariant: elevo
          options:
            - 活泼
            - 开朗
            - 好动
      - brick: eo-switch
        properties:
          label: 公开
          name: public
          themeVariant: elevo
      - brick: eo-submit-buttons
        properties:
          themeVariant: elevo
          submitText: 提交
          cancelText: 取消
          submitType: primary
          cancelType: default
```
