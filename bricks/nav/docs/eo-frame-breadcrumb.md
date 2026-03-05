---
tagName: eo-frame-breadcrumb
displayName: WrappedEoFrameBreadcrumb
description: 面包屑
category: ""
source: "@next-bricks/nav"
---

# eo-frame-breadcrumb

> 面包屑

## Props

| 属性         | 类型                                | 必填 | 默认值 | 说明                 |
| ------------ | ----------------------------------- | ---- | ------ | -------------------- |
| breadcrumb   | `BreadcrumbItemConf[] \| undefined` | 否   | —      | 面包屑配置           |
| noCurrentApp | `boolean \| undefined`              | 否   | —      | 是否隐藏当前应用名称 |
| menu         | `Menu \| undefined`                 | 否   | —      | 菜单配置             |

## Examples

### Basic

展示基础面包屑导航，指定多级路径文本。

```yaml preview
brick: eo-frame-breadcrumb
properties:
  breadcrumb:
    - text: 事件中心
    - text: 告警规则
    - text: 编辑
```

### Hide Current App

隐藏当前应用名称，仅显示自定义面包屑路径。

```yaml preview
brick: eo-frame-breadcrumb
properties:
  noCurrentApp: true
  breadcrumb:
    - text: 主页
    - text: 设置
    - text: 用户管理
```

### With Menu Config

配置菜单信息，在启用 useCurrentMenuTitle 时显示菜单标题作为面包屑项。

```yaml preview
brick: eo-frame-breadcrumb
properties:
  breadcrumb:
    - text: 资源中心
    - text: 服务器列表
  menu:
    title: 服务器管理
    icon:
      lib: antd
      icon: server
      theme: outlined
```
