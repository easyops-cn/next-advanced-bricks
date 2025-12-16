构件 `ai-portal.space-workbench`

空间工作台构件，用于展示空间的顶部导航栏，包括空间信息、成员管理、消息通知等功能。

## Examples

### 基础使用

```yaml preview
brick: ai-portal.space-workbench
properties:
  spaceDetail:
    name: "产品设计空间"
    instanceId: "space-001"
    description: "这是一个用于产品设计协作的空间"
  notifyCenterUrl: "/notify-center"
  notices:
    - id: "msg-1"
      isRead: false
      type: "project"
      title: "协作流【研发设计】已完成"
    - id: "msg-2"
      isRead: false
      type: "space"
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
    - id: "msg-3"
      type: "account"
      isRead: true
      title: "【项目协作功能】已发布"
  showNoticeBadge: true
events:
  go.back:
    action: console.log
    args:
      - "点击了返回按钮"
  members.click:
    action: console.log
    args:
      - "点击了成员按钮"
  notice.click:
    action: console.log
    args:
      - "点击了消息："
      - "<% EVENT.detail %>"
  mark.all.read:
    action: console.log
    args:
      - "点击了全部已读"
  space.edit:
    action: console.log
    args:
      - "点击了编辑空间"
```

### 无消息通知

```yaml preview
brick: ai-portal.space-workbench
properties:
  spaceDetail:
    name: "研发协作空间"
    instanceId: "space-002"
    description: "研发团队的协作空间"
  notifyCenterUrl: "/notify-center"
  notices: []
events:
  go.back:
    action: console.log
    args:
      - "返回"
  members.click:
    action: console.log
    args:
      - "查看成员"
  space.edit:
    action: console.log
    args:
      - "编辑空间"
```
