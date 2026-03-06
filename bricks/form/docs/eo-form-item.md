---
tagName: eo-form-item
displayName: WrappedEoFormItem
description: 表单项构件
category: form-input-basic
source: "@next-bricks/form"
---

# eo-form-item

> 表单项构件

## Props

| 属性           | 类型                          | 必填 | 默认值       | 说明                                                                 |
| -------------- | ----------------------------- | ---- | ------------ | -------------------------------------------------------------------- |
| name           | `string`                      | 否   | -            | 字段名称                                                             |
| label          | `string`                      | 否   | -            | 标签文字                                                             |
| pattern        | `string`                      | 否   | -            | 正则校验规则                                                         |
| message        | `Record<string, string>`      | 否   | -            | 校验失败时的提示信息                                                 |
| type           | `string`                      | 否   | -            | 校验类型                                                             |
| max            | `number`                      | 否   | -            | 表单校验最大值（当 type 为 number 时表示最大数值，否则表示最大长度） |
| min            | `number`                      | 否   | -            | 表单校验最小值（当 type 为 number 时表示最小数值，否则表示最小长度） |
| required       | `boolean`                     | 否   | -            | 表单项是否为必填                                                     |
| value          | `string`                      | 否   | -            | 初始值                                                               |
| valuePropsName | `string`                      | 否   | `"value"`    | 子构件中对应值的属性名                                               |
| layout         | `Layout`                      | 否   | -            | 布局方式                                                             |
| size           | `ComponentSize`               | 否   | -            | 尺寸                                                                 |
| trim           | `any`                         | 是   | `true`       | 是否自动去除前后的空白字符                                           |
| trigger        | `string`                      | 是   | `"onChange"` | 事件触发方法名                                                       |
| validator      | `(value: any) => MessageBody` | 否   | -            | 表单项校验方法                                                       |
| needValidate   | `boolean`                     | 否   | -            | 值变化时是否主动触发校验                                             |

## Slots

| 名称      | 说明       |
| --------- | ---------- |
| (default) | 表单项内容 |

## Examples

### Basic

展示表单项的基本用法，包含必填、最大/最小长度校验。

```yaml preview
- brick: eo-form
  slots:
    "":
      bricks:
        - brick: eo-form-item
          properties:
            name: username
            label: 用户名
            required: true
            max: 20
            min: 2
            message:
              required: 用户名不能为空
              max: 用户名不能超过 20 个字符
              min: 用户名至少 2 个字符
          slots:
            "":
              bricks:
                - brick: eo-input
                  properties:
                    placeholder: 请输入用户名
        - brick: eo-submit-buttons
          properties:
            submitText: 提交
```

### Validation

演示正则校验（pattern）、自定义校验器（validator）以及类型校验（type）的用法。

```yaml preview
- brick: eo-form
  slots:
    "":
      bricks:
        - brick: eo-form-item
          properties:
            name: email
            label: 邮箱
            required: true
            pattern: "^[\\w.-]+@[\\w.-]+\\.\\w+$"
            message:
              required: 邮箱不能为空
              pattern: 邮箱格式不正确
          slots:
            "":
              bricks:
                - brick: eo-input
                  properties:
                    placeholder: 请输入邮箱
        - brick: eo-form-item
          properties:
            name: age
            label: 年龄
            type: number
            min: 1
            max: 120
            message:
              min: 年龄不能小于 1
              max: 年龄不能超过 120
          slots:
            "":
              bricks:
                - brick: eo-input
                  properties:
                    placeholder: 请输入年龄
        - brick: eo-form-item
          properties:
            name: code
            label: 编码
            validator: "<% (value) => value && /^[A-Z]/.test(value) ? null : { message: '编码必须以大写字母开头' } %>"
          slots:
            "":
              bricks:
                - brick: eo-input
                  properties:
                    placeholder: 请输入编码
        - brick: eo-submit-buttons
          properties:
            submitText: 提交
```

### Initial Value and ValuePropsName

展示 value 初始值和 valuePropsName 的使用方式，以及 trim 自动去空格特性。

```yaml preview
- brick: eo-form
  slots:
    "":
      bricks:
        - brick: eo-form-item
          properties:
            name: city
            label: 城市
            value: Beijing
            valuePropsName: value
            trim: true
          slots:
            "":
              bricks:
                - brick: eo-input
                  properties:
                    placeholder: 请输入城市
        - brick: eo-form-item
          properties:
            name: isActive
            label: 是否激活
            valuePropsName: checked
            needValidate: false
          slots:
            "":
              bricks:
                - brick: eo-switch
        - brick: eo-submit-buttons
          properties:
            submitText: 提交
```

### Layout and Size

演示表单项的不同布局方式和尺寸设置，以及通过 trigger 指定事件触发方法名。

```yaml preview
- brick: eo-form
  properties:
    layout: horizontal
  slots:
    "":
      bricks:
        - brick: eo-form-item
          properties:
            name: name
            label: 姓名
            required: true
            layout: horizontal
            size: large
            trigger: onChange
          slots:
            "":
              bricks:
                - brick: eo-input
                  properties:
                    placeholder: 请输入姓名
        - brick: eo-submit-buttons
          properties:
            submitText: 提交
```
