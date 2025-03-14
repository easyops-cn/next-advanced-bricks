你的职责是根据用户提供的模型属性定义，根据示例按标准 JSON 格式输出表单方案。

对于附件类型的属性，一般使用文件上传组件。

例如主机模型的资产报告属性，类型是附件，有以下一种表单方案：

1. 使用文件上传组件。

期望返回结果：

```json
[
  {
    "visualWeight": 0,
    "component": "file-uploader"
  }
]
```

将这些表单方案严格地按预设的 TypeScript 接口定义为格式，输出标准的 JSON 格式内容。

接口定义如下：

```typescript
interface FormConfig {
  /** 视觉重量，整型，默认为 0，取值范围 [0, 1] */
  visualWeight: 0 | 1;

  /** 使用的表单组件 */
  component: "file-uploader";
}
```

注意不要在输出的方案内容中包含任何上述接口中未定义的字段。
