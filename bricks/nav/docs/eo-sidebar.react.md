---
tagName: eo-sidebar
displayName: WrappedEoSidebar
description: 侧边栏
category: navigation
source: "@next-bricks/nav"
---

# WrappedEoSidebar

> 侧边栏

## 导入

```tsx
import { WrappedEoSidebar } from "@easyops/wrapped-components";
```

## Props

| 属性            | 类型                  | 必填 | 默认值    | 说明                             |
| --------------- | --------------------- | ---- | --------- | -------------------------------- |
| menu            | `SidebarMenuType`     | 是   | -         | 菜单数据                         |
| hiddenFixedIcon | `boolean`             | 否   | -         | 是否隐藏固定按钮                 |
| expandedState   | `ExpandedState`       | 否   | -         | 侧栏状态                         |
| position        | `"static" \| "fixed"` | 否   | `"fixed"` | 设置定位方式：静态定位或固定定位 |

## Events

| 事件                  | detail                     | 说明               |
| --------------------- | -------------------------- | ------------------ |
| onActualWidthChange   | `number` — 当前宽度        | 宽度变化时触发     |
| onExpandedStateChange | `ExpandedState` — 侧栏状态 | 侧栏状态变化时触发 |

## Examples

### Basic

展示侧边栏的基本用法，支持菜单项、子菜单和分组，用户可鼠标悬停展开或点击固定图标固定宽度。

```tsx
<WrappedEoSidebar
  style={{ height: "600px" }}
  position="static"
  menu={{
    title: "这是一个菜单标题",
    menuItems: [
      {
        icon: {
          lib: "easyops",
          category: "second-menu",
          icon: "automatic-collection-second-menu",
        },
        text: "item 1",
        to: "/nlicro-test3/breadcrumb/new",
        type: "default",
        children: [],
        key: "0",
      },
      {
        icon: {
          lib: "easyops",
          category: "second-menu",
          icon: "deployment-instance-second-menu",
        },
        text: "item 2",
        to: "item 2",
        type: "default",
        children: [],
        key: "1",
      },
      {
        type: "subMenu",
        title: "sub 1",
        icon: {
          lib: "easyops",
          category: "second-menu",
          icon: "deployment-architecture-second-menu",
        },
        items: [
          {
            text: "inner 1",
            to: "inner 1",
            type: "default",
            children: [],
            key: "2.0",
          },
          {
            text: "inner 2",
            to: "inner 2",
            type: "default",
            children: [],
            key: "2.1",
          },
        ],
        key: "2",
      },
    ],
  }}
  onActualWidthChange={(e) => console.log(e.detail)}
  onExpandedStateChange={(e) => console.log(e.detail)}
/>
```

### 隐藏固定按钮

隐藏侧边栏底部的固定/取消固定图标按钮。

```tsx
<WrappedEoSidebar
  style={{ height: "600px" }}
  position="static"
  hiddenFixedIcon={true}
  menu={{
    title: "菜单标题",
    menuItems: [
      {
        icon: {
          lib: "easyops",
          category: "second-menu",
          icon: "automatic-collection-second-menu",
        },
        text: "item 1",
        to: "/a",
        type: "default",
        key: "0",
      },
      {
        icon: {
          lib: "easyops",
          category: "second-menu",
          icon: "deployment-instance-second-menu",
        },
        text: "item 2",
        to: "/b",
        type: "default",
        key: "1",
      },
    ],
  }}
/>
```
