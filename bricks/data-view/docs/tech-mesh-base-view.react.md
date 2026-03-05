---
tagName: data-view.tech-mesh-base-view
displayName: WrappedDataViewTechMeshBaseView
description: 大屏框架构件-网格纹
category: big-screen-layout
source: "@next-bricks/data-view"
---

# WrappedDataViewTechMeshBaseView

> 大屏框架构件-网格纹

## 导入

```tsx
import { WrappedDataViewTechMeshBaseView } from "@easyops/wrapped-components";
```

## Slots

| 名称     | 说明         |
| -------- | ------------ |
| titleBar | 标题栏插槽   |
| content  | 页面内容插槽 |

## Examples

### Basic TabsTitleBar

展示使用带标签页标题栏的大屏框架构件基础用法。

```tsx
<WrappedDataViewTechMeshBaseView style={{ minHeight: "800px" }}>
  <WrappedDataViewTabsPageTitle slot="titleBar">
    <WrappedDataViewTitleText slot="" text="大标题" type="gradient" />
    <WrappedDataViewBrickNotification
      slot="start"
      message="This is the content of the notification."
    />
    <div slot="end" style={{ fontSize: "16px", color: "#fff" }}>
      2022/11/30 17:25 星期四
    </div>
  </WrappedDataViewTabsPageTitle>
</WrappedDataViewTechMeshBaseView>
```

### Sample TitleBar

展示使用顶部标题栏样式为 sample 的大屏框架构件。

```tsx
<WrappedDataViewTechMeshBaseView style={{ minHeight: "800px" }}>
  <WrappedDataViewTopTitleBar slot="titleBar" text="可视化大屏" type="sample" />
</WrappedDataViewTechMeshBaseView>
```
