构件 `ai-portal.chat-history`

## Examples

### Basic

```yaml preview
brick: ai-portal.chat-history
properties:
  list:
    - id: task_x
      title: 纳管 X 系统
      startTime: <% (+moment()) / 1000 %>
      state: working
    - id: task_y
      title: 纳管 Y 系统
      startTime: <% (+moment().subtract(2, "hours")) / 1000 %>
      state: completed
    - id: task_z
      title: 纳管 Z 系统
      startTime: <% (+moment().subtract(1, "days")) / 1000 %>
      state: completed
  actions:
    - icon:
        lib: antd
        icon: upload
      text: 分享
      isDropdown: true
      event: share
    - icon:
        lib: antd
        icon: edit
      text: 重命名
      isDropdown: true
      event: rename
    - icon:
        lib: antd
        icon: delete
      text: 删除
      isDropdown: true
      danger: true
      event: delete
events:
  action.click:
    - action: console.log
    - if: <% EVENT.detail.action.event === "delete" %>
      useProvider: basic.show-dialog
      args:
        - type: delete
          title: 确定删除这一条任务记录吗？
          content: 删除后任务记录无法恢复，请谨慎操作
```
