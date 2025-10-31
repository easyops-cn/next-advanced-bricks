构件 `ai-portal.notice-dropdown`

消息通知下拉框构件，用于展示消息列表。支持自定义触发器、消息列表展示、空状态、以及交互事件。

## Examples

### 基础使用（带消息列表）

```yaml preview
brick: ai-portal.notice-dropdown
properties:
  dataSource:
    - id: "msg-1"
      isRead: false
      type: "project"
      title: "协作流【研发设计】已完成【项目协作功能】已发布【项目协作功能】已发布【项目协作功能】已发布【项目协作功能】已发布"
    - id: "msg-2"
      isRead: false
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
      type: "space"
    - id: "msg-3"
      type: "account"
      isRead: true
      title: "【项目协作功能】已发布"
    - id: "msg-4"
      type: "system"
      isRead: true
      title: "Samuel在项目【项目A】@了你"
    - id: "msg-2"
      type: "account"
      isRead: false
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
    - id: "msg-3"
      type: "system"
      isRead: true
      title: "【项目协作功能】已发布"
    - id: "msg-4"
      type: "project"
      isRead: true
      title: "Samuel在项目【项目A】@了你"
    - id: "msg-2"
      type: "space"
      isRead: false
      title: "协作流【协作流名称】 - 【活动名称】需要人工确认"
    - id: "msg-3"
      type: "space"
      isRead: true
      title: "【项目协作功能】已发布"
    - id: "msg-4"
      type: "system"
      isRead: true
      title: "Samuel在项目【项目A】@了你"

events:
  notice.click:
    action: console.log
    args:
      - "点击了消息："
      - "<% EVENT.detail %>"
  mark.all.read:
    action: console.log
    args:
      - "点击了全部已读"
```

### 空状态

```yaml preview
brick: ai-portal.notice-dropdown
properties:
  dataSource: []
```

### 自定义触发器（使用 eo-button）

```yaml preview
brick: ai-portal.notice-dropdown
properties:
  dataSource:
    - id: "msg-1"
      isRead: false
      type: "project"
      title: "协作流【研发设计】已完成"
    - id: "msg-2"
      isRead: false
      type: "space"
      title: "协作流【协作流名称】需要人工确认"
    - id: "msg-3"
      type: "account"
      isRead: true
      title: "【项目协作功能】已发布"
children:
  - brick: eo-button
    slot: trigger
    properties:
      type: primary
      icon:
        lib: "antd"
        icon: "bell"
      textContent: "查看通知"
```
