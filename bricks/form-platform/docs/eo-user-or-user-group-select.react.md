---
tagName: eo-user-or-user-group-select
displayName: WrappedEoUserOrUserGroupSelect
description: 用户(组)选择器
category: form-input-business
source: "@next-bricks/form-platform"
---

# WrappedEoUserOrUserGroupSelect

> 用户(组)选择器

## 导入

```tsx
import { WrappedEoUserOrUserGroupSelect } from "@easyops/wrapped-components";
```

## Props

| 属性             | 类型                                    | 必填 | 默认值   | 说明                                                                                |
| ---------------- | --------------------------------------- | ---- | -------- | ----------------------------------------------------------------------------------- |
| name             | `string`                                | 否   | -        | 字段名称                                                                            |
| label            | `string`                                | 否   | -        | 字段说明                                                                            |
| required         | `boolean`                               | 否   | -        | 是否必填                                                                            |
| placeholder      | `string`                                | 否   | -        | 字段placeholder                                                                     |
| value            | `string[]`                              | 否   | -        | 值                                                                                  |
| objectList       | `Partial<CmdbModels.ModelCmdbObject>[]` | 否   | -        | 模型列表（按需传递 USER/USER_GROUP 的模型定义，用于显示对应实例名称）               |
| query            | `Record<string, any>`                   | 否   | -        | 用户和用户组 `search` 接口的 `query`，此参数比较适用于两者接口需要参数相同的情况    |
| userQuery        | `Record<string, any>`                   | 否   | -        | 针对 `USER/instance/_search` 接口的 `query`，可能只需要针对用户做筛选的情况         |
| userGroupQuery   | `Record<string, any>`                   | 否   | -        | 针对 `USER_GROUP/instance/_search` 接口的 `query`，可能只需要针对用户组做筛选的情况 |
| userKey          | `"name" \| "instanceId"`                | 否   | `"name"` | 用户对象的唯一标识字段，即：value 使用的字段名                                      |
| optionsMode      | `"user" \| "group" \| "all"`            | 是   | `"all"`  | 支持选择用户、用户组或者两者                                                        |
| disabled         | `boolean`                               | 否   | -        | 是否禁用                                                                            |
| isMultiple       | `boolean`                               | 是   | `true`   | 是否多选，默认为多选                                                                |
| staticList       | `string[]`                              | 否   | -        | 固定白名单列表，该列表中的值用户不能取消                                            |
| hideAddMeQuickly | `boolean`                               | 是   | `true`   | 快速选择我                                                                          |
| themeVariant     | `"default" \| "elevo"`                  | 否   | -        | 主题变体                                                                            |

## Events

| 事件     | detail                                            | 说明         |
| -------- | ------------------------------------------------- | ------------ |
| onChange | `string[]` — 当前选中的用户名或用户组实例 ID 列表 | 值变化时触发 |

## Examples

### Basic

基础用法，默认支持选择用户和用户组，多选模式。

```tsx
<WrappedEoUserOrUserGroupSelect
  label="负责人"
  name="user"
  placeholder="请选择用户或用户组"
  isMultiple={true}
/>
```

### User Only Mode

仅选择用户模式，不显示用户组选项。

```tsx
<WrappedEoUserOrUserGroupSelect
  label="用户"
  name="user"
  placeholder="请选择用户"
  optionsMode="user"
  isMultiple={true}
  onChange={(e) => console.log(e.detail)}
/>
```

### Single Select with Quick Add Me

单选模式，并显示"快速选择我"按钮。

```tsx
<WrappedEoUserOrUserGroupSelect
  label="操作人"
  name="operator"
  placeholder="请选择用户"
  optionsMode="user"
  isMultiple={false}
  hideAddMeQuickly={false}
  onChange={(e) => console.log(e.detail)}
/>
```

### With Form Integration

在表单中使用，支持必填校验和表单提交。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoUserOrUserGroupSelect
    name="members"
    label="成员"
    required={true}
    placeholder="请选择成员"
    isMultiple={true}
    optionsMode="all"
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Disabled Mode

禁用状态，展示已选中的值但不可更改。

```tsx
<WrappedEoUserOrUserGroupSelect
  label="归属用户"
  name="owner"
  disabled={true}
  value={["admin"]}
  isMultiple={false}
  optionsMode="user"
/>
```
