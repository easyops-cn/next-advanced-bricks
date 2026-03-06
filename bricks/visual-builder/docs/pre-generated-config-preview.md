---
tagName: visual-builder.pre-generated-config-preview
displayName: WrappedVisualBuilderPreGeneratedConfigPreview
description: AI 预生成配置预览构件，在 iframe 中将属性列表渲染为表格或描述列表，用于直观展示配置结果
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.pre-generated-config-preview

> AI 预生成配置预览构件，在 iframe 中将属性列表渲染为表格或描述列表，用于直观展示配置结果

## Props

| 属性       | 类型                        | 必填 | 默认值 | 说明                                                                        |
| ---------- | --------------------------- | ---- | ------ | --------------------------------------------------------------------------- |
| previewUrl | `string`                    | 否   | -      | 预览 iframe 的地址，默认使用内置预览地址                                    |
| container  | `"table" \| "descriptions"` | 否   | -      | 容器类型，"table" 渲染为表格，"descriptions" 渲染为描述列表，默认为 "table" |
| attrList   | `ObjectAttr[]`              | 否   | -      | 属性列表，每项包含 id、name，以及可选的可视化配置                           |
| mockList   | `Record<string, unknown>[]` | 否   | -      | 模拟数据列表，用于填充预览中的真实数据                                      |

## Examples

### Table Preview

以表格形式预览属性列表配置。

```yaml preview
brick: visual-builder.pre-generated-config-preview
properties:
  container: table
  attrList:
    - id: name
      name: 名称
    - id: ip
      name: IP 地址
    - id: status
      name: 运营状态
    - id: createTime
      name: 创建时间
  mockList:
    - name: 主机-001
      ip: "192.168.1.1"
      status: 运行中
      createTime: "2024-01-01"
    - name: 主机-002
      ip: "192.168.1.2"
      status: 已停止
      createTime: "2024-01-02"
```

### Descriptions Preview

以描述列表形式预览属性配置，适合展示单条记录的详细信息。

```yaml preview
brick: visual-builder.pre-generated-config-preview
properties:
  container: descriptions
  attrList:
    - id: name
      name: 名称
    - id: ip
      name: IP 地址
    - id: status
      name: 运营状态
    - id: createTime
      name: 创建时间
  mockList:
    - name: 主机-001
      ip: "192.168.1.1"
      status: 运行中
      createTime: "2024-01-01"
```
