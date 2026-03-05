---
tagName: data-view.dropdown-menu
displayName: WrappedDataViewDropdownMenu
description: 基础下拉菜单
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.dropdown-menu

> 基础下拉菜单

## Props

| 属性        | 类型                                 | 必填 | 默认值 | 说明         |
| ----------- | ------------------------------------ | ---- | ------ | ------------ |
| options     | `{ label: string; value: string }[]` | -    | -      | 候选项       |
| value       | `string`                             | -    | -      | 当前选中值   |
| placeholder | `string`                             | -    | -      | 占位符       |
| allowClear  | `boolean`                            | -    | -      | 是否允许清除 |

## Events

| 事件         | detail                  | 说明         |
| ------------ | ----------------------- | ------------ |
| value.change | `string` — 当前选中的值 | 值改变时触发 |

## Examples

### Basic

展示下拉菜单的基本用法，包含选项、占位符和清除按钮。

```yaml preview
brick: data-view.dropdown-menu
properties:
  options:
    - label: 测试1
      value: test1
    - label: 测试2
      value: test2
  placeholder: 请选择
  allowClear: true
events:
  value.change:
    - action: console.log
```

### With Default Value

展示带默认选中值的下拉菜单。

```yaml preview
brick: data-view.dropdown-menu
properties:
  options:
    - label: 选项A
      value: a
    - label: 选项B
      value: b
    - label: 选项C
      value: c
  value: b
  placeholder: 请选择
  allowClear: true
events:
  value.change:
    - action: console.log
```
