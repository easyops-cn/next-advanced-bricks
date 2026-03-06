---
tagName: eo-text-tooltip
displayName: WrappedEoTextTooltip
description: 文本超出显示区域时，鼠标悬浮显示完整内容的 Tooltip
category: display
source: "@next-bricks/advanced"
---

# WrappedEoTextTooltip

> 文本超出显示区域时，鼠标悬浮显示完整内容的 Tooltip

## 导入

```tsx
import { WrappedEoTextTooltip } from "@easyops/wrapped-components";
```

## Props

| 属性      | 类型     | 必填 | 默认值 | 说明                                                  |
| --------- | -------- | ---- | ------ | ----------------------------------------------------- |
| label     | `string` | 否   | -      | 显示的文本内容，超出时以省略号截断                    |
| lineClamp | `number` | 否   | `1`    | 省略的行数，超过该行数后显示省略号，设为 0 表示不省略 |

## Examples

### Basic

展示文本 Tooltip 的基本用法，超出宽度时鼠标悬浮显示完整内容。

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <WrappedEoTextTooltip
    style={{ width: 180 }}
    label="不省略不省略不省略不省略不省略不省略不省略不省略不省略不省略不省略不省略"
    lineClamp={0}
  />
  <WrappedEoTextTooltip
    style={{ width: 180 }}
    label="单行不超出不显示tips"
    lineClamp={1}
  />
  <WrappedEoTextTooltip
    style={{ width: 180 }}
    label="单行超出省略显示tips单行超出省略显示tips单行超出省略显示tips"
    lineClamp={1}
  />
</div>
```

### Multi-line Clamp

通过设置 lineClamp 控制最多显示的行数，超出时显示省略号并悬浮展示完整内容。

```tsx
<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <WrappedEoTextTooltip
    style={{ width: 200 }}
    label="多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略多行省略"
    lineClamp={2}
  />
  <WrappedEoTextTooltip
    style={{ width: 200 }}
    label="三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略三行省略"
    lineClamp={3}
  />
</div>
```
