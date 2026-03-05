---
tagName: eo-statistics-card
displayName: WrappedEoStatisticsCard
description: 统计卡片
category: card-info
source: "@next-bricks/presentational"
---

# eo-statistics-card

> 统计卡片

## Props

| 属性                | 类型                                                      | 必填 | 默认值     | 说明                                                                                           |
| ------------------- | --------------------------------------------------------- | ---- | ---------- | ---------------------------------------------------------------------------------------------- |
| cardTitle           | `string`                                                  | 否   | -          | 卡片标题                                                                                       |
| value               | `string`                                                  | 否   | -          | 统计值                                                                                         |
| unit                | `string`                                                  | 否   | -          | 统计值单位，显示在值后方                                                                       |
| icon                | `GeneralIconProps & { color?: string; bgColor?: string }` | 否   | -          | 图标，支持 GeneralIconProps 的所有字段，额外支持 `color`（图标颜色）和 `bgColor`（图标背景色） |
| size                | `"large" \| "medium" \| "small"`                          | 否   | `"medium"` | 卡片尺寸                                                                                       |
| outline             | `"border" \| "background" \| "none"`                      | 否   | `"border"` | 卡片轮廓样式，`border` 显示边框，`background` 显示背景色，`none` 无轮廓                        |
| background          | `string`                                                  | 否   | -          | 卡片背景，支持任意 CSS background 值（颜色、渐变等）                                           |
| descriptionPosition | `"bottom" \| "right"`                                     | 否   | `"bottom"` | 描述信息（description slot）的位置，`bottom` 显示在值下方，`right` 显示在值右侧                |
| valueStyle          | `React.CSSProperties`                                     | 否   | -          | 统计值的自定义样式                                                                             |
| interactable        | `boolean`                                                 | 否   | -          | 是否启用可互动样式（hover 高亮），适用于卡片整体可点击的场景                                   |

## Slots

| 插槽         | 说明                                                 |
| ------------ | ---------------------------------------------------- |
| titlePrefix  | 标题前缀，放置辅助信息                               |
| titleSuffix  | 标题后缀，放置辅助信息                               |
| description  | 描述信息，通常是对于统计值的描述                     |
| basicContent | 卡片右侧内容区，适合放置迷你图表，常用于小卡片       |
| extraContent | 卡片下方内容区，适合放置图表，用于展示更多信息的场景 |
| operator     | 右上角操作区                                         |

## Examples

### Basic

展示基础统计卡片，带图标和自定义值颜色，通过 `titleSuffix` 插槽添加提示。

```yaml preview
brick: eo-statistics-card
properties:
  cardTitle: 安全评分
  value: "93"
  valueStyle:
    color: var(--color-success)
  icon:
    lib: easyops
    category: monitor
    icon: infra-monitor
    bgColor: "#E6F0FC"
    color: "#3480EA"
  style:
    width: 300px
children:
  - brick: eo-tooltip
    slot: titleSuffix
    properties:
      content: 安全评分是根据您的资产状态进行的评分
      trigger: hover
      placement: top-start
    children:
      - brick: eo-icon
        properties:
          lib: antd
          icon: question-circle
          theme: outlined
          style:
            font-size: 12px
            color: var(--text-color-secondary)
```

### Outline

通过 `outline` 属性控制卡片轮廓样式，支持 `border`、`background` 和 `none` 三种模式。

```yaml preview gap
- brick: eo-statistics-card
  properties:
    cardTitle: 事件总数
    value: 1.2K
    unit: 个
    outline: border
    icon:
      lib: easyops
      category: monitor
      icon: infra-monitor
      bgColor: "#E6F0FC"
      color: "#3480EA"
    style:
      width: 300px
- brick: eo-statistics-card
  properties:
    cardTitle: 事件总数
    value: 1.2K
    unit: 个
    outline: background
    icon:
      lib: easyops
      category: monitor
      icon: infra-monitor
      bgColor: "#E6F0FC"
      color: "#3480EA"
    style:
      width: 300px
- brick: eo-statistics-card
  properties:
    cardTitle: 事件总数
    value: 1.2K
    unit: 个
    outline: none
    icon:
      lib: easyops
      category: monitor
      icon: infra-monitor
      bgColor: "#E6F0FC"
      color: "#3480EA"
    style:
      width: 300px
```

### Size

通过 `size` 属性控制卡片尺寸，支持 `large`、`medium`（默认）和 `small` 三种规格。

```yaml preview gap
- brick: eo-statistics-card
  properties:
    cardTitle: 事件总数
    value: 1.2K
    unit: 个
    size: large
    icon:
      lib: easyops
      category: monitor
      icon: infra-monitor
      bgColor: "#E6F0FC"
      color: "#3480EA"
    style:
      width: 300px
- brick: eo-statistics-card
  properties:
    cardTitle: 事件总数
    value: 1.2K
    unit: 个
    size: medium
    icon:
      lib: easyops
      category: monitor
      icon: infra-monitor
      bgColor: "#E6F0FC"
      color: "#3480EA"
    style:
      width: 300px
- brick: eo-statistics-card
  properties:
    cardTitle: 事件总数
    value: 1.2K
    unit: 个
    size: small
    icon:
      lib: easyops
      category: monitor
      icon: infra-monitor
      bgColor: "#E6F0FC"
      color: "#3480EA"
    style:
      width: 300px
```

### Description Position

通过 `descriptionPosition` 控制描述内容的位置，`bottom` 显示在值下方，`right` 显示在值右侧。

```yaml preview gap
- brick: eo-statistics-card
  properties:
    cardTitle: 事件响应率
    value: "78.3%"
    descriptionPosition: bottom
    style:
      width: 300px
  children:
    - brick: div
      slot: description
      children:
        - brick: span
          properties:
            textContent: 同比上周
        - brick: span
          properties:
            style:
              color: var(--color-success)
            textContent: 上升3.45%
- brick: eo-statistics-card
  properties:
    cardTitle: 事件响应数量
    value: "4,089"
    descriptionPosition: right
    style:
      width: 400px
  children:
    - brick: eo-icon
      slot: titlePrefix
      properties:
        lib: antd
        icon: check-circle
        theme: filled
        style:
          font-size: 12px
          color: var(--color-success)
    - brick: div
      slot: description
      children:
        - brick: span
          properties:
            textContent: 同比上周
        - brick: span
          properties:
            style:
              color: var(--color-success)
            textContent: 上升31.45%
```

### Background

通过 `background` 属性自定义卡片背景，支持颜色、渐变等 CSS 值。

```yaml preview
brick: eo-statistics-card
properties:
  cardTitle: 安全评分
  value: "93"
  valueStyle:
    color: "#fff"
  background: "linear-gradient(135deg, #3480EA 0%, #6EABF5 100%)"
  style:
    width: 300px
```

### With Extra Content

通过 `extraContent` 插槽在卡片下方放置图表，展示更丰富的数据信息。

```yaml preview
brick: eo-statistics-card
properties:
  cardTitle: 事件响应数量
  value: "4,089"
  descriptionPosition: right
  style:
    width: 500px
children:
  - brick: div
    slot: description
    children:
      - brick: span
        properties:
          textContent: 同比上周
      - brick: span
        properties:
          style:
            color: var(--color-success)
          textContent: 上升31.45%
  - brick: div
    slot: extraContent
    properties:
      textContent: （此处可放置图表）
      style:
        height: 60px
        display: flex
        alignItems: center
        color: var(--text-color-secondary)
```

### Interactable

通过 `interactable` 属性启用可互动样式，适用于卡片整体可点击跳转的场景；通过 `operator` 插槽在右上角放置操作菜单。

```yaml preview gap
- brick: eo-link
  properties:
    type: plain
    url: /detail
    target: _blank
  children:
    - brick: eo-statistics-card
      properties:
        interactable: true
        outline: border
        cardTitle: 安全评分
        value: "93"
        valueStyle:
          color: var(--color-success)
        icon:
          lib: easyops
          category: monitor
          icon: infra-monitor
          bgColor: "#E6F0FC"
          color: "#3480EA"
        style:
          width: 200px
- brick: eo-statistics-card
  properties:
    cardTitle: 安全评分
    value: "93"
    valueStyle:
      color: var(--color-success)
    icon:
      lib: easyops
      category: monitor
      icon: infra-monitor
      bgColor: "#E6F0FC"
      color: "#3480EA"
    style:
      width: 300px
  children:
    - brick: eo-mini-actions
      slot: operator
      properties:
        actions:
          - icon:
              lib: antd
              icon: edit
              theme: outlined
            text: 编辑
            isDropdown: true
            event: edit
          - icon:
              lib: antd
              icon: delete
              theme: outlined
            text: 删除
            isDropdown: true
            disabled: true
            event: delete
      events:
        edit:
          - action: console.log
        delete:
          - action: console.log
```
