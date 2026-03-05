---
tagName: nav.query-search
displayName: WrappedNavQuerySearch
description: 综合搜索入口，支持全文检索、IP 搜索、工单搜索等多种查询模式，带搜索历史记录功能
category: ""
source: "@next-bricks/nav"
---

# WrappedNavQuerySearch

> 综合搜索入口，支持全文检索、IP 搜索、工单搜索等多种查询模式，带搜索历史记录功能

## 导入

```tsx
import { WrappedNavQuerySearch } from "@easyops/wrapped-components";
```

## Examples

### Basic

在导航栏右侧嵌入综合搜索入口，点击搜索图标展开输入框，支持切换查询类型和显示搜索历史。

```tsx
<div style={{ display: "flex", justifyContent: "space-between" }}>
  <div style={{ background: "red", width: "100px" }} />
  <div style={{ display: "flex" }}>
    <WrappedNavQuerySearch />
    <WrappedEoButton>通知</WrappedEoButton>
    <WrappedEoButton>告警</WrappedEoButton>
  </div>
</div>
```
