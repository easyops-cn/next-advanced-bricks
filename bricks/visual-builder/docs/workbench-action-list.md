---
tagName: visual-builder.workbench-action-list
displayName: WrappedVisualBuilderWorkbenchActionList
description: 工作台侧边栏操作列表，根据菜单配置渲染一组 workbench-action 按钮，并根据当前路由高亮激活项
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.workbench-action-list

> 工作台侧边栏操作列表，根据菜单配置渲染一组 workbench-action 按钮，并根据当前路由高亮激活项

## Props

| 属性  | 类型          | 必填 | 默认值 | 说明                                      |
| ----- | ------------- | ---- | ------ | ----------------------------------------- |
| appId | `string`      | 否   | -      | 当前应用 ID，用于在切换应用时重置历史记录 |
| menu  | `SidebarMenu` | 是   | -      | 侧边栏菜单配置                            |

## Examples

### Basic

根据菜单配置渲染侧边栏操作按钮列表，自动根据当前路由高亮对应的按钮。

```yaml preview
brick: visual-builder.workbench-action-list
properties:
  appId: my-app
  menu:
    menuItems:
      - type: default
        text: 首页
        to: /home
        icon:
          lib: antd
          icon: home
          theme: outlined
      - type: default
        text: 设置
        to: /settings
        icon:
          lib: antd
          icon: setting
          theme: outlined
      - type: default
        text: 用户
        to: /users
        icon:
          lib: antd
          icon: user
          theme: outlined
```

### 外部链接菜单项

菜单项中使用 href 配置外部链接，点击后不会记录路由历史。

```yaml preview
brick: visual-builder.workbench-action-list
properties:
  appId: my-app
  menu:
    menuItems:
      - type: default
        text: 内部页面
        to: /internal
        icon:
          lib: antd
          icon: appstore
          theme: outlined
      - type: default
        text: 外部文档
        href: https://example.com/docs
        target: _blank
        icon:
          lib: antd
          icon: book
          theme: outlined
```
