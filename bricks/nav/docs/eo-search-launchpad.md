---
tagName: eo-search-launchpad
displayName: WrappedEoSearchLaunchpad
description: launchpad 搜索
category: ""
source: "@next-bricks/nav"
---

# eo-search-launchpad

> launchpad 搜索

## Props

| 属性     | 类型      | 必填 | 默认值 | 说明                         |
| -------- | --------- | ---- | ------ | ---------------------------- |
| readonly | `boolean` | 否   | -      | 简约模式（隐藏收藏切换按钮） |

## Examples

### Basic

展示 launchpad 搜索的基本用法，聚焦后显示应用菜单列表，支持搜索过滤。

```yaml preview
brick: eo-search-launchpad
```

### 简约模式

启用只读模式后隐藏收藏切换按钮。

```yaml preview
brick: eo-search-launchpad
properties:
  readonly: true
```
