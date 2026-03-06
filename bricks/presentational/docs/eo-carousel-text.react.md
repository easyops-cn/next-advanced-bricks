---
tagName: eo-carousel-text
displayName: WrappedEoCarouselText
description: 文字跑马灯构件，文本内容从右向左循环滚动展示，支持自定义速度、字体大小和字体颜色。
category: ""
source: "@next-bricks/presentational"
---

# WrappedEoCarouselText

> 文字跑马灯构件，文本内容从右向左循环滚动展示，支持自定义速度、字体大小和字体颜色。

## 导入

```tsx
import { WrappedEoCarouselText } from "@easyops/wrapped-components";
```

## Props

| 属性           | 类型                        | 必填 | 默认值                        | 说明                |
| -------------- | --------------------------- | ---- | ----------------------------- | ------------------- |
| text           | `string`                    | 是   | `""`                          | 展示内容            |
| containerWidth | `CSSProperties["width"]`    | 否   | `"100%"`                      | 容器宽度            |
| fontSize       | `CSSProperties["fontSize"]` | 否   | `"var(--normal-font-size)"`   | 字体大小            |
| fontColor      | `CSSProperties["color"]`    | 否   | `"var(--text-color-default)"` | 字体颜色            |
| speed          | `number`                    | 否   | `100`                         | 移动速度，单位 px/s |

## Examples

### Basic

展示默认样式的文字跑马灯。

```tsx preview
<WrappedEoCarouselText text="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book." />
```

### Custom Speed

调整滚动速度，使文字以更慢的速度滚动。

```tsx preview
<WrappedEoCarouselText
  text="这是一段自定义速度的跑马灯文字，速度设置为每秒 50 像素。"
  speed={50}
/>
```

### Custom Style

自定义字体大小、字体颜色和容器宽度。

```tsx preview
<WrappedEoCarouselText
  text="这是一段自定义样式的跑马灯文字，使用了自定义颜色和字体大小。"
  fontSize="18px"
  fontColor="#1890ff"
  containerWidth="80%"
  speed={80}
/>
```
