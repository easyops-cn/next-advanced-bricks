---
tagName: eo-markdown-display
displayName: WrappedEoMarkdownDisplay
description: 用于展示 markdown 内容的构件。
category: ""
source: "@next-bricks/markdown"
---

# WrappedEoMarkdownDisplay

> 用于展示 markdown 内容的构件。

## 导入

```tsx
import { WrappedEoMarkdownDisplay } from "@easyops/wrapped-components";
```

## Props

| 属性         | 类型                   | 必填 | 默认值 | 说明              |
| ------------ | ---------------------- | ---- | ------ | ----------------- |
| content      | `string`               | 否   | -      | Markdown 文本内容 |
| themeVariant | `"default" \| "elevo"` | 否   | -      | 主题变体          |

## Examples

### Basic

展示丰富的 Markdown 内容，包括标题、列表、链接、图片、代码块等。

```tsx
<WrappedEoMarkdownDisplay
  content={`# Heading

Sub-heading
-----------

Paragraphs are separated by a blank line.

Text attributes _italic_, **bold**, \`monospace\`.

Horizontal rule:

---

Bullet lists nested within numbered list:

1. fruits
    * apple
    * banana
2. vegetables
    - carrot
    - broccoli

A [link](http://example.com).

> Markdown uses email-style characters for blockquoting.

\`\`\`js
function test() {
  alert("Hello");
}
\`\`\`
`}
/>
```

### Elevo Theme

使用 elevo 主题变体展示 Markdown 内容。

```tsx
<WrappedEoMarkdownDisplay
  themeVariant="elevo"
  content={`# Elevo Theme

This is a paragraph with **bold** and _italic_ text.

- Item 1
- Item 2
- Item 3

> A blockquote example.
`}
/>
```
