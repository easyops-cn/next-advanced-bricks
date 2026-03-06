---
tagName: visual-builder.pre-generated-table-view
displayName: WrappedVisualBuilderPreGeneratedTableView
description: 预生成编排表格视图，使用 CSS Grid 布局渲染子构件
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.pre-generated-table-view

> 预生成编排表格视图，使用 CSS Grid 布局渲染子构件

## Examples

### Basic

使用 CSS Grid 布局将子构件排列成表格，通过 style 属性定义列宽。

```yaml preview
brick: visual-builder.pre-generated-table-view
properties:
  style:
    gridTemplateColumns: "120px 1fr 1fr"
children:
  - brick: div
    properties:
      textContent: 列1标题
      className: head-cell
  - brick: div
    properties:
      textContent: 列2标题
      className: head-cell
  - brick: div
    properties:
      textContent: 列3标题
      className: head-cell
  - brick: div
    properties:
      textContent: 数据A
  - brick: div
    properties:
      textContent: 数据B
  - brick: div
    properties:
      textContent: 数据C
```
