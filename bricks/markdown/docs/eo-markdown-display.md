用于展示 markdown 内容的构件。

## Examples

### Basic

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
