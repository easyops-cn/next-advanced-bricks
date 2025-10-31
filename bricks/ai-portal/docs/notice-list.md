构件 `ai-portal.notice-list`

消息通知列表构件，支持批量操作功能。

## Examples

### Basic

基础用法，展示消息列表。

```yaml preview
brick: ai-portal.notice-list
properties:
  dataSource:
    - id: "1"
      type: "project"
      isRead: true
      title: "协作流【研发设计】已完成"
      time: 1761207261887
    - id: "2"
      type: "account"
      isRead: true
      title: "您的账户资源配额即将达到限制"
      time: 1761812267887
    - id: "3"
      type: "system"
      isRead: false
      title: "服务通知：服务维护"
      time: 1761818247887
    - id: "4"
      type: "space"
      isRead: false
      title: "Luna 在项目【系统资源收集】中@了你"
      time: 1761820851887
    - id: "5"
      type: "project"
      isRead: false
      title: "协作流【设计规范】已完成"
      time: 1761821891887
events:
  notice.click:
    - action: console.log
      args:
        - "消息点击:"
        - <% EVENT.detail %>
  mark.items.read:
    - action: console.log
      args:
        - "消息已读:"
        - <% EVENT.detail %>
  mark.all.read:
    - action: console.log
      args:
        - "全部已读"
```

### Empty State

空状态展示，可以自定义空状态文案。

```yaml preview
brick: ai-portal.notice-list
properties:
  dataSource: []
  emptyText: "暂无新消息通知"
```
