---
tagName: data-view.tech-mesh-base-view
displayName: WrappedDataViewTechMeshBaseView
description: 大屏框架构件-网格纹
category: big-screen-layout
source: "@next-bricks/data-view"
---

# data-view.tech-mesh-base-view

> 大屏框架构件-网格纹

## Slots

| 名称     | 说明         |
| -------- | ------------ |
| titleBar | 标题栏插槽   |
| content  | 页面内容插槽 |

## Examples

### Basic TabsTitleBar

展示使用带标签页标题栏的大屏框架构件基础用法。

```yaml preview
- brick: data-view.tech-mesh-base-view
  properties:
    style:
      min-height: 800px
  slots:
    titleBar:
      type: bricks
      bricks:
        - brick: data-view.tabs-page-title
          slots:
            "":
              type: bricks
              bricks:
                - brick: data-view.title-text
                  properties:
                    text: 大标题
                    type: gradient
            start:
              type: bricks
              bricks:
                - brick: data-view.brick-notification
                  properties:
                    message: This is the content of the notification.
            end:
              type: bricks
              bricks:
                - brick: div
                  properties:
                    textContent: "2022/11/30 17:25 星期四"
                    style:
                      font-size: 16px
                      color: "#fff"
```

### Sample TitleBar

展示使用顶部标题栏样式为 sample 的大屏框架构件。

```yaml preview
- brick: data-view.tech-mesh-base-view
  properties:
    style:
      min-height: 800px
  slots:
    titleBar:
      type: bricks
      bricks:
        - brick: data-view.top-title-bar
          properties:
            text: 可视化大屏
            type: sample
```
