---
tagName: ai-portal.elevo-card
displayName: WrappedAiPortalElevoCard
description: Elevo 风格的卡片组件，支持图标或图片头像、标题、描述、操作按钮及底部插槽。
category: display-component
source: "@next-bricks/ai-portal"
---

# ai-portal.elevo-card

> Elevo 风格的卡片组件，支持图标或图片头像、标题、描述、操作按钮及底部插槽。

## Props

| 属性        | 类型                         | 必填 | 默认值 | 说明                                                   |
| ----------- | ---------------------------- | ---- | ------ | ------------------------------------------------------ |
| cardTitle   | `string`                     | 否   | -      | 卡片标题                                               |
| description | `string`                     | 否   | -      | 卡片描述文字                                           |
| url         | `string`                     | 否   | -      | 点击卡片跳转的链接地址，设置后卡片呈现可点击样式       |
| avatar      | `string \| GeneralIconProps` | 否   | -      | 卡片头像，可为图片 URL 或图标配置对象（含 color 字段） |
| avatarType  | `"icon" \| "image"`          | 否   | -      | 头像类型，`"icon"` 时渲染图标，`"image"` 时渲染图片    |

## Slots

| 名称    | 说明               |
| ------- | ------------------ |
| actions | 卡片右上角操作区域 |
| footer  | 卡片底部操作区域   |

## Examples

### Basic

基础卡片，展示标题和描述。

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.elevo-card
    properties:
      cardTitle: HR
      description: Provide standard HR workflows. e.g. leave applications, office supply requistion, purchase requistion, etc.
      style:
        maxWidth: 400px
    children:
      - brick: eo-dropdown-actions
        slot: actions
        properties:
          themeVariant: elevo
          actions:
            - text: Edit
              event: edit
            - text: Delete
              event: delete
              danger: true
        children:
          - brick: ai-portal.icon-button
            properties:
              variant: mini
              icon:
                lib: antd
                icon: setting
      - brick: eo-button
        slot: footer
        properties:
          themeVariant: elevo
          textContent: Chat
          type: flat
```

### With Icon Avatar

使用图标作为头像，并配置主题色。

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.elevo-card
    properties:
      cardTitle: 运维监控
      description: 提供系统监控、告警及故障排查标准流程。
      avatarType: icon
      avatar:
        lib: antd
        icon: monitor
        color: blue
      url: "/monitor"
      style:
        maxWidth: 400px
```

### With Image Avatar

使用图片作为头像的卡片。

```yaml preview
brick: ai-portal.home-container
children:
  - brick: ai-portal.elevo-card
    properties:
      cardTitle: 数据分析
      description: 提供数据报表、可视化分析及数据导出功能。
      avatarType: image
      avatar: "https://example.com/avatar.png"
      style:
        maxWidth: 400px
    children:
      - brick: eo-button
        slot: footer
        properties:
          themeVariant: elevo
          textContent: 进入
          type: flat
```
