---
tagName: ai-portal.icon-button
displayName: WrappedAiPortalIconButton
description: 图标按钮，支持多种视觉变体、禁用状态、Tooltip 提示及文字插槽。
category: interact-basic
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalIconButton

> 图标按钮，支持多种视觉变体、禁用状态、Tooltip 提示及文字插槽。

## 导入

```tsx
import { WrappedAiPortalIconButton } from "@easyops/wrapped-components";
```

## Props

| 属性           | 类型                                                           | 必填 | 默认值 | 说明                                                                                   |
| -------------- | -------------------------------------------------------------- | ---- | ------ | -------------------------------------------------------------------------------------- |
| icon           | `GeneralIconProps`                                             | 否   | -      | 按钮图标配置                                                                           |
| tooltip        | `string`                                                       | 否   | -      | 悬停时显示的 Tooltip 文本                                                              |
| tooltipHoist   | `boolean`                                                      | 否   | -      | 是否将 Tooltip 挂载到顶层，避免被父容器裁剪                                            |
| active         | `boolean`                                                      | 否   | -      | 是否为激活状态，通过 CSS 属性选择器控制样式，不触发重新渲染                            |
| disabled       | `boolean`                                                      | 否   | -      | 是否禁用按钮                                                                           |
| variant        | `"default" \| "light" \| "mini" \| "mini-light" \| "bordered"` | 否   | -      | 按钮视觉变体，通过 CSS 属性选择器控制样式，不触发重新渲染                              |
| reduceIconSize | `boolean`                                                      | 否   | -      | 是否缩小图标尺寸（部分 easyops 图标过大），通过 CSS 属性选择器控制样式，不触发重新渲染 |

## Slots

| 名称    | 说明                       |
| ------- | -------------------------- |
| default | 图标旁边的文字内容（可选） |

## Examples

### Basic

基础图标按钮，配置图标和 Tooltip 提示。

```tsx
<WrappedAiPortalIconButton
  icon={{ lib: "antd", icon: "download" }}
  tooltip="下载"
/>
```

### Variants

展示不同视觉变体的图标按钮。

```tsx
<div style={{ display: "flex", gap: 8, alignItems: "center", padding: 8 }}>
  <WrappedAiPortalIconButton
    variant="default"
    icon={{ lib: "antd", icon: "setting" }}
    tooltip="默认样式"
  />
  <WrappedAiPortalIconButton
    variant="light"
    icon={{ lib: "antd", icon: "heart" }}
    tooltip="轻量样式"
  />
  <WrappedAiPortalIconButton
    variant="mini"
    icon={{ lib: "antd", icon: "star" }}
    tooltip="迷你样式"
  />
  <WrappedAiPortalIconButton
    variant="mini-light"
    icon={{ lib: "antd", icon: "bell" }}
    tooltip="迷你轻量"
  />
  <WrappedAiPortalIconButton
    variant="bordered"
    icon={{ lib: "antd", icon: "plus" }}
    tooltip="边框样式"
  />
</div>
```

### Disabled State

展示禁用状态的图标按钮。

```tsx
<WrappedAiPortalIconButton
  icon={{ lib: "antd", icon: "delete" }}
  tooltip="无法删除"
  disabled
/>
```

### With Text Slot

图标按钮配合文字内容插槽。

```tsx
<WrappedAiPortalIconButton
  icon={{ lib: "easyops", icon: "new-chat" }}
  active
  reduceIconSize
>
  <span>新建对话</span>
</WrappedAiPortalIconButton>
```

### With Tooltip Hoist

配置 tooltipHoist 防止 Tooltip 被父容器裁剪。

```tsx
<WrappedAiPortalIconButton
  icon={{ lib: "antd", icon: "info-circle" }}
  tooltip="这是一条提示信息"
  tooltipHoist
/>
```
