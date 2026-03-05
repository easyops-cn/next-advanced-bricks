---
tagName: nav.launchpad-config
displayName: WrappedNavLaunchpadConfig
description: 进行 Launchpad 配置。也可用于菜单自定义显示产品功能清单。
category: ""
source: "@next-bricks/nav"
---

# nav.launchpad-config

> 进行 Launchpad 配置。也可用于菜单自定义显示产品功能清单。

## Props

| 属性              | 类型                             | 必填 | 默认值               | 说明                                                                                                                                        |
| ----------------- | -------------------------------- | ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| menuGroups        | `ConfigMenuGroup[] \| undefined` | 否   | —                    | Launchpad 配置菜单分组数据                                                                                                                  |
| actions           | `MenuAction[] \| undefined`      | 否   | —                    | 菜单操作按钮配置列表                                                                                                                        |
| variant           | `ConfigVariant \| undefined`     | 否   | `"launchpad-config"` | 显示变体：launchpad-config（Launchpad 配置）、factory-launchpad-config（工厂配置）、menu-config（菜单配置）、blacklist-config（黑名单配置） |
| urlTemplate       | `string \| undefined`            | 否   | —                    | 菜单项 APP 类型的链接模板，例如可配置为 `/app/{{ id }}`。注：仅用于 variant: "menu-config"                                                  |
| customUrlTemplate | `string \| undefined`            | 否   | —                    | 菜单项自定义类型的链接模板，例如可配置为 `/custom?url={{ __pathname }}`。注：仅用于 variant: "menu-config"。外链菜单链接会设置为禁用        |
| blacklist         | `string[] \| undefined`          | 否   | —                    | 屏蔽的 URL 列表，例如可配置为 `["/app/1", "/app/2"]`。注：仅用于 variant: "blacklist-config"                                                |

## Events

| 事件            | detail                                                                                   | 说明                   |
| --------------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| menu-item.click | `ConfigMenuItemNormal` — 被点击的菜单项数据（app 或 custom 类型）                        | 点击菜单项时触发       |
| action.click    | `MenuActionEventDetail` — { data: 操作关联的菜单项或分组, action: 被点击的操作按钮配置 } | 点击菜单操作按钮时触发 |

## Examples

### Launchpad Config

展示 Launchpad 配置视图，列出可用的菜单分组及应用。

```yaml preview
brick: nav.launchpad-config
properties:
  variant: launchpad-config
  menuGroups:
    - id: group1
      instanceId: g1
      name: 运维工具
      items:
        - id: app1
          instanceId: a1
          type: app
          name: 监控中心
          url: /next/monitor
        - id: app2
          instanceId: a2
          type: app
          name: 告警中心
          url: /next/alert
    - id: group2
      instanceId: g2
      name: 资源管理
      items:
        - id: app3
          instanceId: a3
          type: app
          name: 服务器管理
          url: /next/host
events:
  menu-item.click:
    - action: console.log
```

### Menu Config Variant

以菜单配置模式展示，使用 urlTemplate 自定义菜单项链接。

```yaml preview
brick: nav.launchpad-config
properties:
  variant: menu-config
  urlTemplate: /app/{{ id }}
  menuGroups:
    - id: group1
      instanceId: g1
      name: 运维工具
      items:
        - id: app1
          instanceId: a1
          type: app
          name: 监控中心
          url: /next/monitor
        - id: custom1
          instanceId: c1
          type: custom
          name: 外部链接
          url: https://example.com
events:
  menu-item.click:
    - action: console.log
```

### Blacklist Config

以黑名单配置模式展示，通过 blacklist 指定屏蔽的 URL 列表。

```yaml preview
brick: nav.launchpad-config
properties:
  variant: blacklist-config
  blacklist:
    - /monitor
    - /alert
  menuGroups:
    - id: group1
      instanceId: g1
      name: 运维工具
      items:
        - id: app1
          instanceId: a1
          type: app
          name: 监控中心
          url: /next/monitor
        - id: app2
          instanceId: a2
          type: app
          name: 告警中心
          url: /next/alert
        - id: app3
          instanceId: a3
          type: app
          name: 服务器管理
          url: /next/host
```
