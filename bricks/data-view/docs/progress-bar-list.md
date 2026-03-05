---
tagName: data-view.progress-bar-list
displayName: WrappedDataViewProgressBarList
description: 大屏进度条列表
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.progress-bar-list

> 大屏进度条列表

## Props

| 属性       | 类型     | 必填 | 默认值 | 说明                                               |
| ---------- | -------- | ---- | ------ | -------------------------------------------------- |
| dataSource | `Data[]` | 否   | `[]`   | 数据列表，每项包含标题、数值及可选的进度条颜色配置 |

## Examples

### Basic

展示大屏进度条列表的基本用法，数据项支持自定义颜色。

```yaml preview
brick: data-view.progress-bar-list
properties:
  dataSource:
    - title: 资源1
      count: 123
    - title: 资源2
      count: 39
    - title: 资源3
      count: 23
    - title: 资源4
      count: 13
    - title: 资源5
      count: 49
      barBackground: linear-gradient(to right, rgba(255, 222, 104, 0.2), rgb(255, 222, 104))
      loopBackground: rgb(255, 222, 104)
```
