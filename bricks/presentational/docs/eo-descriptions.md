---
tagName: eo-descriptions
displayName: EoDescriptions
description: 通用描述列表构件
category: text
source: "@next-bricks/presentational"
---

# eo-descriptions

> 通用描述列表构件

## Props

| 属性             | 类型                         | 必填 | 默认值         | 说明                                                                                                                     |
| ---------------- | ---------------------------- | ---- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| descriptionTitle | `string`                     | 否   | -              | 描述标题                                                                                                                 |
| list             | `DescriptionItem[]`          | 否   | -              | 描述列表，每项可通过 `text`、`field` 或 `useBrick` 指定内容                                                              |
| showCard         | `boolean`                    | 否   | `true`         | 是否展示卡片背景（`themeVariant` 为 `elevo` 时强制不展示卡片）                                                           |
| column           | `number`                     | 否   | `3`            | 列数                                                                                                                     |
| templateColumns  | `string`                     | 否   | -              | CSS [grid-template-columns](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)，优先级高于 `column` |
| layout           | `"horizontal" \| "vertical"` | 否   | `"horizontal"` | 布局模式                                                                                                                 |
| bordered         | `boolean`                    | 否   | `false`        | 是否展示边框                                                                                                             |
| hideGroups       | `string \| string[]`         | 否   | -              | 需要隐藏的分组名称，匹配 list 项的 group 字段，支持字符串或字符串数组                                                    |
| dataSource       | `object`                     | 否   | -              | 数据源，供 list 项通过 `field` 读取字段值或通过 `useBrick` 的 `DATA` 引用                                                |
| themeVariant     | `"default" \| "elevo"`       | 否   | -              | 主题变体；`elevo` 模式下不渲染外层卡片，且标签后不添加冒号                                                               |

### DescriptionItem

| 字段       | 类型               | 说明                                                  |
| ---------- | ------------------ | ----------------------------------------------------- |
| label      | `string`           | 描述项标签文本                                        |
| field      | `string`           | 从 `dataSource` 中读取值的字段路径（使用 lodash get） |
| group      | `string`           | 所属分组名，可配合 `hideGroups` 隐藏整组              |
| text       | `string \| number` | 静态文本内容，`field` 未设置时使用                    |
| useBrick   | `UseBrickConf`     | 自定义渲染 brick，`dataSource` 作为 `DATA` 传入       |
| gridColumn | `string`           | CSS `grid-column` 值，用于手动控制该项的列跨度        |

## Examples

### Basic

最简用法，展示一组描述列表。

```yaml preview
- brick: eo-descriptions
  properties:
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
```

### Column

通过 `column` 控制列数，并通过 `descriptionTitle` 设置标题。

```yaml preview
- brick: eo-descriptions
  properties:
    descriptionTitle: UserInfo
    column: 2
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
      - label: 标签
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green

- brick: eo-divider
  properties:
    dividerStyle:
      margin: 8px 0 4px 0
- brick: eo-descriptions
  properties:
    descriptionTitle: 用户信息
    column: 4
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
      - label: 标签
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green
```

### Layout

`layout` 支持 `horizontal`（标签与内容同行）和 `vertical`（标签在内容上方）两种布局。

```yaml preview
- brick: eo-descriptions
  properties:
    layout: horizontal
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
      - label: 标签
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green
- brick: eo-divider
  properties:
    dividerStyle:
      margin: 8px 0 4px 0
- brick: eo-descriptions
  properties:
    layout: vertical
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
      - label: 标签
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green
- brick: div
  properties:
    style:
      margin: 10px 0px
```

### Bordered

`bordered` 为 `true` 时，列表项添加边框线，标签后不显示冒号。

```yaml preview
- brick: eo-descriptions
  properties:
    bordered: true
    layout: vertical
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
      - label: 标签
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green
- brick: div
  properties:
    style:
      margin: 10px 0px
- brick: eo-descriptions
  properties:
    bordered: true
    layout: horizontal
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
      - label: 标签
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green
```

### Hide Groups

通过 `hideGroups` 隐藏指定 group 的所有描述项，支持单个字符串或字符串数组。

```yaml preview
- brick: eo-descriptions
  properties:
    hideGroups: other
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
        group: "other"
      - label: 标签
        group: "other"
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green

- brick: div
  properties:
    style:
      margin: 10px 0px
- brick: eo-descriptions
  properties:
    hideGroups:
      - name
      - other
    list:
      - label: 姓名
        text: Tom
        group: name
      - label: 年龄
        text: 18
        group: age
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
        group: other
      - label: 标签
        useBrick:
          - brick: eo-tag-list
            properties:
              list:
                - text: 阳光
                  key: 0
                  color: blue
                - text: 开朗
                  key: 1
                  color: red
                - text: 大男孩
                  key: 2
                  color: green
```

### DataSource

通过 `dataSource` 提供数据源，list 项可用 `field` 读取字段，也可在 `useBrick` 中通过 `DATA` 引用整个数据源。

```yaml preview
- brick: eo-descriptions
  properties:
    dataSource:
      text: Hello world
      name: Tom
    list:
      - label: 姓名
        field: name
      - label: 年龄
        text: 18
      - label: 身高
        text: 180cm
      - label: 爱好
        text: 篮球
      - label: Form dataSource
        useBrick:
          brick: div
          properties:
            textContent: "<% DATA.text %>"
```

### Template Columns

通过 `templateColumns` 精确控制各列宽度，list 项可用 `gridColumn` 跨列显示。

```yaml preview
- brick: eo-descriptions
  properties:
    templateColumns: "200px 1fr 2fr"
    list:
      - label: 姓名
        text: Tom
      - label: 年龄
        text: 18
      - label: 备注
        text: 这是一段较长的备注信息
        gridColumn: "2 / 4"
```

### Theme Variant Elevo

`themeVariant` 为 `elevo` 时，不渲染外层卡片，适用于 AI 门户等特殊背景场景。

```yaml preview
# Use this container to emulate background
brick: ai-portal.home-container
properties:
  style:
    padding: 2em
    backgroundColor: "#d8d8d8"
children:
  - brick: eo-descriptions
    properties:
      themeVariant: elevo
      column: 1
      list:
        - label: 姓名
          text: Tom
        - label: 年龄
          text: 18
        - label: 身高
          text: 180cm
        - label: 爱好
          text: 篮球
```
