---
tagName: eo-nav-menu
displayName: WrappedEoNavMenu
description: 菜单构件
category: navigation
source: "@next-bricks/nav"
---

# eo-nav-menu

> 菜单构件

## Props

| 属性               | 类型            | 必填 | 默认值 | 说明                       |
| ------------------ | --------------- | ---- | ------ | -------------------------- |
| menu               | `SidebarMenu`   | 否   | -      | 菜单项                     |
| mainMenuTitleStyle | `CSSProperties` | 否   | -      | 主菜单标题文字的自定义样式 |
| showTooltip        | `boolean`       | 否   | -      | 是否显示 tooltip           |

## Examples

### Basic

展示导航菜单的基本用法，支持普通菜单项、子菜单和分组，超出宽度时自动折叠到"···"溢出菜单。

```yaml preview minHeight="300px"
- brick: eo-nav-menu
  properties:
    menu:
      title: mock data
      menuItems:
        - text: 创造
          to: /a
          type: default
        - title: 资源库
          type: subMenu
          items:
            - text: 构件库
              to: /b
              type: default
            - title: 契约中心
              to: /c
              type: subMenu
              items:
                - text: cmdb契约
                  to: /cmdb
                  type: default
                - title: devops契约
                  type: subMenu
                  items:
                    - text: flow
                      to: /flow
                      type: default
                    - text: tool
                      to: /tool
                      type: default
        - text: 文档中心
          href: "http://www.baidu.com"
          type: default
        - title: 接口与数据
          type: subMenu
          items:
            - text: Api Gateway
              to: /d
              type: default
            - title: 测试组
              type: group
              items:
                - text: 挂件
                  to: /e
                  type: default
                - text: 构件
                  to: /f
                  type: default
- brick: div
- brick: eo-nav-menu
  properties:
    mainMenuTitleStyle:
      color: purple
    menu:
      title: mock data
      menuItems:
        - text: 创造
          to: /a
          type: default
        - title: 资源库
          type: subMenu
          items:
            - text: 构件库
              to: /b
              type: default
            - title: 契约中心
              to: /c
              type: subMenu
              items:
                - text: cmdb契约
                  to: /cmdb
                  type: default
                - title: devops契约
                  type: subMenu
                  items:
                    - text: flow
                      to: /flow
                      type: default
                    - text: tool
                      to: /tool
                      type: default
        - text: 文档中心
          href: "http://www.baidu.com"
          type: default
        - title: 接口与数据
          type: subMenu
          items:
            - text: Api Gateway
              to: /d
              type: default
            - title: 测试组
              type: group
              items:
                - text: 挂件
                  to: /e
                  type: default
                - text: 构件
                  to: /f
                  type: default
```

### 溢出折叠

限制菜单宽度后超出菜单项自动收入"···"溢出子菜单中。

```yaml preview minHeight="300px"
brick: eo-nav-menu
properties:
  style:
    width: 100px
  showTooltip: true
  menu:
    title: mock data
    menuItems:
      - text: 创造
        to: /a
        type: default
      - title: 资源库
        type: subMenu
        items:
          - text: 构件库
            to: /b
            type: default
          - title: 契约中心
            to: /c
            type: subMenu
            items:
              - text: cmdb契约
                to: /cmdb
                type: default
              - title: devops契约
                type: subMenu
                items:
                  - text: flow
                    to: /flow
                    type: default
                  - text: tool
                    to: /tool
                    type: default
      - text: 文档中心
        href: "http://www.baidu.com"
        type: default
      - title: 接口与数据
        type: subMenu
        items:
          - text: Api Gateway
            to: /d
            type: default
          - title: 测试组
            type: group
            items:
              - text: 挂件
                to: /e
                type: default
              - text: 构件
                to: /f
                type: default
```

### 带网站地图的菜单

分组菜单项设置 `childLayout: siteMap` 后，悬停展示网站地图样式的下拉面板。

```yaml preview minHeight="500px"
brick: eo-nav-menu
properties:
  menu:
    title: mock data
    menuItems:
      - text: 创造
        to: /a
        type: default
      - title: 资源库
        type: subMenu
        items:
          - text: 构件库
            to: /b
            type: default
          - title: 契约中心
            to: /c
            type: subMenu
            items:
              - text: cmdb契约
                to: /cmdb
                type: default
              - title: devops契约
                type: subMenu
                items:
                  - text: flow
                    to: /flow
                    type: default
                  - text: tool
                    to: /tool
                    type: default
      - title: 服务
        type: group
        groupId: resource
        childLayout: siteMap
        items:
          - type: group
            childLayout: default
            title: 计算
            items:
              - text: 主机(本地部署)
                to: /computing-resource-monitor/local/host
                type: default
                key: 1.0.0
              - text: 集群
                to: /computing-resource-monitor/kubernetes/cluster
                type: default
                key: 1.0.1
              - text: Pod
                to: /computing-resource-monitor/kubernetes/pod
                type: default
                key: 1.0.2
            key: "1.0"
          - type: group
            title: 存储
            items:
              - text: 腾讯云・云磁盘CBS
                to: /storage-resource-monitor/cbs
                type: default
                key: 1.1.0
              - text: 腾讯云对象存储
                to: /storage-resource-monitor/cos
                type: default
                key: 1.1.1
            key: "1.1"
```
