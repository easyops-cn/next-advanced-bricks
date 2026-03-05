---
tagName: eo-info-card-item
displayName: WrappedEoInfoCardItem
description: 信息类卡片 —— 横向布局信息卡片
category: card-info
source: "@next-bricks/presentational"
---

# eo-info-card-item

> 展示带图标、标题、描述和详细列表的横向布局信息卡片，支持链接跳转、插槽图标、标题后缀及操作区。

## Props

| 属性        | 类型               | 必填 | 默认值 | 说明                                                                               |
| ----------- | ------------------ | ---- | ------ | ---------------------------------------------------------------------------------- |
| cardTitle   | `string`           | 是   | -      | 卡片标题                                                                           |
| description | `string`           | 否   | -      | 卡片描述信息                                                                       |
| url         | `string`           | 否   | -      | 链接地址，点击卡片时跳转                                                           |
| target      | `string`           | 否   | -      | 链接跳转目标，如 `_blank`；设置后使用 `window.open` 跳转，否则使用内部路由跳转     |
| cardIcon    | `IconAvatar`       | 否   | -      | 图标配置，支持设置图标、颜色、尺寸、形状和背景色。`icon` slot 有内容时此属性不显示 |
| detailList  | `InfoCardDetail[]` | 否   | -      | 详细列表，每项可设置标题、描述文字或自定义构件。4 项及以上时以等宽网格排列         |

## Slots

| 名称   | 说明                                                     |
| ------ | -------------------------------------------------------- |
| icon   | 图标区域，放置自定义图标；有内容时 `cardIcon` 属性不生效 |
| title  | 标题后缀区域，通常放置状态标签等内容                     |
| action | 操作区域，点击不会触发卡片跳转                           |

## Examples

### Basic

展示带图标、描述和详细列表的基本横向信息卡片。

```yaml preview
- brick: eo-info-card-item
  properties:
    style:
      width: 100%
    cardTitle: 资产盘点
    cardIcon:
      color: orange
      icon:
        icon: patch-management
        lib: easyops
        category: app
      bgColor: var(--theme-orange-background)
    description: 资产盘点为设备运维人员提供便捷的设备资产盘点能力，使用自动化的盘点方式替换原有人工盘点
    detailList:
      - desc: 7M
        title: 大小
      - desc: "863"
        title: 下载次数
      - desc: 80%
        title: 下载率
      - desc: 2%
        title: 失败率
```

### With url and target

点击卡片时通过 `url` 和 `target` 跳转到指定地址。

```yaml preview
- brick: eo-info-card-item
  properties:
    style:
      width: 100%
    cardTitle: 持续集成
    url: /ci
    target: _blank
    cardIcon:
      color: green
      icon:
        icon: object-topology
        lib: easyops
        category: app
      bgColor: var(--theme-green-background)
    description: 持续集成服务，点击卡片在新标签页打开
```

### cardIcon shapes

通过 `cardIcon.shape` 控制图标头像的形状，支持 `circle`、`square`、`round-square`。

```yaml preview
- brick: div
  properties:
    style:
      display: flex
      flexDirection: column
      gap: 12px
      width: 100%
  children:
    - brick: eo-info-card-item
      properties:
        cardTitle: 圆形图标 (circle)
        cardIcon:
          icon:
            lib: antd
            icon: app-store
            theme: outlined
          color: var(--theme-blue-color)
          bgColor: var(--theme-blue-background)
          shape: circle
    - brick: eo-info-card-item
      properties:
        cardTitle: 方形图标 (square)
        cardIcon:
          icon:
            lib: antd
            icon: app-store
            theme: outlined
          color: var(--theme-purple-color)
          bgColor: var(--theme-purple-background)
          shape: square
    - brick: eo-info-card-item
      properties:
        cardTitle: 圆角方形图标 (round-square)
        cardIcon:
          icon:
            lib: antd
            icon: app-store
            theme: outlined
          color: var(--theme-green-color)
          bgColor: var(--theme-green-background)
          shape: round-square
```

### detailList with useBrick

`detailList` 中每项均可使用 `useBrick` 渲染自定义构件，`title` 显示为列标题，`desc` 在无 `useBrick` 时作为文字描述并带 tooltip。

```yaml preview
- brick: eo-info-card-item
  properties:
    style:
      width: 100%
    cardTitle: 资源监控微应用
    cardIcon:
      color: blue
      icon:
        icon: chart-pie
        lib: fa
    description: F5管理将企业F5BIG-IP设备统一管理，可在F5设备卡片页概览全部设备的状态
    detailList:
      - useBrick:
          brick: eo-switch
          properties:
            size: small
            value: true
        title: 是否启用
      - desc: "7663"
        title: 下载次数
      - desc: 90%
        title: 下载率
      - desc: 3%
        title: 失败率
```

### Slots

使用 `icon` 插槽自定义图标，`title` 插槽在标题后追加标签，`action` 插槽放置操作按钮（点击不触发卡片跳转）。

```yaml preview
- brick: eo-info-card-item
  properties:
    style:
      width: 100%
    cardTitle: 资源监控微应用
    description: 资源监控微应用相关前后台
    detailList:
      - desc: 7M
        title: 大小
      - desc: "863"
        title: 下载次数
  slots:
    title:
      type: bricks
      bricks:
        - brick: eo-tag
          properties:
            textContent: 生产
            color: blue
    action:
      type: bricks
      bricks:
        - brick: eo-dropdown-actions
          children:
            - brick: eo-button
              properties:
                type: text
                icon:
                  lib: fa
                  icon: ellipsis-h
                size: small
          properties:
            actions:
              - text: 高级设置
                icon:
                  icon: setting
                  lib: antd
                event: advanced.setting
              - text: 删除
                icon:
                  lib: antd
                  icon: delete
                event: button.delete
                danger: true
```
