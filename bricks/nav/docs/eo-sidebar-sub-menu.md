---
tagName: eo-sidebar-sub-menu
displayName: WrappedEoSidebarSubMenu
description: 侧边栏子菜单，支持简单菜单项、分组和子菜单的嵌套渲染
category: navigation
source: "@next-bricks/nav"
---

# eo-sidebar-sub-menu

> 侧边栏子菜单，支持简单菜单项、分组和子菜单的嵌套渲染

## Props

| 属性 | 类型          | 必填 | 默认值 | 说明   |
| ---- | ------------- | ---- | ------ | ------ |
| menu | `SidebarMenu` | 否   | -      | 菜单项 |

## Examples

### Basic

展示侧边栏子菜单的基本用法，支持简单菜单项、分组和子菜单嵌套，根据当前路径自动高亮选中项。

```yaml preview
- brick: eo-sidebar-sub-menu
  properties:
    style:
      width: 220px
      display: block
    menu:
      title: mock data
      menuItems:
        - exact: true
          icon:
            lib: easyops
            category: third-menu
            icon: advanced-settings-third-menu
          text: 测试标题
          to: /developers/brick-book/atom/sub-menu
          type: default
          key: "0"
        - items:
            - icon:
                lib: easyops
                category: third-menu
                icon: application-activity-third-menu
              text: 主机测试兼容复杂场景
              to: /developers/brick-book/atom/sub-menu/1
              key: "1.0"
            - icon:
                lib: easyops
                category: third-menu
                icon: dashboard-third-menu
              text: Docker
              to: /developers/brick-book/atom/sub-menu/2
              key: "1.1"
          title: 平台资源
          type: group
          key: "1"
        - items:
            - icon:
                lib: easyops
                category: third-menu
                icon: host-instance-maintenance-third-menu
              text: 开发负责人
              to: /developers/brick-book/atom/sub-menu/3
              key: "2.0"
            - icon:
                lib: easyops
                category: third-menu
                icon: inspection-overview-third-menu
              text: 运维负责人
              to: /developers/brick-book/atom/sub-menu/4
              key: "2.1"
            - icon:
                lib: easyops
                category: third-menu
                icon: job-management-third-menu
              text: 测试负责人
              to: /developers/brick-book/atom/sub-menu/5
              key: "2.2"
          title: 负责人
          type: group
          key: "2"
        - items:
            - icon:
                lib: easyops
                category: third-menu
                icon: plugin-market-third-menu
              items:
                - text: 被调方
                  to: /developers/brick-book/atom/sub-menu/8
                  key: 3.1.0
              title: 被调方
              type: subMenu
              key: "3.1"
          title: 调用关系
          type: group
          key: "3"
```
