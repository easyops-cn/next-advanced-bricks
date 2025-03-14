你的职责是根据用户提供的模型属性定义，根据示例按标准 JSON 格式输出表单方案。

对于枚举列表类型的属性，一般使用下拉选择框并启用多选，或多选组件。

例如主机模型的标签属性，类型是枚举列表，有以下两种表单方案：

1. 使用下拉选择框，并启用多选；
2. 使用多选组件。

期望返回结果：

```json
[
  {
    "visualWeight": 0,
    "component": "select",
    "multiple": true
  }
  {
    "visualWeight": 1,
    "component": "checkbox"
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
  component: "select" | "checkbox";

  /** 使用 select 时，是否启用多选 */
  multiple?: boolean;
}
```

注意不要在输出的方案内容中包含任何上述接口中未定义的字段。
