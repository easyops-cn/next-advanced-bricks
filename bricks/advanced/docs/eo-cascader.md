---
tagName: eo-cascader
displayName: WrappedEoCascader
description: 级联选择器
category: form-input-basic
source: "@next-bricks/advanced"
---

# eo-cascader

> 级联选择器

## Props

| 属性           | 类型                                 | 必填 | 默认值                                                     | 说明                                                          |
| -------------- | ------------------------------------ | ---- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| name           | `string`                             | 否   | -                                                          | 表单字段名                                                    |
| label          | `string`                             | 否   | -                                                          | 表单字段标签                                                  |
| required       | `boolean`                            | 否   | -                                                          | 是否为必填项                                                  |
| options        | `AntdCascaderProps["options"]`       | 否   | -                                                          | 可选项数据源                                                  |
| fieldNames     | `AntdCascaderProps["fieldNames"]`    | 否   | `{ label: "label", value: "value", children: "children" }` | 自定义字段名，指定 label、value、children 对应的字段          |
| value          | `AntdCascaderProps["value"]`         | 否   | -                                                          | 当前选中的值                                                  |
| placeholder    | `string`                             | 否   | -                                                          | 输入框占位文本                                                |
| multiple       | `boolean`                            | 否   | -                                                          | 是否支持多选                                                  |
| disabled       | `boolean`                            | 否   | -                                                          | 是否禁用                                                      |
| allowClear     | `boolean`                            | 否   | `true`                                                     | 是否支持清除                                                  |
| showSearch     | `boolean`                            | 否   | `true`                                                     | 是否支持搜索，开启后可通过输入关键字过滤选项                  |
| suffixIcon     | `GeneralIconProps`                   | 否   | -                                                          | 自定义下拉箭头图标                                            |
| expandTrigger  | `AntdCascaderProps["expandTrigger"]` | 否   | `"click"`                                                  | 次级菜单的展开方式，可选 click 或 hover                       |
| popupPlacement | `AntdCascaderProps["placement"]`     | 否   | `"bottomLeft"`                                             | 浮层预设位置，可选 bottomLeft、bottomRight、topLeft、topRight |
| size           | `AntdCascaderProps["size"]`          | 否   | -                                                          | 输入框大小，可选 large、middle、small                         |
| limit          | `number`                             | 否   | `50`                                                       | 搜索结果的最大条数，0 表示不限制                              |
| maxTagCount    | `number \| "responsive"`             | 否   | -                                                          | 多选模式下最多显示的 tag 数量，设为 responsive 时会自适应宽度 |
| cascaderStyle  | `CSSProperties`                      | 否   | -                                                          | 级联选择器的内联样式                                          |

## Events

| 事件            | detail                                                                                       | 说明                     |
| --------------- | -------------------------------------------------------------------------------------------- | ------------------------ |
| cascader.change | `CascaderChangeEventDetail` — { value: 选择的值, selectedOptions: 选择的值所对应的 options } | 级联选择项输入变化时触发 |

## Examples

### Basic

展示级联选择器的基本用法，通过 options 提供层级数据源。

```yaml preview minHeight="300px"
- brick: eo-cascader
  properties:
    placeholder: 请选择城市
    options:
      - children:
          - children:
              - label: West Lake
                value: xihu
            label: Hangzhou
            value: hangzhou
        label: Zhejiang
        value: zhejiang
      - children:
          - children:
              - label: Zhong Hua Men
                value: zhonghuamen
            label: Nanjing
            value: nanjing
        label: Jiangsu
        value: jiangsu
```

### With Form

在表单中使用级联选择器，配置 name、label 和 required 实现表单集成与校验。

```yaml preview minHeight="300px"
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-cascader
      properties:
        label: 城市选择
        name: city
        placeholder: 请选择城市
        required: true
        options:
          - children:
              - children:
                  - label: West Lake
                    value: xihu
                label: Hangzhou
                value: hangzhou
            label: Zhejiang
            value: zhejiang
          - children:
              - children:
                  - label: Zhong Hua Men
                    value: zhonghuamen
                label: Nanjing
                value: nanjing
            label: Jiangsu
            value: jiangsu
      events:
        cascader.change:
          - action: console.log
    - brick: eo-submit-buttons
```

### Multiple Selection

开启多选模式，并配置 maxTagCount 限制最多显示的 tag 数量。

```yaml preview minHeight="300px"
- brick: eo-cascader
  properties:
    placeholder: 请选择城市（可多选）
    multiple: true
    maxTagCount: 2
    options:
      - children:
          - children:
              - label: West Lake
                value: xihu
            label: Hangzhou
            value: hangzhou
        label: Zhejiang
        value: zhejiang
      - children:
          - children:
              - label: Zhong Hua Men
                value: zhonghuamen
            label: Nanjing
            value: nanjing
        label: Jiangsu
        value: jiangsu
  events:
    cascader.change:
      - action: console.log
```

### Custom Field Names

使用 fieldNames 自定义数据源中 label、value、children 对应的字段名。

```yaml preview minHeight="300px"
- brick: eo-cascader
  properties:
    placeholder: 请选择分类
    fieldNames:
      label: name
      value: id
      children: sub
    options:
      - id: tech
        name: 技术
        sub:
          - id: frontend
            name: 前端
            sub:
              - id: react
                name: React
              - id: vue
                name: Vue
          - id: backend
            name: 后端
            sub:
              - id: java
                name: Java
```

### Disabled and Size

展示禁用状态和不同尺寸（large、middle、small）的级联选择器。

```yaml preview minHeight="300px"
- brick: div
  properties:
    style:
      display: flex
      flexDirection: column
      gap: 12px
  children:
    - brick: eo-cascader
      properties:
        placeholder: Large 尺寸
        size: large
        options:
          - label: Zhejiang
            value: zhejiang
            children:
              - label: Hangzhou
                value: hangzhou
                children:
                  - label: West Lake
                    value: xihu
    - brick: eo-cascader
      properties:
        placeholder: Small 尺寸
        size: small
        options:
          - label: Zhejiang
            value: zhejiang
            children:
              - label: Hangzhou
                value: hangzhou
                children:
                  - label: West Lake
                    value: xihu
    - brick: eo-cascader
      properties:
        placeholder: 禁用状态
        disabled: true
        options:
          - label: Zhejiang
            value: zhejiang
            children:
              - label: Hangzhou
                value: hangzhou
                children:
                  - label: West Lake
                    value: xihu
```

### Custom Style and Icon

通过 cascaderStyle 设置内联样式，通过 suffixIcon 自定义下拉箭头图标。

```yaml preview minHeight="300px"
- brick: eo-cascader
  properties:
    placeholder: 自定义样式与图标
    suffixIcon:
      lib: antd
      icon: down
    cascaderStyle:
      width: 300px
    expandTrigger: hover
    options:
      - label: Zhejiang
        value: zhejiang
        children:
          - label: Hangzhou
            value: hangzhou
            children:
              - label: West Lake
                value: xihu
```
