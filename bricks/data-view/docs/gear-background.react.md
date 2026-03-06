---
tagName: data-view.gear-background
displayName: WrappedDataViewGearBackground
description: 齿轮背景
category: big-screen-layout
source: "@next-bricks/data-view"
---

# WrappedDataViewGearBackground

> 齿轮背景

## 导入

```tsx
import { WrappedDataViewGearBackground } from "@easyops/wrapped-components";
```

## Props

| 属性  | 类型                           | 必填 | 默认值      | 说明         |
| ----- | ------------------------------ | ---- | ----------- | ------------ |
| color | `React.CSSProperties["color"]` | -    | `"#3366FF"` | 背景条纹颜色 |

## Examples

### Basic

展示齿轮背景的基本用法，通过设置容器尺寸控制显示区域。

```tsx
<WrappedDataViewGearBackground
  style={{
    width: "300px",
    height: "300px",
    display: "block",
    background: "#1c1e21",
  }}
/>
```

### Custom Color

自定义齿轮背景的条纹颜色。

```tsx
<WrappedDataViewGearBackground
  color="#00eaff"
  style={{
    width: "400px",
    height: "400px",
    display: "block",
    background: "#0a0e1a",
  }}
/>
```
