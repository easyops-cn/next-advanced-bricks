---
tagName: data-view.data-display-flipper
displayName: WrappedDataViewDataDisplayFlipper
description: 翻牌器-type-3
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewDataDisplayFlipper

> 翻牌器-type-3

## 导入

```tsx
import { WrappedDataViewDataDisplayFlipper } from "@easyops/wrapped-components";
```

## Props

| 属性              | 类型                               | 必填 | 默认值  | 说明                         |
| ----------------- | ---------------------------------- | ---- | ------- | ---------------------------- |
| flipperTitle      | `string`                           | 否   | -       | 翻牌器标题                   |
| data              | `number \| string`                 | 是   | -       | 翻牌器数值                   |
| unit              | `string`                           | 是   | -       | 翻牌器单位                   |
| flipperStyle      | `React.CSSProperties \| undefined` | 否   | -       | 翻牌器样式                   |
| enableTitlePrefix | `boolean \| undefined`             | 否   | `false` | 是否启用标题前缀插槽         |
| showDefaultPrefix | `boolean \| undefined`             | 否   | `true`  | 标题是否展示默认前缀图片     |
| separator         | `string`                           | 否   | `"/"`   | 翻牌器数字和单位之间的分隔符 |

## Slots

| 名称        | 说明                                                |
| ----------- | --------------------------------------------------- |
| titlePrefix | 标题前缀内容，仅在 enableTitlePrefix 为 true 时生效 |

## Examples

### Basic

展示带标题、数值和单位的翻牌器。

```tsx
<WrappedDataViewDataDisplayFlipper
  flipperTitle="翻牌器标题"
  data={1281925.15}
  unit="万"
/>
```

### Show default prefix

隐藏默认前缀图片并自定义分隔符样式。

```tsx
<WrappedDataViewDataDisplayFlipper
  data={1281925.15}
  unit="万"
  separator=" "
  showDefaultPrefix={false}
/>
```

### Custom style

通过 flipperStyle 自定义翻牌器容器样式。

```tsx
<WrappedDataViewDataDisplayFlipper
  flipperTitle="资产总量"
  data={99999}
  unit="台"
  separator="-"
  flipperStyle={{ color: "#00c8ff" }}
/>
```

### Enable title prefix slot

启用自定义标题前缀插槽，替代默认前缀图片。

```tsx
<WrappedDataViewDataDisplayFlipper
  flipperTitle="主机数量"
  data={3456}
  unit="台"
  enableTitlePrefix={true}
>
  <span slot="titlePrefix">★</span>
</WrappedDataViewDataDisplayFlipper>
```
