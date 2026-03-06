---
tagName: eo-sidebar-menu-submenu
displayName: WrappedEoSidebarMenuSubmenu
description: 侧栏菜单子菜单
category: navigation
source: "@next-bricks/nav"
---

# WrappedEoSidebarMenuSubmenu

> 侧栏菜单子菜单

## 导入

```tsx
import { WrappedEoSidebarMenuSubmenu } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型               | 必填 | 默认值 | 说明                 |
| ------------- | ------------------ | ---- | ------ | -------------------- |
| icon          | `GeneralIconProps` | 否   | -      | 菜单的图标           |
| selected      | `boolean`          | 否   | -      | 是否选中             |
| collapsed     | `boolean`          | 否   | -      | 是否折叠             |
| menuCollapsed | `boolean`          | 否   | -      | 菜单整体是否收起状态 |

## Slots

| 名称  | 说明       |
| ----- | ---------- |
| title | 子菜单标题 |

## Examples

### Basic

展示侧栏子菜单的基本用法，通过 `title` 插槽设置标题，默认插槽放置子菜单项，点击标题可切换展开/收起。

```tsx
<WrappedEoSidebarMenuSubmenu
  style={{ width: "196px" }}
  icon={{ lib: "antd", icon: "menu", theme: "outlined" }}
>
  <span slot="title">子菜单</span>
  <WrappedEoSidebarMenuItem
    textContent="菜单项 1"
    icon={{
      lib: "easyops",
      category: "second-menu",
      icon: "availability-zone-second-menu",
    }}
    inSubmenu={true}
  />
  <WrappedEoSidebarMenuItem textContent="菜单项 2" inSubmenu={true} />
  <WrappedEoSidebarMenuItem textContent="菜单项 3" inSubmenu={true} />
</WrappedEoSidebarMenuSubmenu>
```

### 默认折叠

设置 `collapsed` 为 `true` 使子菜单默认为收起状态。

```tsx
<WrappedEoSidebarMenuSubmenu
  style={{ width: "196px" }}
  collapsed={true}
  icon={{ lib: "antd", icon: "menu", theme: "outlined" }}
>
  <span slot="title">默认折叠子菜单</span>
  <WrappedEoSidebarMenuItem textContent="菜单项 1" inSubmenu={true} />
  <WrappedEoSidebarMenuItem textContent="菜单项 2" inSubmenu={true} />
</WrappedEoSidebarMenuSubmenu>
```
