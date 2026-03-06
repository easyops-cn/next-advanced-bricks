---
tagName: nav.query-search
displayName: WrappedNavQuerySearch
description: 综合搜索入口，支持全文检索、IP 搜索、工单搜索等多种查询模式，带搜索历史记录功能
category: ""
source: "@next-bricks/nav"
---

# nav.query-search

> 综合搜索入口，支持全文检索、IP 搜索、工单搜索等多种查询模式，带搜索历史记录功能

## Examples

### Basic

在导航栏右侧嵌入综合搜索入口，点击搜索图标展开输入框，支持切换查询类型和显示搜索历史。

```yaml preview
brick: div
properties:
  style:
    display: flex
    justify-content: space-between
children:
  - brick: div
    properties:
      style:
        background: red
        width: 100px
  - brick: div
    properties:
      style:
        display: flex
    children:
      - brick: nav.query-search
      - brick: eo-button
        properties:
          textContent: 通知
      - brick: eo-button
        properties:
          textContent: 告警
```
