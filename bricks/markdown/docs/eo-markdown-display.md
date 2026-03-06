---
tagName: eo-markdown-display
displayName: WrappedEoMarkdownDisplay
description: 用于展示 markdown 内容的构件。
category: ""
source: "@next-bricks/markdown"
---

# eo-markdown-display

> 用于展示 markdown 内容的构件。

## Props

| 属性         | 类型                   | 必填 | 默认值 | 说明              |
| ------------ | ---------------------- | ---- | ------ | ----------------- |
| content      | `string`               | 否   | -      | Markdown 文本内容 |
| themeVariant | `"default" \| "elevo"` | 否   | -      | 主题变体          |

## Examples

### Basic

展示丰富的 Markdown 内容，包括标题、列表、链接、图片、代码块等。

````yaml preview
brick: eo-markdown-display
properties:
  content: |
    Heading
    =======

    Sub-heading
    -----------

    # Alternative heading

    ## Alternative sub-heading

    Paragraphs are separated
    by a blank line.

    Two spaces at the end of a line
    produce a line break.

    Text attributes _italic_, **bold**, `monospace`.

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

    ![Image](https://upload.wikimedia.org/wikipedia/commons/5/5c/Icon-pictures.png "icon")

    > Markdown uses email-style
    characters for blockquoting.
    >
    > Multiple paragraphs need to be prepended individually.

    Most inline <abbr title="Hypertext Markup Language">HTML</abbr> tags are supported.

    Here is a `javascript` code below:

    ```js
    function test() {
      alert("Hello");
    }
    ```

    ```mermaid
    graph TD
      A[Enter Chart Definition] --> B(Preview)
      B --> C{decide}
      C --> D[Keep]
      C --> E[Edit Definition]
      E --> B
      D --> F[Save Image and Code]
      F --> B
    ```
````

### Elevo Theme

使用 elevo 主题变体展示 Markdown 内容。

```yaml preview
brick: eo-markdown-display
properties:
  themeVariant: elevo
  content: |
    # Elevo Theme

    This is a paragraph with **bold** and _italic_ text.

    - Item 1
    - Item 2
    - Item 3

    > A blockquote example.
```
