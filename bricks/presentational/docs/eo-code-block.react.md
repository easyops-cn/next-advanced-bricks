---
tagName: eo-code-block
displayName: WrappedEoCodeBlock
description: 代码块展示构件，基于 Shiki 进行语法高亮，支持多种编程语言、亮色/暗色主题自动切换及复制功能。
category: presentational
source: "@next-bricks/presentational"
---

# WrappedEoCodeBlock

> 代码块展示构件，基于 Shiki 进行语法高亮，支持多种编程语言、亮色/暗色主题自动切换及复制功能。

## 导入

```tsx
import { WrappedEoCodeBlock } from "@easyops/wrapped-components";
```

## Props

| 属性           | 类型                                    | 必填 | 默认值   | 说明                                                           |
| -------------- | --------------------------------------- | ---- | -------- | -------------------------------------------------------------- |
| language       | `string`                                | 否   | -        | 代码语言，用于语法高亮，例如 `javascript`、`python`、`yaml` 等 |
| source         | `string`                                | 否   | -        | 代码内容字符串                                                 |
| theme          | `"auto" \| "light-plus" \| "dark-plus"` | 否   | `"auto"` | 代码高亮主题。`auto` 跟随系统主题自动切换亮色/暗色             |
| themeVariant   | `"default" \| "elevo"`                  | 否   | -        | 主题变体，影响代码块的整体样式风格                             |
| showCopyButton | `boolean`                               | 否   | `true`   | 是否展示复制按钮                                               |

## CSS Parts

| 名称    | 说明                        |
| ------- | --------------------------- |
| pre     | 包裹代码内容的 `<pre>` 元素 |
| copy    | 复制按钮                    |
| mermaid | Mermaid 图表                |
| wrapper | code-wrapper 构件           |

## Examples

### Basic

展示代码块的基本用法，通过 `language` 和 `source` 属性渲染带语法高亮的代码。

```tsx
<WrappedEoCodeBlock
  language="javascript"
  source={`function greet(name) {
  console.log("Hello, " + name + "!");
}
greet("world");`}
/>
```

### Multiple Languages

展示对不同编程语言的语法高亮支持，包括 Python、YAML 和 Shell。

```tsx
<>
  <WrappedEoCodeBlock
    language="python"
    source={`def greet(name):
    print(f"Hello, {name}!")

greet("world")`}
  />
  <WrappedEoCodeBlock
    language="yaml"
    source={`name: Alice
age: 30
hobbies:
  - reading
  - coding`}
  />
  <WrappedEoCodeBlock
    language="shell"
    source={`echo "Hello, world!"
ls -la /tmp`}
  />
</>
```

### Theme

通过 `theme` 属性指定代码高亮主题，支持 `light-plus`（亮色）、`dark-plus`（暗色）和 `auto`（跟随系统）。

```tsx
<>
  <WrappedEoCodeBlock
    language="javascript"
    theme="light-plus"
    source={`const x = 42;
console.log(x);`}
  />
  <WrappedEoCodeBlock
    language="javascript"
    theme="dark-plus"
    source={`const x = 42;
console.log(x);`}
  />
</>
```

### Theme Variant Elevo

设置 `themeVariant` 为 `elevo` 以使用 Elevo 风格的代码块样式。

```tsx
<WrappedEoCodeBlock
  language="javascript"
  themeVariant="elevo"
  source={`const greet = (name) => {
  return \`Hello, \${name}!\`;
};
console.log(greet("world"));`}
/>
```

### Hide Copy Button

设置 `showCopyButton` 为 `false` 隐藏复制按钮。

```tsx
<WrappedEoCodeBlock
  language="python"
  showCopyButton={false}
  source={`for i in range(10):
    print(i)`}
/>
```

### CSS Parts

通过 CSS Parts 自定义代码块样式，例如为 `pre` 部分设置圆角和边框，为 `copy` 按钮设置颜色。

```tsx
<WrappedEoCodeBlock
  language="typescript"
  style={{ "--part-pre-border-radius": "8px" } as React.CSSProperties}
  source={`interface User {
  name: string;
  age: number;
}
const user: User = { name: "Alice", age: 30 };`}
/>
```
