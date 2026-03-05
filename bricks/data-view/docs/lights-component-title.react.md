---
tagName: data-view.lights-component-title
displayName: WrappedDataViewLightsComponentTitle
description: 大屏灯光风格组件标题
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewLightsComponentTitle

> 大屏灯光风格组件标题

## 导入

```tsx
import { WrappedDataViewLightsComponentTitle } from "@easyops/wrapped-components";
```

## Props

| 属性           | 类型                | 必填 | 默认值    | 说明                                                    |
| -------------- | ------------------- | ---- | --------- | ------------------------------------------------------- |
| componentTitle | `string`            | 是   | -         | 组件标题                                                |
| theme          | `"light" \| "dark"` | 否   | `"light"` | 主题风格，`light` 为浅色光标图标，`dark` 为深色光标图标 |

## Examples

### Light

展示浅色主题的灯光风格组件标题。

```tsx
<div style={{ width: "100%", height: "100%", background: "#000000FF" }}>
  <WrappedDataViewLightsComponentTitle
    componentTitle="标题内容"
    theme="light"
  />
</div>
```

### Dark

展示深色主题的灯光风格组件标题。

```tsx
<div style={{ width: "100%", height: "100%", background: "#000000FF" }}>
  <WrappedDataViewLightsComponentTitle componentTitle="标题内容" theme="dark" />
</div>
```
