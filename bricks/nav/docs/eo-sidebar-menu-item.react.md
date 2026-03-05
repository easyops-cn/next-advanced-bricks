---
tagName: eo-sidebar-menu-item
displayName: WrappedEoSidebarMenuItem
description: 侧栏菜单项
category: navigation
source: "@next-bricks/nav"
---

# WrappedEoSidebarMenuItem

> 侧栏菜单项

## 导入

```tsx
import { WrappedEoSidebarMenuItem } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型                  | 必填 | 默认值 | 说明                     |
| ------------- | --------------------- | ---- | ------ | ------------------------ |
| url           | `LinkProps["url"]`    | 否   | -      | 菜单项对应的系统内地址   |
| href          | `LinkProps["href"]`   | 否   | -      | 菜单项对应的外部链接地址 |
| target        | `LinkProps["target"]` | 否   | -      | 菜单项链接打开的目标     |
| icon          | `GeneralIconProps`    | 否   | -      | 菜单项的图标             |
| selected      | `boolean`             | 否   | -      | 是否选中                 |
| inSubmenu     | `boolean`             | 否   | -      | 是否在二级菜单中         |
| menuCollapsed | `boolean`             | 否   | -      | 菜单整体是否收起状态     |

## Examples

### Basic

展示侧栏菜单项的基本用法，包含图标和文字，点击后导航至对应地址。

```tsx
<WrappedEoSidebarMenuItem
  style={{ width: "196px" }}
  textContent="告警规则"
  icon={{
    lib: "easyops",
    category: "second-menu",
    icon: "availability-zone-second-menu",
  }}
/>
```

### 选中状态

展示菜单项的选中高亮效果。

```tsx
<WrappedEoSidebarMenuItem
  style={{ width: "196px" }}
  textContent="告警规则"
  selected={true}
  icon={{
    lib: "easyops",
    category: "second-menu",
    icon: "availability-zone-second-menu",
  }}
/>
```

### 外部链接

通过 `href` 属性设置外部链接，配合 `target` 在新标签页中打开。

```tsx
<WrappedEoSidebarMenuItem
  style={{ width: "196px" }}
  textContent="外部文档"
  href="http://www.example.com"
  target="_blank"
  icon={{ lib: "antd", icon: "link", theme: "outlined" }}
/>
```

### 子菜单中的菜单项

设置 `inSubmenu` 为 `true` 时，菜单项以缩进样式呈现，适合放在子菜单下。

```tsx
<WrappedEoSidebarMenuItem
  style={{ width: "196px" }}
  textContent="子菜单项"
  inSubmenu={true}
  icon={{ lib: "easyops", category: "second-menu", icon: "nginx-second-menu" }}
/>
```
