---
tagName: advanced.pdf-viewer
displayName: WrappedAdvancedPdfViewer
description: PDF 文件预览器，支持分页跳转和关键字高亮搜索
category: display
source: "@next-bricks/advanced"
---

# advanced.pdf-viewer

> PDF 文件预览器，支持分页跳转和关键字高亮搜索

## Props

| 属性        | 类型            | 必填 | 默认值 | 说明                                                             |
| ----------- | --------------- | ---- | ------ | ---------------------------------------------------------------- |
| url         | `string`        | 是   | -      | PDF 文件的访问地址                                               |
| page        | `number`        | 否   | -      | 初始显示的页码（从 1 开始），内部会自动转换为从 0 开始的索引     |
| search      | `string`        | 否   | -      | 文档加载后自动高亮的搜索关键字                                   |
| viewerStyle | `CSSProperties` | 否   | -      | 查看器容器的内联样式，常用于设置高度（如 `{ height: "500px" }`） |

## Examples

### Basic

展示 PDF 文件预览的基本用法，通过 url 指定 PDF 地址并设置查看器高度。

```yaml preview
brick: advanced.pdf-viewer
properties:
  url: https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf
  viewerStyle:
    height: 500px
```

### Jump to Page

通过 page 属性指定 PDF 打开后跳转到的初始页码。

```yaml preview
brick: advanced.pdf-viewer
properties:
  url: https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf
  page: 3
  viewerStyle:
    height: 500px
```

### Keyword Search

通过 search 属性在文档加载后自动高亮指定关键字。

```yaml preview
brick: advanced.pdf-viewer
properties:
  url: https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf
  search: JavaScript
  viewerStyle:
    height: 500px
```
