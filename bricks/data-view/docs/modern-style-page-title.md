---
tagName: data-view.modern-style-page-title
displayName: WrappedDataViewModernStylePageTitle
description: 现代风页面标题
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.modern-style-page-title

> 现代风页面标题

## Props

| 属性            | 类型                  | 必填 | 默认值 | 说明             |
| --------------- | --------------------- | ---- | ------ | ---------------- |
| pageTitle       | `string`              | 是   | -      | 页面标题         |
| description     | `string`              | 否   | -      | 辅助描述         |
| backgroundStyle | `React.CSSProperties` | 否   | -      | 背景样式         |
| leftRoundStyle  | `React.CSSProperties` | 否   | -      | 左边圆形装饰样式 |
| rightRoundStyle | `React.CSSProperties` | 否   | -      | 右边圆形装饰样式 |

## Examples

### Basic

展示现代风页面标题的基本用法，包含主标题和辅助描述。

```yaml preview
- brick: data-view.modern-style-page-title
  properties:
    pageTitle: XX应用大屏
    description: "- APPLICATION HEALTH MONITORING SCREEN -"
    style:
      display: block
      background-color: "#1c1e21"
```

### Custom Style

展示自定义背景和圆形装饰样式的现代风页面标题。

```yaml preview
- brick: data-view.modern-style-page-title
  properties:
    pageTitle: 智慧城市监控大屏
    description: "- SMART CITY MONITORING -"
    backgroundStyle:
      opacity: 0.8
    leftRoundStyle:
      background: "rgba(74, 234, 255, 0.3)"
    rightRoundStyle:
      background: "rgba(74, 234, 255, 0.3)"
    style:
      display: block
      background-color: "#0a0e1a"
```
