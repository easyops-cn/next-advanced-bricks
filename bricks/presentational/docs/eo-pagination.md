---
tagName: eo-pagination
displayName: WrappedEoPagination
description: 分页
category: navigation
source: "@next-bricks/presentational"
---

# eo-pagination

> 分页

## Props

| 属性            | 类型                | 必填 | 默认值              | 说明                                                              |
| --------------- | ------------------- | ---- | ------------------- | ----------------------------------------------------------------- |
| type            | `"page" \| "token"` | -    | `"page"`            | 分页模式：`page` 为页码模式，`token` 为令牌（游标）模式           |
| total           | `number`            | -    | `0`                 | 数据总数                                                          |
| page            | `number`            | -    | `1`                 | 当前页数                                                          |
| pageSize        | `number`            | -    | `20`                | 每页条数                                                          |
| pageSizeOptions | `number[]`          | -    | `[10, 20, 50, 100]` | 指定每页可以显示多少条                                            |
| showSizeChanger | `boolean`           | -    | `true`              | 是否展示`pageSize`分页器                                          |
| nextToken       | `string`            | -    | -                   | 令牌模式下的下一页令牌（nextToken），有值时"下一页"按钮可点击     |
| previousToken   | `string`            | -    | -                   | 令牌模式下的上一页令牌（previousToken），有值时"上一页"按钮可点击 |

## Events

| 事件   | detail                                                                                                                                              | 说明                   |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| change | `ChangeDetail` — 页码模式下为 `{ page: 当前页码, pageSize: 每页条数 }`；令牌模式下为 `{ type: "token", nextToken: 下一页令牌, pageSize: 每页条数 }` | 页码及每页条数改变事件 |

## Examples

### Basic

基本用法，页码模式下展示分页并监听翻页事件。

```yaml preview
brick: eo-pagination
properties:
  total: 1000
  pageSize: 20
  page: 1
events:
  change:
    - action: console.log
      args:
        - <% EVENT.detail %>
```

### By token

使用令牌（游标）模式进行分页，通过 nextToken 和 previousToken 控制翻页。

```yaml preview
brick: eo-pagination
properties:
  type: token
  pageSize: 20
  nextToken: abc
  previousToken: def
events:
  change:
    - action: console.log
      args:
        - <% EVENT.detail %>
```

### Hide Size Changer

隐藏每页条数选择器。

```yaml preview
brick: eo-pagination
properties:
  total: 500
  pageSize: 10
  page: 1
  showSizeChanger: false
events:
  change:
    - action: console.log
      args:
        - <% EVENT.detail %>
```

### Custom Page Size Options

自定义每页条数选项。

```yaml preview
brick: eo-pagination
properties:
  total: 2000
  pageSize: 25
  page: 1
  pageSizeOptions:
    - 25
    - 50
    - 100
    - 200
events:
  change:
    - action: console.log
      args:
        - <% EVENT.detail %>
```
