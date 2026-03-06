---
tagName: eo-select
displayName: WrappedEoSelect
description: 通用下拉选择构件
category: form-input-basic
source: "@next-bricks/form"
---

# eo-select

> 通用下拉选择构件

## Props

| 属性                | 类型                                 | 必填 | 默认值 | 说明                                                                                         |
| ------------------- | ------------------------------------ | ---- | ------ | -------------------------------------------------------------------------------------------- |
| name                | `string`                             | -    | -      | 字段名称                                                                                     |
| placeholder         | `string`                             | -    | -      | 占位说明                                                                                     |
| label               | `string`                             | -    | -      | 字段文本                                                                                     |
| options             | `GeneralComplexOption[]`             | 是   | -      | 选项列表                                                                                     |
| value               | `any`                                | -    | -      | 值                                                                                           |
| required            | `boolean`                            | -    | -      | 是否必填                                                                                     |
| message             | `Record<string, string>`             | -    | -      | 校验文本信息                                                                                 |
| disabled            | `boolean`                            | -    | -      | 是否禁用                                                                                     |
| mode                | `"tags" \| "multiple"`               | -    | -      | 类型                                                                                         |
| tokenSeparators     | `string[]`                           | -    | -      | 自动分词的分隔符，仅在 mode="tags" 时生效                                                    |
| maxTagCount         | `number`                             | -    | -      | 最多显示多少个 tag, 剩余的 tag 将被隐藏                                                      |
| groupBy             | `string`                             | -    | -      | 分组字段                                                                                     |
| suffix              | `{ useBrick: UseSingleBrickConf }`   | -    | -      | 后缀内容，使用 useBrick 在选项及选中值旁显示额外信息                                         |
| clearable           | `boolean`                            | -    | `true` | 是否支持清除                                                                                 |
| fields              | `{ label?: string; value?: string }` | -    | -      | 列表指定字段作为 label 和 value                                                              |
| useBackend          | `UseBackendConf`                     | -    | -      | 后端搜索                                                                                     |
| debounceSearchDelay | `number`                             | -    | -      | 设置时，同时对 useBackend 和 search 事件进行防抖。未设置时，useBackend 有默认的 300ms 防抖。 |
| inputStyle          | `React.CSSProperties`                | -    | -      | 输入框样式                                                                                   |
| dropdownStyle       | `React.CSSProperties`                | -    | -      | 下拉框样式                                                                                   |
| dropdownHoist       | `boolean`                            | -    | -      | 下拉框是否使用固定定位防止内容被裁切                                                         |
| themeVariant        | `"default" \| "elevo"`               | -    | -      | 主题变体                                                                                     |

## Events

| 事件           | detail                                                                   | 说明                              |
| -------------- | ------------------------------------------------------------------------ | --------------------------------- |
| change         | `ChangeEventDetail` — { value: 选中的值, options: 对应选项列表 }         | 下拉选择事件                      |
| change.v2      | `string \| string[]` — 选中的值                                          | 下拉选择事件 v2（仅传递选中的值） |
| search         | `SearchEventDetail` — { value: 当前输入的搜索词 }                        | 下拉框search事件                  |
| select.focus   | -                                                                        | 下拉框focus事件                   |
| options.change | `OptionsChangeEventDetail` — { options: 最新的选项列表, name: 字段名称 } | 选项列表变化事件                  |

## Examples

### Basic

基本用法，展示简单的下拉选择框。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### Label

设置 label 属性为下拉框添加字段说明。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    label: city
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### Value

设置 value 属性指定默认选中项。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    label: city
    value: Shanghai
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### Options

多种选项格式：字符串数组、对象数组和布尔值数组。

```yaml preview minHeight="300px"
- brick: eo-select
  properties:
    label: string
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
    value: Guangzhou
- brick: div
  properties:
    style:
      height: 20px
- brick: eo-select
  properties:
    label: Array<object>
    options:
      - label: Beijing
        value: 0
      - label: Shanghai
        value: 1
      - label: Guangzhou
        value: 2
      - label: Shenzhen
        value: 3
    value: 2
- brick: div
  properties:
    style:
      height: 20px
- brick: eo-select
  properties:
    label: boolean
    options:
      - true
      - false
```

### Disabled

禁用单个选项或整体禁用下拉框。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    options:
      - label: Beijing
        value: 0
        disabled: true
      - label: Shanghai
        value: 1
      - label: Guangzhou
        value: 2
      - label: Shenzhen
        value: 3
- brick: eo-select
  properties:
    disabled: true
    options:
      - label: Beijing
        value: 0
      - label: Shanghai
        value: 1
      - label: Guangzhou
        value: 2
      - label: Shenzhen
        value: 3
```

### Multiple

多选模式，支持同时选择多个选项。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    label: multiple
    mode: multiple
    value:
      - Beijing
      - Guangzhou
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### Tags

标签模式，支持自定义输入新标签、自动分词和最大标签数限制。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    label: tags
    mode: tags
    tokenSeparators:
      - " "
      - ";"
      - "；"
    maxTagCount: 3
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### Placeholder

设置 placeholder 占位说明。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    placeholder: This is placeholder...
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### Suffix

使用 suffix 的 useBrick 在选项旁显示额外信息。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    placeholder: This is placeholder...
    options:
      - label: Beijing
        value: 1
        color: red
        tag: 京
      - label: Shanghai
        value: 2
        color: green
        tag: 沪
      - label: Guangzhou
        value: 3
        color: blue
        tag: 粤
      - label: Shenzhen
        value: 4
        color: yellow
        tag: 粤
    suffix:
      useBrick:
        brick: eo-tag
        properties:
          textContent: <% DATA.tag %>
          color: <% DATA.color %>
```

### GroupBy

使用 groupBy 属性按指定字段对选项进行分组展示。

```yaml preview minHeight="300px"
- brick: eo-select
  properties:
    placeholder: This is placeholder...
    groupBy: tag
    options:
      - label: Beijing
        value: 1
        color: red
        tag: 京
      - label: Shanghai
        value: 2
        color: green
        tag: 沪
      - label: Guangzhou
        value: 3
        color: blue
        tag: 粤
      - label: Shenzhen
        value: 4
        color: yellow
        tag: 粤
```

### Caption

使用 caption 展示下拉候选项说明文案。

```yaml preview minHeight="300px"
- brick: eo-select
  properties:
    placeholder: This is placeholder...
    options:
      - caption: 如nginx、api_gateway等
        label: 接入层
        value: 接入层
      - caption: 如DB等
        label: 数据层
        value: 数据层
      - caption: 如业务逻辑组件
        label: 业务层
        value: 业务层
      - caption: 如平台通用组件
        label: 中台层
        value: 中台层
```

### Fields

使用 fields 属性指定选项列表中哪些字段作为 label 和 value。

```yaml preview minHeight="300px"
- brick: eo-select
  properties:
    placeholder: This is placeholder...
    fields:
      label: name
      value: city
    value: 3
    options:
      - name: Beijing
        city: 1
        color: red
        tag: 京
      - name: Shanghai
        city: 2
        color: green
        tag: 沪
      - name: Guangzhou
        city: 3
        color: blue
        tag: 粤
      - name: Shenzhen
        city: 4
        color: yellow
        tag: 粤
```

### UseBackend

使用后端搜索从远程接口获取选项数据。

```yaml preview minHeight="300px"
- brick: eo-select
  properties:
    label: useBackend
    placeholder: 后端搜索
    value: Shenzhen
    useBackend:
      provider: basic.http-request
      transform: |
        <% (data) => data %>
      onValueChangeArgs:
        - |
          <%
            (q) =>
              `//api.weatherapi.com/v1/search.json?q=${q}&key=${MISC.weather_api_key}`
          %>
      args:
        - |
          <%
            (q) =>
              `//api.weatherapi.com/v1/search.json?q=${q ? q : "China"}&key=${MISC.weather_api_key}`
          %>
    fields:
      label: name
      value: name
    suffix:
      useBrick:
        brick: eo-tag
        properties:
          textContent: <% DATA.country %>
```

### Input Style

使用 inputStyle 自定义输入框样式。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    inputStyle:
      width: 180px
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### Dropdown Style And Hoist

使用 dropdownStyle 自定义下拉框样式，dropdownHoist 使用固定定位防止内容被裁切。

```yaml preview minHeight="350px"
- brick: eo-select
  properties:
    label: 自定义下拉框样式
    dropdownStyle:
      maxHeight: 150px
    dropdownHoist: true
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
      - Hangzhou
      - Chengdu
```

### Clearable

设置 clearable 为 false 禁用清除按钮。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    label: 不可清除
    clearable: false
    value: Beijing
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
```

### themeVariant

设置主题变体为 elevo 风格。

```yaml preview minHeight="250px"
- brick: eo-select
  properties:
    themeVariant: elevo
    label: Elevo 风格
    options:
      - Beijing
      - Shanghai
      - Guangzhou
    value: Beijing
```

### Event

监听 change、change.v2、search、select.focus 和 options.change 事件。

```yaml preview minHeight="400px"
- brick: eo-select
  properties:
    id: options-change-select
    label: Single
    debounceSearchDelay: 500
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
  events:
    change:
      - action: message.success
        args:
          - <% JSON.stringify(EVENT.detail) %>
    change.v2:
      - action: console.log
        args:
          - <% EVENT.detail %>
    search:
      - action: console.log
        args:
          - <% JSON.stringify(EVENT.detail) %>
    select.focus:
      - action: console.log
        args:
          - select focused
    options.change:
      - action: message.success
        args:
          - <% JSON.stringify(EVENT.detail) %>
- brick: eo-select
  properties:
    label: Multiple
    mode: multiple
    options:
      - Beijing
      - Shanghai
      - Guangzhou
      - Shenzhen
  events:
    change:
      - action: message.success
        args:
          - <% JSON.stringify(EVENT.detail) %>
- brick: eo-button
  properties:
    textContent: Click to change options
  events:
    click:
      - target: "#options-change-select"
        properties:
          options:
            - Beijing
            - Shanghai
            - Guangzhou
            - Shenzhen
            - Hangzhou
- brick: div
  properties:
    style:
      height: 20px
```

### With Form

在表单中使用下拉选择框，支持 required 校验和 message 自定义校验文本。

```yaml preview minHeight="250px"
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-select
      properties:
        options:
          - Beijing
          - Shanghai
          - Guangzhou
          - Shenzhen
        label: 选择框
        name: select
        required: true
        message:
          required: 请选择一个选项
    - brick: eo-submit-buttons
```
