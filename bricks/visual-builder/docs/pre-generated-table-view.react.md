---
tagName: visual-builder.pre-generated-table-view
displayName: WrappedVisualBuilderPreGeneratedTableView
description: 预生成编排表格视图，使用 CSS Grid 布局渲染子构件
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderPreGeneratedTableView

> 预生成编排表格视图，使用 CSS Grid 布局渲染子构件

## 导入

```tsx
import { WrappedVisualBuilderPreGeneratedTableView } from "@easyops/wrapped-components";
```

## Examples

### Basic

使用 CSS Grid 布局将子构件排列成表格，通过 style 属性定义列宽。

```tsx
<WrappedVisualBuilderPreGeneratedTableView
  style={{ gridTemplateColumns: "120px 1fr 1fr" }}
>
  <div className="head-cell">列1标题</div>
  <div className="head-cell">列2标题</div>
  <div className="head-cell">列3标题</div>
  <div>数据A</div>
  <div>数据B</div>
  <div>数据C</div>
</WrappedVisualBuilderPreGeneratedTableView>
```
