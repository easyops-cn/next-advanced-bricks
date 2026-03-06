---
tagName: data-view.loading-panel
displayName: WrappedDataViewLoadingPanel
description: 大屏加载模块展示
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.loading-panel

> 大屏加载模块展示

## Props

| 属性                | 类型      | 必填 | 默认值  | 说明                                       |
| ------------------- | --------- | ---- | ------- | ------------------------------------------ |
| customTitle         | `string`  | 否   | -       | 标题                                       |
| loading             | `boolean` | 否   | -       | 是否加载中，虚拟数据模拟加载过程           |
| useRealTimeProgress | `boolean` | 否   | `false` | 加载过程是否使用真实数据                   |
| progress            | `number`  | 否   | -       | 加载进度，区间 [0-100]，使用真实数据时生效 |
| intervalTime        | `number`  | 否   | `100`   | 每次加载变化的时间间隔，单位 ms            |

## Events

| 事件 | detail | 说明             |
| ---- | ------ | ---------------- |
| end  | `void` | loading 结束事件 |

## Examples

### Basic

展示虚拟数据模拟加载过程的基本用法。

```yaml preview
- brick: data-view.loading-panel
  properties:
    customTitle: Hello World!!
    loading: false
    style:
      height: 300px
      display: block
```

### Progress

展示使用真实进度数据及加载结束事件监听的用法。

```yaml preview
- brick: data-view.loading-panel
  properties:
    customTitle: Hello World!!
    progress: 60
    useRealTimeProgress: true
    intervalTime: 300
    style:
      height: 300px
      display: block
  events:
    end:
      - action: console.log
```
