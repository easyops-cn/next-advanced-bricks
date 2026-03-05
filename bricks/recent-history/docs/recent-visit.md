---
tagName: recent-history.recent-visit
displayName: WrappedRecentHistoryRecentVisit
description: 最近访问
category: ""
source: "@next-bricks/recent-history"
---

# recent-history.recent-visit

> 最近访问

## Props

| 属性        | 类型       | 必填 | 默认值 | 说明                                  |
| ----------- | ---------- | ---- | ------ | ------------------------------------- |
| namespace   | `string`   | 是   | -      | 命名空间                              |
| capacity    | `number`   | 否   | -      | 最近访问数量                          |
| compareKeys | `string[]` | 否   | -      | 设置后不在该列表内的数据会被剔除      |
| urlTemplate | `string`   | 否   | -      | 点击标签跳转的 url 链接，支持模版变量 |

## Examples

### Basic

展示最近访问记录，通过按钮添加历史记录后自动更新列表。

```yaml preview gap
- brick: eo-button
  properties:
    textContent: Add history
  events:
    click:
      - useProvider: recent-history.push-history
        args:
          - playground
          - 5
          - key: <% _.uniqueId("playground-") %>
            name: <% _.uniqueId("playground-name") %>
- brick: recent-history.recent-visit
  properties:
    namespace: playground
    capacity: 5
```

### With URL Template

配置点击跳转链接，支持使用模版变量引用记录的字段值。

```yaml preview gap
- brick: eo-button
  properties:
    textContent: 添加访问记录
  events:
    click:
      - useProvider: recent-history.push-history
        args:
          - my-app
          - 10
          - key: <% _.uniqueId("item-") %>
            name: <% "应用-" + _.uniqueId() %>
            id: <% _.uniqueId("app-") %>
- brick: recent-history.recent-visit
  properties:
    namespace: my-app
    capacity: 10
    urlTemplate: "/next/app/{{id}}"
```

### With Compare Keys

设置 compareKeys 后，只展示 compareKeys 中包含的 key 对应的访问记录。

```yaml preview gap
- brick: eo-button
  properties:
    textContent: 添加访问记录
  events:
    click:
      - useProvider: recent-history.push-history
        args:
          - filtered-ns
          - 5
          - key: <% _.uniqueId("key-") %>
            name: <% "记录-" + _.uniqueId() %>
- brick: recent-history.recent-visit
  properties:
    namespace: filtered-ns
    capacity: 5
    compareKeys:
      - key-1
      - key-2
      - key-3
```
