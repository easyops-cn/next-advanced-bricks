---
tagName: data-view.hi-tech-button
displayName: WrappedDataViewHiTechButton
description: 大屏按钮
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewHiTechButton

> 大屏按钮

## 导入

```tsx
import { WrappedDataViewHiTechButton } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型                                                                     | 必填 | 默认值      | 说明     |
| ----------- | ------------------------------------------------------------------------ | ---- | ----------- | -------- |
| type        | `"default" \| "parallelogram" \| "stereoscopic" \| "shading" \| "round"` | 否   | `"default"` | 按钮类型 |
| buttonStyle | `React.CSSProperties`                                                    | 否   | -           | 按钮样式 |
| disabled    | `boolean`                                                                | 否   | `false`     | 是否禁用 |

## Slots

| 名称      | 说明     |
| --------- | -------- |
| (default) | 按钮内容 |

## Examples

### Basic

展示默认样式的大屏按钮。

```tsx
<WrappedDataViewHiTechButton>
  <span>BUTTON</span>
</WrappedDataViewHiTechButton>
```

### Parallelogram

展示平行四边形样式的大屏按钮。

```tsx
<WrappedDataViewHiTechButton type="parallelogram">
  <span>BUTTON</span>
</WrappedDataViewHiTechButton>
```

### Stereoscopic

展示立体样式的大屏按钮。

```tsx
<WrappedDataViewHiTechButton type="stereoscopic">
  <span>BUTTON</span>
</WrappedDataViewHiTechButton>
```

### Shading

展示阴影样式的大屏按钮。

```tsx
<WrappedDataViewHiTechButton type="shading">
  <span>BUTTON</span>
</WrappedDataViewHiTechButton>
```

### Round

展示圆形样式的大屏按钮。

```tsx
<WrappedDataViewHiTechButton type="round">
  <span>BUTTON</span>
</WrappedDataViewHiTechButton>
```

### Click

展示点击事件绑定及按钮样式定制。

```tsx
<WrappedDataViewHiTechButton
  buttonStyle={{ fontSize: "16px" }}
  onClick={() => console.log("Click!")}
>
  <span>BUTTON</span>
</WrappedDataViewHiTechButton>
```

### Disabled

展示禁用状态的大屏按钮。

```tsx
<WrappedDataViewHiTechButton disabled>
  <span>BUTTON</span>
</WrappedDataViewHiTechButton>
```
