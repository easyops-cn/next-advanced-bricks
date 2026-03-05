---
tagName: ai-portal.page-container
displayName: WrappedAiPortalPageContainer
description: 页面容器构件，提供统一的页面布局，包含面包屑导航、页面标题和内容区域。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.page-container

> 页面容器构件，提供统一的页面布局，包含面包屑导航、页面标题和内容区域。

## Props

| 属性        | 类型                            | 必填 | 默认值 | 说明                                                                   |
| ----------- | ------------------------------- | ---- | ------ | ---------------------------------------------------------------------- |
| pageTitle   | `string`                        | 否   | -      | 页面标题，同时会调用 applyPageTitle 更新浏览器标签页标题               |
| breadcrumbs | `Breadcrumb[]`                  | 否   | -      | 面包屑导航配置，每项包含 text 和 url                                   |
| size        | `"medium" \| "small" \| "full"` | 否   | -      | 内容区域宽度模式，通过 CSS attribute selector 控制样式，不触发重新渲染 |
| variant     | `"default" \| "form"`           | 否   | -      | 页面变体，通过 CSS attribute selector 控制样式，不触发重新渲染         |
| sticky      | `boolean`                       | 否   | -      | 是否固定头部（含面包屑和标题）到页面顶部                               |

## Slots

| 名称      | 说明   |
| --------- | ------ |
| (default) | 内容   |
| toolbar   | 工具栏 |

## Examples

### 基础使用

展示带页面标题和面包屑导航的页面容器。

```yaml preview
brick: ai-portal.page-container
properties:
  pageTitle: "页面标题"
  breadcrumbs:
    - text: "首页"
      url: "/"
    - text: "子页面"
      url: "/sub"
children:
  - brick: div
    properties:
      textContent: "页面内容区域"
```

### 带工具栏

在标题区右侧放置操作按钮。

```yaml preview
brick: ai-portal.page-container
properties:
  pageTitle: "资源管理"
  breadcrumbs:
    - text: "首页"
      url: "/"
children:
  - brick: eo-button
    slot: toolbar
    properties:
      type: primary
      textContent: "新建"
  - brick: div
    properties:
      textContent: "内容区域"
```

### 固定头部

启用 sticky 将面包屑和标题区域固定在顶部。

```yaml preview
brick: ai-portal.page-container
properties:
  pageTitle: "固定头部示例"
  sticky: true
  size: medium
  variant: default
children:
  - brick: div
    properties:
      textContent: "内容滚动时头部保持固定"
```
