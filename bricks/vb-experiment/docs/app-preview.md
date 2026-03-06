---
tagName: vb-experiment.app-preview
displayName: WrappedVbExperimentAppPreview
description: 在 iframe 中实时预览 Storyboard 的 App 预览构件，通过内置的 AppPreviewer 接口渲染页面
category: ""
source: "@next-bricks/vb-experiment"
---

# vb-experiment.app-preview

> 在 iframe 中实时预览 Storyboard 的 App 预览构件，通过内置的 AppPreviewer 接口渲染页面

## Props

| 属性       | 类型         | 必填 | 默认值 | 说明                                                       |
| ---------- | ------------ | ---- | ------ | ---------------------------------------------------------- |
| storyboard | `Storyboard` | 否   | -      | 要预览的 Storyboard 配置，更新后会自动触发 iframe 内容刷新 |

## Examples

### Basic

展示 App Preview 基本用法，传入 Storyboard 配置后在 iframe 中渲染预览页面。

```yaml preview
brick: vb-experiment.app-preview
properties:
  storyboard:
    routes:
      - path: /preview
        exact: true
        bricks:
          - brick: eo-button
            properties:
              textContent: Hello from App Preview
              type: primary
```
