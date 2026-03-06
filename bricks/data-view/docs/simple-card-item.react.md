---
tagName: data-view.simple-card-item
displayName: WrappedDataViewSimpleCardItem
description: 基础卡片项
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewSimpleCardItem

> 基础卡片项

## 导入

```tsx
import { WrappedDataViewSimpleCardItem } from "@easyops/wrapped-components";
```

## Props

| 属性            | 类型                                | 必填 | 默认值     | 说明     |
| --------------- | ----------------------------------- | ---- | ---------- | -------- |
| cardTitle       | `string`                            | 是   | -          | 标题     |
| description     | `string`                            | 是   | -          | 描述     |
| status          | `"normal" \| "warning"`             | 是   | `"normal"` | 状态     |
| titleStyle      | `CSSProperties`                     | 是   | -          | 标题样式 |
| desStyle        | `CSSProperties`                     | 是   | -          | 描述样式 |
| color           | `CSSProperties["color"]`            | 是   | -          | 字体颜色 |
| background      | `React.CSSProperties["background"]` | 是   | -          | 背景颜色 |
| descriptionList | `descriptionListItem[]`             | 是   | -          | 描述列表 |

## Examples

### Basic

展示基础卡片项，包含标题和描述文本。

```tsx
<WrappedDataViewSimpleCardItem cardTitle="服务器状态" description="运行正常" />
```

### Warning Status

展示告警状态的卡片项，通过 status 属性切换样式。

```tsx
<WrappedDataViewSimpleCardItem
  cardTitle="数据库连接"
  description="连接异常"
  status="warning"
/>
```

### Custom Style

展示自定义背景色和字体颜色的卡片项。

```tsx
<WrappedDataViewSimpleCardItem
  cardTitle="自定义样式"
  description="自定义描述文字"
  color="#00e0db"
  background="rgba(0, 100, 200, 0.3)"
  titleStyle={{ fontSize: "18px", fontWeight: "bold" }}
  desStyle={{ fontSize: "14px" }}
/>
```

### Description List

展示包含描述列表的卡片项，用于显示多组键值对信息。

```tsx
<WrappedDataViewSimpleCardItem
  cardTitle="主机详情"
  description="运行正常"
  descriptionList={[
    { key: "IP地址", value: "192.168.1.100" },
    { key: "CPU", value: "45%" },
    { key: "内存", value: "62%" },
  ]}
/>
```
