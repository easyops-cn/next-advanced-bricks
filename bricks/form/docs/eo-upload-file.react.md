---
tagName: eo-upload-file
displayName: WrappedEoUploadFile
description: 上传文件
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoUploadFile

> 上传文件

## 导入

```tsx
import { WrappedEoUploadFile } from "@easyops/wrapped-components";
```

## Props

| 属性               | 类型                                  | 必填 | 默认值                                               | 说明                                    |
| ------------------ | ------------------------------------- | ---- | ---------------------------------------------------- | --------------------------------------- |
| label              | `string \| undefined`                 | 否   | -                                                    | 字段说明                                |
| name               | `string \| undefined`                 | 否   | -                                                    | 字段名称                                |
| required           | `boolean \| undefined`                | 否   | -                                                    | 是否必填                                |
| message            | `Record<string, string> \| undefined` | 否   | -                                                    | 校验文本信息                            |
| value              | `FileData[] \| undefined`             | 否   | -                                                    | 值                                      |
| multiple           | `boolean \| undefined`                | 否   | -                                                    | 是否支持多选                            |
| accept             | `string \| undefined`                 | 否   | -                                                    | 接受上传的文件类型，多个之间用 `,` 连接 |
| maxCount           | `number \| undefined`                 | 否   | -                                                    | 最大上传数量                            |
| limitSize          | `number \| undefined`                 | 否   | -                                                    | 上传大小限制(单位为 MB)                 |
| buttonText         | `string \| undefined`                 | 否   | -                                                    | 上传按钮文本                            |
| buttonType         | `ButtonProps["type"] \| undefined`    | 否   | -                                                    | 上传按钮类型                            |
| buttonIcon         | `GeneralIconProps`                    | 是   | `{ lib: "antd", icon: "upload", theme: "outlined" }` | 上传按钮图标                            |
| overMaxCountMode   | `"ignore" \| "replace"`               | 是   | `"replace"`                                          | 超出最大上传数量时文件的保留方式        |
| uploadDraggable    | `boolean \| undefined`                | 否   | -                                                    | 是否可以拖拽上传                        |
| draggableUploadTip | `string \| undefined`                 | 否   | -                                                    | 拖拽上传的提示信息                      |
| autoUpload         | `boolean`                             | 是   | `false`                                              | 是否自动上传                            |
| url                | `string \| undefined`                 | 否   | -                                                    | 自动上传的地址                          |
| method             | `string`                              | 是   | `"POST"`                                             | 自动上传的方法                          |
| uploadName         | `string`                              | 是   | `"file"`                                             | 自动上传的文件参数名                    |
| themeVariant       | `"default" \| "elevo" \| undefined`   | 否   | -                                                    | 主题变体                                |

## Events

| 事件     | detail                                                                                                                                                                   | 说明         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| onChange | `FileData[]` — { uid: 文件唯一标识, name: 文件名, file: 原始 File 对象, response: 上传响应内容, status: 上传状态（uploading \| done \| error）, errors: 错误信息列表 }[] | 值变化时触发 |

## Examples

### Basic

展示上传文件的基本用法，包含按钮文本、类型和图标的自定义。

```tsx
<WrappedEoUploadFile
  buttonText="选择文件"
  buttonType="primary"
  buttonIcon={{ lib: "antd", icon: "paper-clip", theme: "outlined" }}
  accept=".pdf,.docx,.xlsx"
  multiple={true}
  themeVariant="default"
  value={[]}
  onChange={(e) => console.log(e.detail)}
/>
```

### Drag Upload

展示拖拽上传功能，包含最大数量限制、文件大小限制和超出数量时的保留策略。

```tsx
<WrappedEoUploadFile
  style={{ width: "360px" }}
  uploadDraggable={true}
  draggableUploadTip="支持上传最多 3 个文件，每个不超过 10 MB"
  maxCount={3}
  limitSize={10}
  overMaxCountMode="replace"
  multiple={true}
  accept="image/*,.pdf"
  onChange={(e) => console.log(e.detail)}
/>
```

### Auto Upload

展示自动上传功能，文件选择后立即上传到指定服务端地址。

```tsx
<WrappedEoUploadFile
  autoUpload={true}
  url="/api/upload"
  method="POST"
  uploadName="file"
  buttonText="上传到服务器"
  onChange={(e) => console.log(e.detail)}
/>
```

### With Form

在表单中使用上传文件，展示字段名称、说明、必填校验及自定义校验文本。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoUploadFile
    label="附件"
    name="attachment"
    required={true}
    message={{ required: "请上传至少一个文件" }}
    style={{ width: "360px" }}
    uploadDraggable={true}
    draggableUploadTip="支持上传图片"
    maxCount={2}
    multiple={true}
    accept="image/*"
    onChange={(e) => console.log(e.detail)}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```
