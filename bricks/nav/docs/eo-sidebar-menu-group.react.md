---
tagName: eo-sidebar-menu-group
displayName: WrappedEoSidebarMenuGroup
description: 侧栏菜单分组
category: navigation
source: "@next-bricks/nav"
---

# WrappedEoSidebarMenuGroup

> 侧栏菜单分组

## 导入

```tsx
import { WrappedEoSidebarMenuGroup } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型      | 必填 | 默认值 | 说明                 |
| ------------- | --------- | ---- | ------ | -------------------- |
| collapsable   | `boolean` | 否   | -      | 是否允许折叠         |
| collapsed     | `boolean` | 否   | -      | 是否折叠             |
| selected      | `boolean` | 否   | -      | 是否选中             |
| menuCollapsed | `boolean` | 否   | -      | 菜单整体是否收起状态 |

## Slots

| 名称  | 说明     |
| ----- | -------- |
| title | 分组标题 |

## Examples

### Basic

展示侧栏菜单分组的基本用法，通过 `title` 插槽设置分组标题，默认插槽放置菜单项。

```tsx
<WrappedEoSidebarMenuGroup style={{ width: "196px" }}>
  <span slot="title">菜单分组</span>
  <WrappedEoSidebarMenuItem
    textContent="菜单项 1"
    icon={{
      lib: "easyops",
      category: "second-menu",
      icon: "advanced-settings-second-menu",
    }}
  />
  <WrappedEoSidebarMenuItem
    textContent="菜单项 2"
    icon={{
      lib: "easyops",
      category: "second-menu",
      icon: "alibaba-cloud-disk-second-menu",
    }}
  />
  <WrappedEoSidebarMenuItem
    textContent="菜单项 3"
    icon={{
      lib: "easyops",
      category: "second-menu",
      icon: "advanced-settings-second-menu",
    }}
  />
</WrappedEoSidebarMenuGroup>
```

### 可折叠分组

启用 `collapsable` 后，点击分组标题可展开/收起该分组。

```tsx
<WrappedEoSidebarMenuGroup
  style={{ width: "196px" }}
  collapsable={true}
  collapsed={false}
>
  <span slot="title">可折叠分组</span>
  <WrappedEoSidebarMenuItem
    textContent="菜单项 1"
    icon={{
      lib: "easyops",
      category: "second-menu",
      icon: "advanced-settings-second-menu",
    }}
  />
  <WrappedEoSidebarMenuItem
    textContent="菜单项 2"
    icon={{
      lib: "easyops",
      category: "second-menu",
      icon: "alibaba-cloud-disk-second-menu",
    }}
  />
</WrappedEoSidebarMenuGroup>
```
