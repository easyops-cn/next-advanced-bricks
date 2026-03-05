---
tagName: data-view.modern-style-component-title
displayName: WrappedDataViewModernStyleComponentTitle
description: 现代风组件标题
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewModernStyleComponentTitle

> 现代风组件标题

## 导入

```tsx
import { WrappedDataViewModernStyleComponentTitle } from "@easyops/wrapped-components";
```

## Props

| 属性               | 类型                           | 必填 | 默认值  | 说明             |
| ------------------ | ------------------------------ | ---- | ------- | ---------------- |
| hideLeftComponent  | `boolean`                      | 否   | `false` | 是否隐藏左侧装饰 |
| hideRightComponent | `boolean`                      | 否   | `true`  | 是否隐藏右侧装饰 |
| componentTitle     | `string`                       | 否   | -       | 组件标题         |
| titleTextStyle     | `React.CSSProperties`          | 否   | -       | 标题文字样式     |
| squareColor        | `React.CSSProperties["color"]` | 否   | -       | 装饰颜色         |

## Slots

| 名称        | 说明                                                                      |
| ----------- | ------------------------------------------------------------------------- |
| toolbar     | 工具栏区域，在 `hideLeftComponent` 为 `true` 时显示于左侧，否则显示于右侧 |
| titleSuffix | 标题后缀内容，紧跟标题文字后显示                                          |

## Examples

### Basic

展示现代风组件标题的基本用法。

```tsx
<WrappedDataViewModernStyleComponentTitle
  componentTitle="组件标题"
  style={{ height: "50px", display: "block", backgroundColor: "#1c1e21" }}
/>
```

### TitleSuffix && Toolbar slot

展示带工具栏和标题后缀插槽的现代风组件标题。

```tsx
<WrappedDataViewModernStyleComponentTitle
  componentTitle="组件标题"
  style={{ height: "50px", display: "block", backgroundColor: "#1c1e21" }}
>
  <span slot="toolbar">toolbar</span>
  <span slot="titleSuffix">titleSuffix</span>
</WrappedDataViewModernStyleComponentTitle>
```

### Hide Left Component with Right Decoration

展示隐藏左侧装饰、显示右侧装饰并自定义颜色的现代风组件标题。

```tsx
<WrappedDataViewModernStyleComponentTitle
  componentTitle="组件标题"
  hideRightComponent={false}
  hideLeftComponent={true}
  squareColor="#4AEAFF"
  titleTextStyle={{ color: "#FFFFFF", fontSize: "18px" }}
  style={{ height: "50px", display: "block", backgroundColor: "#1c1e21" }}
/>
```
