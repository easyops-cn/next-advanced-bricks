---
tagName: eo-tree-select
displayName: WrappedEoTreeSelect
description: 树选择器，支持从树形数据中单选或多选节点
category: form-input-basic
source: "@next-bricks/advanced"
---

# WrappedEoTreeSelect

> 树选择器，支持从树形数据中单选或多选节点

## 导入

```tsx
import { WrappedEoTreeSelect } from "@easyops/wrapped-components";
```

## Props

| 属性                  | 类型                                    | 必填 | 默认值         | 说明                                                          |
| --------------------- | --------------------------------------- | ---- | -------------- | ------------------------------------------------------------- |
| name                  | `string`                                | 否   | -              | 表单字段名                                                    |
| label                 | `string`                                | 否   | -              | 表单字段标签                                                  |
| required              | `boolean`                               | 否   | -              | 是否为必填项                                                  |
| treeData              | `AntdTreeSelectProps["treeData"]`       | 否   | -              | 树形数据源                                                    |
| treeDefaultExpandAll  | `boolean`                               | 否   | -              | 是否默认展开所有树节点                                        |
| treeExpandedKeys      | `string[]`                              | 否   | -              | 受控展开的树节点 key 集合                                     |
| fieldNames            | `AntdTreeSelectProps["fieldNames"]`     | 否   | -              | 自定义字段名，指定 label、value、children 对应的字段          |
| value                 | `AntdTreeSelectProps["value"]`          | 否   | -              | 当前选中的值                                                  |
| placeholder           | `string`                                | 否   | -              | 输入框占位文本                                                |
| multiple              | `boolean`                               | 否   | -              | 是否支持多选                                                  |
| disabled              | `boolean`                               | 否   | -              | 是否禁用                                                      |
| checkable             | `boolean`                               | 否   | -              | 是否支持勾选树节点（开启后自动开启 multiple 模式）            |
| allowClear            | `boolean`                               | 否   | `true`         | 是否支持清除                                                  |
| loading               | `boolean`                               | 否   | `false`        | 是否显示加载中状态                                            |
| filterTreeNode        | `AntdTreeSelectProps["filterTreeNode"]` | 否   | -              | 自定义树节点过滤函数                                          |
| showSearch            | `boolean`                               | 否   | `true`         | 是否支持搜索，开启后可通过输入关键字过滤树节点                |
| suffixIcon            | `GeneralIconProps`                      | 否   | -              | 自定义下拉箭头图标                                            |
| popupPlacement        | `AntdTreeSelectProps["placement"]`      | 否   | `"bottomLeft"` | 浮层预设位置，可选 bottomLeft、bottomRight、topLeft、topRight |
| size                  | `AntdTreeSelectProps["size"]`           | 否   | -              | 输入框大小，可选 large、middle、small                         |
| maxTagCount           | `number \| "responsive"`                | 否   | -              | 多选模式下最多显示的 tag 数量，设为 responsive 时会自适应宽度 |
| dropdownStyle         | `CSSProperties`                         | 否   | -              | 下拉框的样式                                                  |
| popupMatchSelectWidth | `boolean`                               | 否   | `true`         | 下拉菜单的宽度是否与选择框相同                                |

## Events

| 事件     | detail                                                              | 说明                  |
| -------- | ------------------------------------------------------------------- | --------------------- |
| onChange | `{ value: AntdTreeSelectProps["value"] }` — { value: 选择的值 }     | 选中值变化时触发      |
| onSearch | `string` — 搜索关键词                                               | 搜索框值变化时触发    |
| onSelect | `{ value: AntdTreeSelectProps["value"] }` — { value: 选中的节点值 } | 选中某一树节点时触发  |
| onExpand | `{ keys: React.Key[] }` — { keys: 展开的节点 key 数组 }             | 树节点展开/收缩时触发 |

## Examples

### Basic

展示树选择器的基本用法，通过 treeData 提供树形数据源。

```tsx
<WrappedEoTreeSelect
  treeData={[
    {
      title: "Node1",
      value: 0,
      key: 0,
      children: [
        { title: "Node1-1", value: "0-1" },
        { title: "Node1-2", value: "0-2" },
        { title: "Node1-3", value: "0-3" },
      ],
    },
    {
      title: "Node2",
      value: 1,
      key: 1,
      children: [
        { title: "Node2-1", value: "1-1" },
        { title: "Node2-2", value: "1-2" },
        { title: "Node2-3", value: "1-3" },
      ],
    },
  ]}
/>
```

### With Form

在表单中使用树选择器，配置 name、label 和 required 实现表单集成与校验。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValidateError={(e) => console.log(e.detail)}
>
  <WrappedEoTreeSelect
    label="tree"
    name="tree"
    required={true}
    multiple={true}
    checkable={true}
    placeholder="请选择树节点"
    treeData={[
      {
        title: "Node1",
        value: "Node1",
        key: "0-0",
        children: [
          { title: "Child Node1-1", value: "Child Node1-1", key: "0-0-0" },
          { title: "Child Node1-2", value: "Child Node1-2", key: "0-0-1" },
        ],
      },
      {
        title: "Node2",
        value: "0-1",
        key: "0-1",
        children: [
          { title: "Child Node2-1", value: "Child Node2-1", key: "0-1-0" },
          {
            title: "Child Node2-2",
            value: "Child Node2-2",
            key: "0-1-1",
            children: [
              {
                title: "Child Node2-2-1",
                value: "Child Node2-2-1",
                key: "0-1-1-0",
              },
            ],
          },
        ],
      },
    ]}
    onChange={(e) => console.log(e.detail)}
    onSelect={(e) => console.log(e.detail)}
    onExpand={(e) => console.log(e.detail)}
    onSearch={(e) => console.log(e.detail)}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Multiple Selection with Max Tag Count

开启多选模式并设置 maxTagCount 限制显示的 tag 数量。

```tsx
<WrappedEoTreeSelect
  multiple={true}
  maxTagCount={2}
  treeDefaultExpandAll={true}
  placeholder="可多选，最多显示2个标签"
  treeData={[
    {
      title: "Node1",
      value: "0-0",
      key: "0-0",
      children: [
        { title: "Node1-1", value: "0-0-1", key: "0-0-1" },
        { title: "Node1-2", value: "0-0-2", key: "0-0-2" },
      ],
    },
    {
      title: "Node2",
      value: "0-1",
      key: "0-1",
      children: [
        { title: "Node2-1", value: "0-1-1", key: "0-1-1" },
        { title: "Node2-2", value: "0-1-2", key: "0-1-2" },
      ],
    },
  ]}
  onChange={(e) => console.log(e.detail)}
/>
```

### Custom Field Names and Disabled

使用 fieldNames 自定义数据源字段，并展示禁用状态。

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <WrappedEoTreeSelect
    fieldNames={{ label: "name", value: "id", children: "sub" }}
    treeDefaultExpandAll={true}
    placeholder="自定义字段名"
    treeData={[
      {
        name: "技术",
        id: "tech",
        sub: [
          { name: "前端", id: "frontend" },
          { name: "后端", id: "backend" },
        ],
      },
    ]}
  />
  <WrappedEoTreeSelect
    disabled={true}
    value="0-0"
    placeholder="禁用状态"
    treeData={[{ title: "Node1", value: "0-0", key: "0-0" }]}
  />
</div>
```
