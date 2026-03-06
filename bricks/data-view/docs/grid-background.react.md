---
tagName: data-view.grid-background
displayName: WrappedDataViewGridBackground
description: 大屏网格背景
category: big-screen-layout
source: "@next-bricks/data-view"
---

# WrappedDataViewGridBackground

> 大屏网格背景

## 导入

```tsx
import { WrappedDataViewGridBackground } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型                           | 必填 | 默认值                                               | 说明                 |
| ------------- | ------------------------------ | ---- | ---------------------------------------------------- | -------------------- |
| color         | `React.CSSProperties["color"]` | 否   | `"#235F90"`                                          | 背景条纹颜色         |
| maskStyle     | `React.CSSProperties`          | 否   | -                                                    | 背景蓝色遮罩区域样式 |
| particleColor | `ParticleColor`                | 否   | `{ startColor: "#477AFFFF", endColor: "#5F83FF00" }` | 运动粒子的颜色       |

## Examples

### Basic

展示大屏网格背景的基本用法，包含条纹颜色、粒子颜色和遮罩样式配置。

```tsx
<WrappedDataViewGridBackground
  style={{
    width: "920px",
    height: "600px",
    display: "block",
    backgroundColor: "#1c1e21",
  }}
  color="#235F90"
  particleColor={{ startColor: "#477AFFFF", endColor: "#5F83FF00" }}
  maskStyle={{ background: "rgba(41, 109, 255, 0.8)" }}
/>
```
