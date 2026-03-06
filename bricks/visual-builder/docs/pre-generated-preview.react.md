---
tagName: visual-builder.pre-generated-preview
displayName: WrappedVisualBuilderPreGeneratedPreview
description: 预生成编排预览，在 iframe 中渲染属性生成结果的对比表格
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderPreGeneratedPreview

> 预生成编排预览，在 iframe 中渲染属性生成结果的对比表格

## 导入

```tsx
import { WrappedVisualBuilderPreGeneratedPreview } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型                                                                                        | 必填 | 默认值    | 说明                             |
| ----------- | ------------------------------------------------------------------------------------------- | ---- | --------- | -------------------------------- |
| generations | `AttributeGeneration[]`                                                                     | 否   | -         | 属性生成数据列表                 |
| category    | `"detail-item" \| "form-item" \| "table-column" \| "card-item" \| "metric-item" \| "value"` | 否   | `"value"` | 预览分类，影响数据容器的渲染方式 |
| theme       | `string`                                                                                    | 否   | -         | 预览主题                         |
| uiVersion   | `string`                                                                                    | 否   | -         | UI 版本                          |
| app         | `MicroApp`                                                                                  | 否   | -         | 微应用信息                       |

## Examples

### Basic

展示属性生成编排的对比表格预览，按展示等级分列渲染不同视觉重量的编排。

```tsx
<WrappedVisualBuilderPreGeneratedPreview
  theme="light"
  uiVersion="8.2"
  category="detail-item"
  generations={[
    {
      instanceId: "abc001",
      objectId: "HOST",
      propertyId: "hostname",
      propertyName: "主机名",
      displayLevel: 0,
      rwType: "string",
      category: "detail-item",
      mockData: ["server-01", "web-server-02"],
      storyboard: {
        brick: "span",
        properties: { textContent: "<% DATA.hostname %>" },
      },
    },
  ]}
/>
```

### Form Item 预览

以表单项模式预览生成的编排，适用于表单输入场景。

```tsx
<WrappedVisualBuilderPreGeneratedPreview
  theme="light"
  uiVersion="8.2"
  category="form-item"
  generations={[
    {
      instanceId: "abc002",
      objectId: "HOST",
      propertyId: "status",
      propertyName: "状态",
      displayLevel: 1,
      rwType: "enum",
      category: "form-item",
      mockData: ["running", "stopped"],
      storyboard: {
        brick: "eo-select",
        properties: {
          name: "status",
          label: "状态",
          options: [
            { label: "运行中", value: "running" },
            { label: "已停止", value: "stopped" },
          ],
        },
      },
    },
  ]}
/>
```
