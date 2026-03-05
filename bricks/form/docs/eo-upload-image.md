---
tagName: eo-upload-image
displayName: WrappedEoUploadImage
description: 上传图片构件
category: form-input-basic
source: "@next-bricks/form"
---

# eo-upload-image

> 上传图片构件

## Props

| 属性         | 类型                                  | 必填 | 默认值 | 说明                    |
| ------------ | ------------------------------------- | ---- | ------ | ----------------------- |
| name         | `string \| undefined`                 | 否   | -      | 字段名称                |
| label        | `string \| undefined`                 | 否   | -      | 字段说明                |
| value        | `ImageData[] \| undefined`            | 否   | -      | 值                      |
| bucketName   | `string`                              | 是   | -      | 对象存储桶名字          |
| maxCount     | `number \| undefined`                 | 否   | -      | 最大上传数量            |
| multiple     | `boolean \| undefined`                | 否   | -      | 是否支持选定的多张图片  |
| limitSize    | `number \| undefined`                 | 否   | -      | 上传大小限制(单位为 MB) |
| required     | `boolean \| undefined`                | 否   | -      | 是否必填                |
| message      | `Record<string, string> \| undefined` | 否   | -      | 校验文本信息            |
| variant      | `"default" \| "avatar" \| undefined`  | 否   | -      | 变体                    |
| themeVariant | `"default" \| "elevo" \| undefined`   | 否   | -      | 主题变体                |

## Events

| 事件   | detail                                                                                                                                                                                   | 说明         |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| change | `ImageData[]` — { uid: 文件唯一标识, name: 文件名, url: 图片地址, file: 原始 File 对象, response: 上传响应内容, status: 上传状态（uploading \| done \| error）, errors: 错误信息列表 }[] | 值变化时触发 |

## Examples

### Basic

展示上传图片的基本用法，支持多选并限制最大上传数量。

```yaml preview
- brick: eo-upload-image
  properties:
    bucketName: my-bucket
    multiple: true
    maxCount: 5
    themeVariant: default
    value: []
  events:
    change:
      - action: console.log
        args:
          - <% EVENT.detail %>
```

### Avatar

使用头像变体上传单张图片，并限制文件大小。

```yaml preview
- brick: eo-upload-image
  properties:
    bucketName: my-bucket
    variant: avatar
    limitSize: 2
  events:
    change:
      - action: console.log
        args:
          - <% EVENT.detail %>
```

### With Form

在表单中使用上传图片，展示字段名称、说明、必填校验及自定义校验文本。

```yaml preview
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-upload-image
      properties:
        label: 图片
        name: image
        required: true
        message:
          required: 请上传至少一张图片
        bucketName: my-bucket
        multiple: true
        maxCount: 3
      events:
        change:
          - action: console.log
            args:
              - <% EVENT.detail %>
    - brick: eo-submit-buttons
```
