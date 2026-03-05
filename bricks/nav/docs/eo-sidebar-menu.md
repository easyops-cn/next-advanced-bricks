---
tagName: eo-sidebar-menu
displayName: WrappedEoSidebarMenu
description: 侧栏菜单
category: navigation
source: "@next-bricks/nav"
---

# eo-sidebar-menu

> 侧栏菜单

## Props

| 属性          | 类型      | 必填 | 默认值 | 说明                 |
| ------------- | --------- | ---- | ------ | -------------------- |
| menuCollapsed | `boolean` | 否   | -      | 菜单整体是否收起状态 |

## Examples

### Basic

展示侧栏菜单的基本用法，可包含菜单项、菜单分组和子菜单，支持整体收起/展开切换。

```yaml preview gap
- brick: eo-button
  context:
    - name: menuCollapsed
      value: false
  properties:
    type: primary
    textContent: switch collapsed
  events:
    click:
      - action: context.replace
        args:
          - menuCollapsed
          - <% !CTX.menuCollapsed %>
- brick: eo-sidebar-menu
  properties:
    id: sidebar-menu
    menuCollapsed: <%= CTX.menuCollapsed %>
    style: "<%= { width: CTX.menuCollapsed ? '40px' : '196px' } %>"
  children:
    - brick: eo-sidebar-menu-item
      properties:
        textContent: "菜单项 1"
        icon:
          lib: easyops
          category: second-menu
          icon: gaussdb-for-opengauss-second-menu
    - brick: eo-sidebar-menu-group
      children:
        - brick: span
          slot: title
          properties:
            textContent: "菜单分组"
        - brick: eo-sidebar-menu-item
          properties:
            textContent: "菜单项 2"
            icon:
              lib: easyops
              category: second-menu
              icon: firewall-second-menu
        - brick: eo-sidebar-menu-item
          properties:
            textContent: "菜单项 3"
            icon:
              lib: easyops
              category: second-menu
              icon: host-resources-second-menu
        - brick: eo-sidebar-menu-item
          properties:
            textContent: "菜单项 4"
            icon:
              lib: easyops
              category: second-menu
              icon: loadbalance-second-menu
    - brick: eo-sidebar-menu-submenu
      properties:
        icon:
          lib: easyops
          category: second-menu
          icon: oceanbase-second-menu
      children:
        - brick: span
          slot: title
          properties:
            textContent: "子菜单"
        - brick: eo-sidebar-menu-item
          properties:
            textContent: "菜单项 5"
            icon:
              lib: easyops
              category: second-menu
              icon: nginx-second-menu
            inSubmenu: true
        - brick: eo-sidebar-menu-item
          properties:
            textContent: "菜单项 6"
            icon:
              lib: easyops
              category: second-menu
              icon: process-task-second-menu
            inSubmenu: true
        - brick: eo-sidebar-menu-item
          properties:
            textContent: "菜单项 7"
            icon:
              lib: easyops
              category: second-menu
              icon: persistent-volume-statement-second-menu
            inSubmenu: true
```
