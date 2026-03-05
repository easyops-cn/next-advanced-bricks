---
tagName: eo-sidebar-menu
displayName: WrappedEoSidebarMenu
description: 侧栏菜单
category: navigation
source: "@next-bricks/nav"
---

# WrappedEoSidebarMenu

> 侧栏菜单

## 导入

```tsx
import { WrappedEoSidebarMenu } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型      | 必填 | 默认值 | 说明                 |
| ------------- | --------- | ---- | ------ | -------------------- |
| menuCollapsed | `boolean` | 否   | -      | 菜单整体是否收起状态 |

## Examples

### Basic

展示侧栏菜单的基本用法，可包含菜单项、菜单分组和子菜单，支持整体收起/展开切换。

```tsx
import { useState } from "react";

function SidebarMenuDemo() {
  const [menuCollapsed, setMenuCollapsed] = useState(false);

  return (
    <>
      <WrappedEoButton
        type="primary"
        onClick={() => setMenuCollapsed((c) => !c)}
      >
        switch collapsed
      </WrappedEoButton>
      <WrappedEoSidebarMenu
        menuCollapsed={menuCollapsed}
        style={{ width: menuCollapsed ? "40px" : "196px" }}
      >
        <WrappedEoSidebarMenuItem
          textContent="菜单项 1"
          icon={{
            lib: "easyops",
            category: "second-menu",
            icon: "gaussdb-for-opengauss-second-menu",
          }}
        />
        <WrappedEoSidebarMenuGroup>
          <span slot="title">菜单分组</span>
          <WrappedEoSidebarMenuItem
            textContent="菜单项 2"
            icon={{
              lib: "easyops",
              category: "second-menu",
              icon: "firewall-second-menu",
            }}
          />
          <WrappedEoSidebarMenuItem
            textContent="菜单项 3"
            icon={{
              lib: "easyops",
              category: "second-menu",
              icon: "host-resources-second-menu",
            }}
          />
          <WrappedEoSidebarMenuItem
            textContent="菜单项 4"
            icon={{
              lib: "easyops",
              category: "second-menu",
              icon: "loadbalance-second-menu",
            }}
          />
        </WrappedEoSidebarMenuGroup>
        <WrappedEoSidebarMenuSubmenu
          icon={{
            lib: "easyops",
            category: "second-menu",
            icon: "oceanbase-second-menu",
          }}
        >
          <span slot="title">子菜单</span>
          <WrappedEoSidebarMenuItem
            textContent="菜单项 5"
            icon={{
              lib: "easyops",
              category: "second-menu",
              icon: "nginx-second-menu",
            }}
            inSubmenu={true}
          />
          <WrappedEoSidebarMenuItem
            textContent="菜单项 6"
            icon={{
              lib: "easyops",
              category: "second-menu",
              icon: "process-task-second-menu",
            }}
            inSubmenu={true}
          />
          <WrappedEoSidebarMenuItem
            textContent="菜单项 7"
            icon={{
              lib: "easyops",
              category: "second-menu",
              icon: "persistent-volume-statement-second-menu",
            }}
            inSubmenu={true}
          />
        </WrappedEoSidebarMenuSubmenu>
      </WrappedEoSidebarMenu>
    </>
  );
}
```
