---
tagName: visual-builder.chat-preview
displayName: WrappedVisualBuilderChatPreview
description: Visual Builder 的聊天预览构件，在 iframe 中渲染 Storyboard 并支持元素检查模式
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.chat-preview

> Visual Builder 的聊天预览构件，在 iframe 中渲染 Storyboard 并支持元素检查模式

## Props

| 属性       | 类型                       | 必填 | 默认值 | 说明                                                             |
| ---------- | -------------------------- | ---- | ------ | ---------------------------------------------------------------- |
| storyboard | `BrickConf \| BrickConf[]` | 否   | -      | 要预览的砖块配置，支持单个或列表，更新后自动触发 iframe 重新渲染 |
| theme      | `string`                   | 否   | -      | 预览的主题，例如 "dark-v2"                                       |
| uiVersion  | `string`                   | 否   | -      | 预览的 UI 版本，例如 "8.2"                                       |
| app        | `MicroApp`                 | 否   | -      | 预览使用的 MicroApp 配置，影响 app 上下文                        |
| inspecting | `boolean`                  | 否   | -      | 是否开启元素检查模式，开启后鼠标悬停和点击时会显示元素轮廓高亮   |

## Events

| 事件                | detail                                                                          | 说明                                           |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| activeTarget.change | `InspectSelector \| undefined` — 当前激活的检查目标选择器，未选中时为 undefined | 用户在检查模式下点击元素时，激活目标变化时触发 |

## Methods

| 方法   | 参数                                 | 返回值 | 说明                                             |
| ------ | ------------------------------------ | ------ | ------------------------------------------------ |
| select | `(payload: InspectSelector) => void` | `void` | 向 iframe 内的预览代理发送选中指令，高亮指定元素 |

## Examples

### Basic

展示 Chat Preview 的基本用法，传入砖块配置后在 iframe 中渲染预览。

```yaml preview
brick: visual-builder.chat-preview
properties:
  storyboard:
    - brick: eo-button
      properties:
        textContent: 预览按钮
        type: primary
```

### With Theme

指定预览主题和 UI 版本，使预览效果与目标环境匹配。

```yaml preview
brick: visual-builder.chat-preview
properties:
  theme: dark-v2
  uiVersion: "8.2"
  storyboard:
    - brick: eo-button
      properties:
        textContent: 暗色主题预览
        type: primary
```

### Inspect Mode

开启检查模式，鼠标悬停时显示元素轮廓，点击时触发激活目标变化事件。

```yaml preview
brick: visual-builder.chat-preview
properties:
  inspecting: true
  storyboard:
    - brick: eo-button
      properties:
        textContent: 点击以检查
        type: primary
events:
  activeTarget.change:
    action: console.log
```
