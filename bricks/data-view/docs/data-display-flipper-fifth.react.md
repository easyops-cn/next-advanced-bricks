---
tagName: data-view.data-display-flipper-fifth
displayName: WrappedDataViewDataDisplayFlipperFifth
description: 翻牌器-type-5
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewDataDisplayFlipperFifth

> 翻牌器-type-5

## 导入

```tsx
import { WrappedDataViewDataDisplayFlipperFifth } from "@easyops/wrapped-components";
```

## Props

| 属性              | 类型                               | 必填 | 默认值  | 说明                     |
| ----------------- | ---------------------------------- | ---- | ------- | ------------------------ |
| flipperTitle      | `string`                           | 否   | -       | 翻牌器标题               |
| data              | `number \| string`                 | 是   | -       | 翻牌器数值               |
| unit              | `string`                           | 是   | -       | 翻牌器单位               |
| flipperStyle      | `React.CSSProperties \| undefined` | 否   | -       | 翻牌器样式               |
| enableTitlePrefix | `boolean \| undefined`             | 否   | `false` | 是否启用标题前缀插槽     |
| showDefaultPrefix | `boolean \| undefined`             | 否   | `true`  | 标题是否展示默认前缀图片 |

## Slots

| 名称        | 说明                                                |
| ----------- | --------------------------------------------------- |
| titlePrefix | 标题前缀内容，仅在 enableTitlePrefix 为 true 时生效 |

## Examples

### Basic

展示带标题、数值和单位的 type-5 翻牌器。

```tsx
<WrappedDataViewDataDisplayFlipperFifth
  flipperTitle="翻牌器名称"
  data={195.15}
  unit="单位"
/>
```

### Show default prefix

隐藏默认前缀图片的翻牌器。

```tsx
<WrappedDataViewDataDisplayFlipperFifth
  flipperTitle="资产数量"
  data={10086}
  unit="台"
  showDefaultPrefix={false}
/>
```

### Custom style

通过 flipperStyle 自定义翻牌器容器样式。

```tsx
<WrappedDataViewDataDisplayFlipperFifth
  flipperTitle="在线主机"
  data={3456}
  unit="台"
  flipperStyle={{ color: "#00c8ff" }}
/>
```

### Enable title prefix slot

启用自定义标题前缀插槽，替代默认前缀图片。

```tsx
<WrappedDataViewDataDisplayFlipperFifth
  flipperTitle="主机数量"
  data={8888}
  unit="台"
  enableTitlePrefix={true}
>
  <span slot="titlePrefix">◆</span>
</WrappedDataViewDataDisplayFlipperFifth>
```
