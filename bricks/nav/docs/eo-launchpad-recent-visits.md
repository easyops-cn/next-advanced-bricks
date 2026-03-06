---
tagName: eo-launchpad-recent-visits
displayName: WrappedEoLaunchpadRecentVisits
description: launchpad 最近访问
category: ""
source: "@next-bricks/nav"
---

# eo-launchpad-recent-visits

> launchpad 最近访问

## Props

| 属性   | 类型     | 必填 | 默认值 | 说明                                                                             |
| ------ | -------- | ---- | ------ | -------------------------------------------------------------------------------- |
| target | `Target` | 否   | -      | 菜单项链接打开的目标（仅对应用类型的访问项生效，自定义链接类型始终在新标签打开） |

## Examples

### Basic

展示最近访问列表的基本用法。

```yaml preview
brick: eo-launchpad-recent-visits
```

### 在新标签打开应用链接

设置应用类型的最近访问链接在新标签页打开。

```yaml preview
brick: eo-launchpad-recent-visits
properties:
  target: _blank
```
