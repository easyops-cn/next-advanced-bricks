---
tagName: recent-history.recent-visit
displayName: WrappedRecentHistoryRecentVisit
description: 最近访问
category: ""
source: "@next-bricks/recent-history"
---

# WrappedRecentHistoryRecentVisit

> 最近访问

## 导入

```tsx
import { WrappedRecentHistoryRecentVisit } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型       | 必填 | 默认值 | 说明                                  |
| ----------- | ---------- | ---- | ------ | ------------------------------------- |
| namespace   | `string`   | 是   | -      | 命名空间                              |
| capacity    | `number`   | 否   | -      | 最近访问数量                          |
| compareKeys | `string[]` | 否   | -      | 设置后不在该列表内的数据会被剔除      |
| urlTemplate | `string`   | 否   | -      | 点击标签跳转的 url 链接，支持模版变量 |

## Examples

### Basic

展示最近访问记录，通过按钮添加历史记录后自动更新列表。

```tsx
<>
  <button
    onClick={() => {
      // Trigger push-history provider
    }}
  >
    Add history
  </button>
  <WrappedRecentHistoryRecentVisit namespace="playground" capacity={5} />
</>
```

### With URL Template

配置点击跳转链接，支持使用模版变量引用记录的字段值。

```tsx
<>
  <button
    onClick={() => {
      // Trigger push-history provider
    }}
  >
    添加访问记录
  </button>
  <WrappedRecentHistoryRecentVisit
    namespace="my-app"
    capacity={10}
    urlTemplate="/next/app/{{id}}"
  />
</>
```

### With Compare Keys

设置 compareKeys 后，只展示 compareKeys 中包含的 key 对应的访问记录。

```tsx
<>
  <button
    onClick={() => {
      // Trigger push-history provider
    }}
  >
    添加访问记录
  </button>
  <WrappedRecentHistoryRecentVisit
    namespace="filtered-ns"
    capacity={5}
    compareKeys={["key-1", "key-2", "key-3"]}
  />
</>
```
