---
tagName: ai-portal.dropdown-select
displayName: WrappedAiPortalDropdownSelect
description: 下拉选择器，提供选项列表供用户选择，支持搜索过滤功能。
category: interact-basic
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalDropdownSelect

> 下拉选择器，提供选项列表供用户选择，支持搜索过滤功能。

## 导入

```tsx
import { WrappedAiPortalDropdownSelect } from "@easyops/wrapped-components";
```

## Props

| 属性                 | 类型                  | 必填 | 默认值    | 说明                     |
| -------------------- | --------------------- | ---- | --------- | ------------------------ |
| value                | `string`              | 否   | -         | 当前选中项的值           |
| options              | `DropdownOptions[]`   | 否   | -         | 可选项数据源             |
| labelMaxWidth        | `string \| number`    | 否   | -         | 触发器标签的最大宽度     |
| loading              | `boolean`             | 否   | -         | 是否显示加载状态         |
| searchPlaceholder    | `string`              | 否   | -         | 搜索框的占位文本         |
| dropdownContentStyle | `React.CSSProperties` | 否   | -         | 下拉内容区域的自定义样式 |
| dropdownMaxWidth     | `string \| number`    | 否   | `"500px"` | 下拉框的最大宽度         |
| showSearch           | `boolean`             | 否   | -         | 是否展示搜索框           |

## Events

| 事件     | detail                                                 | 说明           |
| -------- | ------------------------------------------------------ | -------------- |
| onChange | `DropdownOptions` — { label: 选项标签, value: 选项值 } | 选项选中时触发 |

## Examples

### Basic

基础用法，提供选项列表供用户选择。

```tsx
<WrappedAiPortalDropdownSelect
  value="option1"
  options={[
    { label: "选项1", value: "option1" },
    { label: "选项2", value: "option2" },
    { label: "选项3", value: "option3" },
  ]}
  onChange={(e) => console.log(e.detail)}
/>
```

### With Search

启用搜索功能，允许用户通过关键词过滤选项。

```tsx
<WrappedAiPortalDropdownSelect
  showSearch
  searchPlaceholder="请输入关键词搜索"
  options={[
    { label: "北京市", value: "beijing" },
    { label: "上海市", value: "shanghai" },
    { label: "广州市", value: "guangzhou" },
    { label: "深圳市", value: "shenzhen" },
    { label: "杭州市", value: "hangzhou" },
  ]}
  onChange={(e) => console.log(e.detail)}
/>
```

### Loading State

展示加载状态，适用于选项数据异步获取的场景。

```tsx
<WrappedAiPortalDropdownSelect
  loading
  options={[{ label: "加载中...", value: "loading" }]}
  onChange={(e) => console.log(e.detail)}
/>
```

### Custom Width

自定义标签和下拉框宽度，适合长文本选项场景。

```tsx
<WrappedAiPortalDropdownSelect
  labelMaxWidth="150px"
  dropdownMaxWidth="300px"
  dropdownContentStyle={{ padding: "8px 0" }}
  value="long-option"
  options={[
    { label: "这是一个很长的选项标签文本", value: "long-option" },
    { label: "短选项", value: "short" },
    { label: "中等长度的选项", value: "medium" },
  ]}
  onChange={(e) => console.log(e.detail)}
/>
```

### With Disabled Options

包含禁用选项的下拉列表。

```tsx
<WrappedAiPortalDropdownSelect
  options={[
    { label: "可用选项1", value: "enabled1" },
    { label: "禁用选项", value: "disabled1", disabled: true },
    { label: "可用选项2", value: "enabled2" },
    { label: "禁用选项2", value: "disabled2", disabled: true },
  ]}
  onChange={(e) => console.log(e.detail)}
/>
```

### Complex Example

综合示例，包含搜索、宽度自定义和禁用选项。

```tsx
<WrappedAiPortalDropdownSelect
  value="frontend"
  showSearch
  searchPlaceholder="搜索技术栈"
  labelMaxWidth="200px"
  dropdownMaxWidth="400px"
  options={[
    { label: "前端开发 - React", value: "frontend" },
    { label: "后端开发 - Node.js", value: "backend" },
    { label: "移动开发 - React Native", value: "mobile" },
    { label: "数据库 - MongoDB", value: "database" },
    { label: "DevOps - Docker", value: "devops", disabled: true },
    { label: "机器学习 - Python", value: "ml" },
    { label: "云计算 - AWS", value: "cloud" },
  ]}
  onChange={(e) => console.log("选择了：", e.detail)}
/>
```
