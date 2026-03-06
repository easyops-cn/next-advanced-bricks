---
tagName: eo-launchpad-quick-access
displayName: WrappedEoLaunchpadQuickAccess
description: 快捷访问
category: ""
source: "@next-bricks/nav"
---

# eo-launchpad-quick-access

> 快捷访问

## Props

| 属性     | 类型      | 必填 | 默认值 | 说明                               |
| -------- | --------- | ---- | ------ | ---------------------------------- |
| readonly | `boolean` | 否   | -      | 是否为只读模式（隐藏收藏切换按钮） |
| target   | `Target`  | 否   | -      | 菜单项链接打开的目标               |

## Examples

### Basic

展示快捷访问列表的基本用法，以只读模式渲染收藏菜单项。

```yaml preview
brick: eo-launchpad-quick-access
properties:
  readonly: true
  target: _blank
```

### 可收藏模式

允许用户切换收藏状态的完整交互模式。

```yaml preview
brick: eo-launchpad-quick-access
properties:
  readonly: false
```
