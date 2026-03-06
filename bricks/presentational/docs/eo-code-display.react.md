---
tagName: eo-code-display
displayName: WrappedEoCodeDisplay
description: 代码展示
category: display-component
source: "@next-bricks/presentational"
---

# WrappedEoCodeDisplay

> 代码展示

## 导入

```tsx
import { WrappedEoCodeDisplay } from "@easyops/wrapped-components";
```

## Props

| 属性             | 类型      | 必填 | 默认值 | 说明                                                                           |
| ---------------- | --------- | ---- | ------ | ------------------------------------------------------------------------------ |
| value            | `string`  | -    | `""`   | 代码内容                                                                       |
| language         | `string`  | -    | -      | 语言，具体查阅 [Supported languages](https://prismjs.com/#supported-languages) |
| hideLineNumber   | `boolean` | -    | -      | 是否隐藏行号                                                                   |
| maxLines         | `number`  | -    | -      | 最大行数                                                                       |
| minLines         | `number`  | -    | -      | 最小行数                                                                       |
| showCopyButton   | `boolean` | -    | `true` | 是否显示复制按钮                                                               |
| showExportButton | `boolean` | -    | -      | 是否显示导出按钮                                                               |
| exportFileName   | `string`  | -    | -      | 导出的文件名                                                                   |

## Examples

### Basic

基本用法，展示一段 JavaScript 代码并显示行号。

```tsx
<WrappedEoCodeDisplay
  language="javascript"
  value={`function onSubmit (e) {
  const fn = () => 123;
  const job = {
    title: 'Developer',
    company: 'Facebook'
  };
}`}
/>
```

### 隐藏行号

隐藏代码行号显示。

```tsx
<WrappedEoCodeDisplay
  language="javascript"
  hideLineNumber={true}
  value={`const greeting = "Hello, World!";
console.log(greeting);`}
/>
```

### 限制行数

通过 maxLines 和 minLines 控制代码展示区域的行数范围。

```tsx
<WrappedEoCodeDisplay
  language="javascript"
  maxLines={5}
  minLines={3}
  value={`const a = 1;
const b = 2;
const c = 3;
const d = 4;
const e = 5;
const f = 6;
const g = 7;
const h = 8;`}
/>
```

### 工具栏按钮

显示复制和导出按钮，支持将代码复制到剪贴板或导出为文件。

```tsx
<WrappedEoCodeDisplay
  language="json"
  showCopyButton={true}
  showExportButton={true}
  exportFileName="config.json"
  value={`{
  "name": "my-app",
  "version": "1.0.0",
  "description": "A sample application"
}`}
/>
```

### 隐藏复制按钮

将 showCopyButton 设置为 false 隐藏默认的复制按钮。

```tsx
<WrappedEoCodeDisplay
  language="css"
  showCopyButton={false}
  value={`.container {
  display: flex;
  justify-content: center;
  align-items: center;
}`}
/>
```
