---
tagName: eo-markdown-editor
displayName: WrappedEoMarkdownEditor
description: Markdown 编辑器，基于 Milkdown 实现，支持富文本编辑、表格、代码高亮及图片上传。
category: form-input-advanced
source: "@next-bricks/markdown"
---

# WrappedEoMarkdownEditor

> Markdown 编辑器，基于 Milkdown 实现，支持富文本编辑、表格、代码高亮及图片上传。

## 导入

```tsx
import { WrappedEoMarkdownEditor } from "@easyops/wrapped-components";
```

## Props

| 属性           | 类型                  | 必填 | 默认值 | 说明                                                                                                                       |
| -------------- | --------------------- | ---- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| name           | `string`              | 否   | -      | 字段名称                                                                                                                   |
| label          | `string`              | 否   | -      | 标签文字                                                                                                                   |
| required       | `boolean`             | 否   | -      | 是否必填                                                                                                                   |
| value          | `string`              | 否   | -      | 初始值                                                                                                                     |
| bucketName     | `string`              | 否   | -      | 对象存储桶名字，请在业务编排的时候与后台同学商量创建，一般一个业务需求对应一个存储桶名称。如不传则默认以base64格式转换图片 |
| readonly       | `boolean`             | 否   | -      | 只读模式                                                                                                                   |
| containerStyle | `React.CSSProperties` | 否   | -      | 外层容器样式                                                                                                               |

## Events

| 事件                  | detail                                                | 说明                         |
| --------------------- | ----------------------------------------------------- | ---------------------------- |
| onImageUpload         | `ImageInfo` — { name: 图片文件名, src: 图片存储路径 } | 上传图片时触发的事件         |
| onMarkdownValueChange | `string` — 当前编辑器的 markdown 文本内容             | 编辑 markdown 触发的变化事件 |

## Examples

### Basic

基础 Markdown 编辑器，监听内容变化和图片上传事件。

```tsx
<WrappedEoMarkdownEditor
  value={`# Markdown\n\n> Content.`}
  onMarkdownValueChange={(e) => console.log("change", e.detail)}
  onImageUpload={(e) => console.log("upload", e.detail)}
/>
```

### Table

编辑包含表格的 Markdown 内容，支持表格工具栏操作。

```tsx
<WrappedEoMarkdownEditor
  value={`# Markdown\n\n> Content.\n\n| head1 | head2 | head3 |\n| :---- | :---- | :---- |\n| 1     | 3     | 5     |\n| 2     | 4     | 6     |`}
  onMarkdownValueChange={(e) => console.log("change", e.detail)}
/>
```

### CodeBlock

编辑包含代码块的 Markdown 内容，代码块支持语法高亮。

```tsx
<WrappedEoMarkdownEditor
  value={`# Markdown\n\n> Content.\n\n\`\`\`css\n.table-tooltip-btn-box:hover {\n  background-color: #e8e8e8;\n}\n\`\`\``}
  onMarkdownValueChange={(e) => console.log("change", e.detail)}
/>
```

### Readonly

只读模式，仅展示 Markdown 内容，不可编辑。

```tsx
<WrappedEoMarkdownEditor
  readonly={true}
  value={`# Markdown\n\n> Content.\n\n\`\`\`css\n.table-tooltip-btn-box:hover {\n  background-color: #e8e8e8;\n}\n\`\`\``}
/>
```

### With Form

在表单中使用，支持必填校验和表单提交。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoMarkdownEditor name="markdown" label="markdown" required={true} />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```
