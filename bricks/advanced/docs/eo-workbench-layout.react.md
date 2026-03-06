---
tagName: eo-workbench-layout
displayName: WrappedEoWorkbenchLayout
description: 工作台布局（拖拽式卡片布局，支持编辑模式）
category: layout
source: "@next-bricks/advanced"
---

# WrappedEoWorkbenchLayout

> 工作台布局（拖拽式卡片布局，支持编辑模式）。⚠️ 已废弃，请使用 `WrappedEoWorkbenchLayoutV2`。

## 导入

```tsx
import { WrappedEoWorkbenchLayout } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型       | 必填 | 默认值 | 说明                                                         |
| ------------- | ---------- | ---- | ------ | ------------------------------------------------------------ |
| cardTitle     | `string`   | 否   | -      | 编辑模式下左侧卡片列表面板的标题                             |
| isEdit        | `boolean`  | 否   | -      | 是否进入编辑模式，编辑模式下可拖拽调整布局并显示卡片选择面板 |
| layouts       | `Layout[]` | 否   | -      | 当前布局配置，每项对应一个卡片的位置与大小                   |
| componentList | `Item[]`   | 否   | -      | 组件列表，每项包含 key、title、useBrick 和 position 信息     |

## Events

| 事件          | detail                                                                                              | 说明               |
| ------------- | --------------------------------------------------------------------------------------------------- | ------------------ |
| onChange      | `Layout[]` — 当前布局配置数组                                                                       | 布局发生变化时触发 |
| onSave        | `Layout[]` — 保存时的布局配置数组                                                                   | 点击保存按钮时触发 |
| onCancel      | `void`                                                                                              | 点击取消按钮时触发 |
| onActionClick | `{ action: SimpleAction; layouts: Layout[] }` — { action: 点击的操作项, layouts: 当前布局配置数组 } | 操作点击事件       |

## Methods

| 方法       | 参数                          | 返回值 | 说明         |
| ---------- | ----------------------------- | ------ | ------------ |
| setLayouts | `(layouts: Layout[]) => void` | `void` | 设置布局配置 |

## Examples

### Basic

展示工作台布局的基本用法，通过 layouts 和 componentList 配置卡片位置与内容。

```tsx
<WrappedEoWorkbenchLayout
  layouts={[
    { i: "hello", x: 0, y: 0, w: 2, h: 1 },
    { i: "world", x: 0, y: 1, w: 2, h: 1 },
    { i: "small", x: 2, y: 0, w: 1, h: 1 },
  ]}
  componentList={[
    {
      title: "基础布局",
      key: "hello",
      position: { i: "hello", x: 0, y: 0, w: 2, h: 1 },
      useBrick: {
        brick: "eo-card",
        properties: { fillVertical: true },
        children: [{ brick: "div", properties: { textContent: "Hello" } }],
      },
    },
    {
      title: "world",
      key: "world",
      position: { i: "world", x: 0, y: 2, w: 2, h: 1 },
      useBrick: {
        brick: "eo-card",
        properties: { fillVertical: true },
        children: [{ brick: "div", properties: { textContent: "World" } }],
      },
    },
    {
      title: "small",
      key: "small",
      position: { i: "small", x: 2, y: 0, w: 1, h: 2 },
      useBrick: {
        brick: "div",
        properties: { style: { height: "100%", background: "#fff" } },
        children: [{ brick: "div", properties: { textContent: "small" } }],
      },
    },
  ]}
/>
```

### Edit Mode

开启 isEdit 进入编辑模式，支持拖拽调整卡片位置，并监听 onSave 和 onCancel 事件。

```tsx
const ref = useRef<any>();

<WrappedEoWorkbenchLayout
  ref={ref}
  isEdit={true}
  layouts={[
    { i: "hello", x: 0, y: 0, w: 2, h: 1 },
    { i: "world", x: 0, y: 1, w: 2, h: 1 },
    { i: "small", x: 2, y: 0, w: 1, h: 1 },
  ]}
  componentList={[
    {
      title: "基础布局",
      key: "hello",
      position: { i: "hello", x: 0, y: 0, w: 2, h: 1 },
      useBrick: {
        brick: "eo-card",
        children: [{ brick: "div", properties: { textContent: "Hello" } }],
      },
    },
    {
      title: "world",
      key: "world",
      position: { i: "world", x: 0, y: 2, w: 2, h: 1 },
      useBrick: {
        brick: "eo-card",
        children: [{ brick: "div", properties: { textContent: "World" } }],
      },
    },
    {
      title: "small",
      key: "small",
      position: { i: "small", x: 2, y: 0, w: 1, h: 2 },
      useBrick: {
        brick: "div",
        properties: { style: { height: "100%", background: "#fff" } },
        children: [{ brick: "div", properties: { textContent: "small" } }],
      },
    },
  ]}
  onChange={(e) => console.log(e.detail)}
  onSave={(e) => console.log(e.detail)}
  onCancel={() => console.log("cancel")}
  onActionClick={(e) => console.log(e.detail)}
/>;
```
