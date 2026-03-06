---
tagName: presentational.code-wrapper
displayName: WrappedPresentationalCodeWrapper
description: 代码内容包裹容器，提供统一的代码展示结构并支持一键复制功能。
category: ""
source: "@next-bricks/presentational"
---

# WrappedPresentationalCodeWrapper

> 代码内容包裹容器，提供统一的代码展示结构并支持一键复制功能。

## 导入

```tsx
import { WrappedPresentationalCodeWrapper } from "@easyops/wrapped-components";
```

## Props

| 属性           | 类型                                                    | 必填 | 默认值 | 说明                                                              |
| -------------- | ------------------------------------------------------- | ---- | ------ | ----------------------------------------------------------------- |
| preProps       | `React.PropsWithChildren<JSX.IntrinsicElements["pre"]>` | 否   | -      | 传递给 `<pre>` 元素的额外属性，例如 `className`、`style` 等       |
| showCopyButton | `boolean`                                               | 否   | `true` | 是否展示复制按钮                                                  |
| themeVariant   | `"default" \| "elevo"`                                  | 否   | -      | 主题变体，影响复制按钮等内部元素的样式风格。`elevo` 为 Elevo 风格 |

## CSS Parts

| 名称 | 说明                        |
| ---- | --------------------------- |
| pre  | 包裹代码内容的 `<pre>` 元素 |
| copy | 复制按钮                    |

## Examples

### Basic

展示代码包裹容器的基本用法，将代码内容放入 `<code>` 子节点，默认展示复制按钮。

```tsx
<WrappedPresentationalCodeWrapper
  preProps={{ children: <code>{"const greeting = 'Hello, World!';"}</code> }}
/>
```

### 隐藏复制按钮

设置 `showCopyButton` 为 `false` 可隐藏右上角的复制按钮。

```tsx
<WrappedPresentationalCodeWrapper
  showCopyButton={false}
  preProps={{ children: <code>{"const greeting = 'Hello, World!';"}</code> }}
/>
```

### Elevo 主题变体

设置 `themeVariant` 为 `"elevo"` 使复制按钮采用 Elevo 主题样式。

```tsx
<WrappedPresentationalCodeWrapper
  themeVariant="elevo"
  preProps={{ children: <code>{"const greeting = 'Hello, World!';"}</code> }}
/>
```

### 自定义 pre 元素样式

通过 `preProps` 的 `style` 字段为 `<pre>` 元素设置自定义内联样式。

```tsx
<WrappedPresentationalCodeWrapper
  preProps={{
    style: {
      background: "#1e1e1e",
      color: "#d4d4d4",
      padding: "16px",
      borderRadius: "8px",
    },
    children: <code>{"const greeting = 'Hello, World!';"}</code>,
  }}
/>
```

### 自定义 CSS Parts

通过 `pre` 和 `copy` CSS Parts 对内部元素进行样式定制，例如修改 `<pre>` 背景色和圆角、调整复制按钮颜色。

```tsx
<WrappedPresentationalCodeWrapper
  style={
    {
      "--part-pre-border-radius": "8px",
      "--part-copy-color": "var(--color-brand)",
    } as React.CSSProperties
  }
  preProps={{ children: <code>{"const greeting = 'Hello, World!';"}</code> }}
/>
```
