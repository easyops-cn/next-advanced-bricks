---
tagName: eo-divider
displayName: WrappedEoDivider
description: 分割线
category: container-display
source: "@next-bricks/presentational"
---

# eo-divider (React)

> 分割线

## Props

| 属性         | 类型                                        | 必填 | 默认值         | 说明                                                                   |
| ------------ | ------------------------------------------- | ---- | -------------- | ---------------------------------------------------------------------- |
| orientation  | `"left" \| "center" \| "right"`             | 否   | `"center"`     | 标题位置，在 `horizontal` 类型的分割线中使用                           |
| dashed       | `boolean`                                   | 否   | `false`        | 是否渲染为虚线                                                         |
| type         | `"horizontal" \| "vertical" \| "radiation"` | 否   | `"horizontal"` | 分割线类型：水平、垂直或放射。`radiation` 是特殊样式类型，外观固定     |
| proportion   | `[number, number]`                          | 否   | -              | 数值比例，仅在 `type="radiation"` 时生效。例如展示"1/3"时传入 `[1, 3]` |
| dividerStyle | `CSSProperties`                             | 否   | -              | 分割线容器的自定义内联样式                                             |

## Examples

### Basic

水平分割线，无文字内容。

```tsx preview
import { WrappedEoDivider } from "@next-bricks/presentational/eo-divider";

export function App() {
  return <WrappedEoDivider />;
}
```

### orientation

设置 `orientation` 控制插槽文字在水平分割线中的对齐位置。

```tsx preview
import { WrappedEoDivider } from "@next-bricks/presentational/eo-divider";

export function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <WrappedEoDivider orientation="left">
        <span>左对齐</span>
      </WrappedEoDivider>
      <WrappedEoDivider orientation="center">
        <span>居中</span>
      </WrappedEoDivider>
      <WrappedEoDivider orientation="right">
        <span>右对齐</span>
      </WrappedEoDivider>
    </div>
  );
}
```

### dashed

启用 `dashed` 后分割线以虚线样式呈现。

```tsx preview
import { WrappedEoDivider } from "@next-bricks/presentational/eo-divider";

export function App() {
  return (
    <WrappedEoDivider dashed>
      <span>虚线分割</span>
    </WrappedEoDivider>
  );
}
```

### type vertical

`type="vertical"` 用于行内元素之间的垂直分隔。

```tsx preview
import { WrappedEoDivider } from "@next-bricks/presentational/eo-divider";

export function App() {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span>文本A</span>
      <WrappedEoDivider type="vertical" />
      <span>文本B</span>
      <WrappedEoDivider type="vertical" dashed />
      <span>文本C</span>
    </div>
  );
}
```

### type radiation

`type="radiation"` 配合 `proportion` 展示数值比例（如进度或占比）。

```tsx preview
import { WrappedEoDivider } from "@next-bricks/presentational/eo-divider";

export function App() {
  return (
    <WrappedEoDivider type="radiation" proportion={[1, 3]}>
      <span>完成进度</span>
    </WrappedEoDivider>
  );
}
```

### dividerStyle

通过 `dividerStyle` 自定义分割线容器的内联样式。

```tsx preview
import { WrappedEoDivider } from "@next-bricks/presentational/eo-divider";

export function App() {
  return (
    <WrappedEoDivider
      dividerStyle={{ borderColor: "#1890ff", margin: "16px 0" }}
    >
      <span>自定义样式</span>
    </WrappedEoDivider>
  );
}
```
