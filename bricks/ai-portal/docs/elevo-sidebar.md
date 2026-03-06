---
tagName: ai-portal.elevo-sidebar
displayName: WrappedAiPortalElevoSidebar
description: Elevo AI 侧边栏，包含 Logo 导航、新建对话、历史记录、项目列表及个人账户操作，支持折叠和抽屉两种行为模式。
category: layout-component
source: "@next-bricks/ai-portal"
---

# ai-portal.elevo-sidebar

> Elevo AI 侧边栏，包含 Logo 导航、新建对话、历史记录、项目列表及个人账户操作，支持折叠和抽屉两种行为模式。

## Props

| 属性                     | 类型                    | 必填 | 默认值      | 说明                                                                   |
| ------------------------ | ----------------------- | ---- | ----------- | ---------------------------------------------------------------------- |
| userInstanceId           | `string`                | 否   | -           | 当前用户的实例 ID，用于显示头像和用户名                                |
| behavior                 | `"default" \| "drawer"` | 否   | -           | 侧边栏行为模式，`"default"` 为常驻展开/折叠，`"drawer"` 为抽屉覆盖模式 |
| logoUrl                  | `string`                | 否   | -           | Logo 区域的跳转链接                                                    |
| newChatUrl               | `string`                | 否   | -           | 新建对话按钮的跳转链接                                                 |
| newChatLinkWhenCollapsed | `boolean`               | 否   | -           | 侧边栏折叠时是否仍显示新建对话快捷入口                                 |
| historyUrlTemplate       | `string`                | 否   | -           | 对话历史记录条目的链接模板，支持 `{{conversationId}}` 等占位符         |
| historyActions           | `ActionType[]`          | 否   | -           | 对话历史记录条目的操作按钮列表                                         |
| showProjects             | `boolean`               | 否   | -           | 是否显示项目列表区块                                                   |
| projectUrlTemplate       | `string`                | 否   | -           | 项目条目的链接模板，支持 `{{instanceId}}` 等占位符                     |
| projectActions           | `ActionType[]`          | 否   | -           | 项目条目的操作按钮列表                                                 |
| personalActions          | `ActionType[]`          | 否   | -           | 个人账户区域的自定义操作列表，未设置时显示默认的退出登录和切换语言选项 |
| links                    | `SidebarLink[]`         | 否   | -           | 侧边栏顶部的自定义链接列表，显示在新建对话按钮下方                     |
| canAddProject            | `boolean`               | 否   | `true`      | 是否显示新建项目按钮                                                   |
| myLinks                  | `SidebarLink[]`         | 否   | -           | 历史区域顶部的"我的"快捷链接列表                                       |
| scope                    | `"default" \| "space"`  | 否   | `"default"` | 视图模式，`"space"` 时显示空间导航（SpaceNav）替换历史记录             |
| spaceNav                 | `SpaceNavProps`         | 否   | -           | scope 为 `"space"` 时的空间导航配置                                    |

## Events

| 事件                  | detail                                                                                                                         | 说明                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| logout                | `void`                                                                                                                         | 点击退出登录时触发                                |
| action.click          | `ActionClickDetail` — { action: 点击的操作项（含 project 等扩展字段）, item: 当前对话历史记录项, project: 关联的项目（可选） } | 点击对话历史操作按钮时触发                        |
| project.action.click  | `ProjectActionClickDetail` — { action: 点击的操作项, project: 当前项目对象 }                                                   | 点击项目操作按钮时触发                            |
| add.project           | `void`                                                                                                                         | 点击新建项目按钮时触发                            |
| add.serviceflow       | `void`                                                                                                                         | 点击新建服务流按钮时触发（scope 为 space 时有效） |
| personal.action.click | `PersonalActionClickDetail` — { action: 点击的操作项 }                                                                         | 点击个人操作按钮时触发                            |

## Methods

| 方法             | 参数                               | 返回值 | 说明                                         |
| ---------------- | ---------------------------------- | ------ | -------------------------------------------- |
| pullHistory      | `(delay: number) => void`          | `void` | 延迟一段时间后拉取最新对话历史               |
| open             | `() => void`                       | `void` | 展开侧边栏（behavior 为 drawer 时有效）      |
| close            | `() => void`                       | `void` | 折叠侧边栏（behavior 为 drawer 时有效）      |
| removeProject    | `(projectId: string) => void`      | `void` | 从历史列表中移除指定项目及其对话             |
| addProject       | `(project: Project) => void`       | `void` | 向项目列表中追加一个新项目                   |
| moveConversation | `(conversationId: string) => void` | `void` | 将指定对话标记为已移入项目，从历史列表中隐藏 |

## Examples

### Basic

基础用法，展示默认侧边栏。

```yaml preview
brick: ai-portal.elevo-sidebar
properties:
  userInstanceId: "user-001"
  logoUrl: "/"
  newChatUrl: "/chat/new"
  historyUrlTemplate: "/chat/{{conversationId}}"
events:
  logout:
    action: "console.log"
```

### With Projects

启用项目列表，并配置项目操作按钮。

```yaml preview
brick: ai-portal.elevo-sidebar
properties:
  userInstanceId: "user-001"
  logoUrl: "/"
  newChatUrl: "/chat/new"
  historyUrlTemplate: "/chat/{{conversationId}}"
  showProjects: true
  canAddProject: true
  projectUrlTemplate: "/project/{{instanceId}}"
  projectActions:
    - key: delete
      text: 删除
      icon:
        lib: antd
        icon: delete
      danger: true
events:
  logout:
    action: "console.log"
  add.project:
    action: "console.log"
  project.action.click:
    action: "console.log"
```

### Drawer Mode

抽屉模式下，点击折叠按钮后侧边栏以覆盖层形式展开。

```yaml preview
brick: ai-portal.elevo-sidebar
properties:
  userInstanceId: "user-001"
  behavior: drawer
  logoUrl: "/"
  newChatUrl: "/chat/new"
  historyUrlTemplate: "/chat/{{conversationId}}"
events:
  logout:
    action: "console.log"
```

### With Custom Links and Personal Actions

配置顶部自定义链接和个人账户自定义操作。

```yaml preview
brick: ai-portal.elevo-sidebar
properties:
  userInstanceId: "user-001"
  logoUrl: "/"
  newChatUrl: "/chat/new"
  historyUrlTemplate: "/chat/{{conversationId}}"
  links:
    - title: 工作台
      url: /workbench
      icon:
        lib: antd
        icon: appstore
  myLinks:
    - title: 我的收藏
      url: /favorites
  personalActions:
    - key: profile
      text: 个人资料
      icon:
        lib: antd
        icon: user
    - key: logout
      text: 退出登录
      icon:
        lib: fa
        prefix: fas
        icon: arrow-right-from-bracket
events:
  personal.action.click:
    action: "console.log"
  action.click:
    action: "console.log"
```
