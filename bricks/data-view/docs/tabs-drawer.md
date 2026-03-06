---
tagName: data-view.tabs-drawer
displayName: WrappedDataViewTabsDrawer
description: 大屏仪标签页抽屉
category: big-screen-layout
source: "@next-bricks/data-view"
---

# data-view.tabs-drawer

> 大屏仪标签页抽屉

## Props

| 属性        | 类型                  | 必填 | 默认值 | 说明                                               |
| ----------- | --------------------- | ---- | ------ | -------------------------------------------------- |
| tabList     | `TabItem[]`           | 是   | -      | 抽屉左侧菜单列表                                   |
| activeKey   | `string`              | 是   | -      | 抽屉左侧菜单高亮显示                               |
| width       | `number \| string`    | 是   | -      | 抽屉宽度内容区的宽度，优先级高于bodyStyle内的width |
| drawerStyle | `React.CSSProperties` | 是   | -      | 设计 Drawer 容器样式                               |
| bodyStyle   | `React.CSSProperties` | 是   | -      | 可用于设置 Drawer 内容部分的样式                   |
| zIndex      | `number`              | 否   | -      | 抽屉层级                                           |
| visible     | `boolean`             | 否   | -      | 遮罩层是否显示                                     |

## Events

| 事件       | detail                             | 说明                                                          |
| ---------- | ---------------------------------- | ------------------------------------------------------------- |
| open       | `void`                             | 抽屉打开事件                                                  |
| close      | `void`                             | 抽屉关闭事件                                                  |
| tab.change | `string` — 切换后激活的 tab 的 key | 切换 `tab` 栏会触发的事件，`detail` 为目标 `tab` 对应的 `key` |

## Methods

| 方法  | 参数         | 返回值 | 说明     |
| ----- | ------------ | ------ | -------- |
| open  | `() => void` | `void` | 打开抽屉 |
| close | `() => void` | `void` | 关闭抽屉 |

## Examples

### Basic

展示带有三个标签页的基础抽屉，默认展开并高亮第一个标签。

```yaml preview
- brick: data-view.tabs-drawer
  properties:
    activeKey: search
    id: drawer
    visible: true
    width: 800
    style:
      height: 600px
      display: block
    tabList:
      - tooltip: 搜索
        key: search
        icon:
          lib: fa
          icon: search
          prefix: fas
      - tooltip: 内容
        key: app
        icon:
          lib: easyops
          category: app
          icon: micro-app-configuration
      - tooltip: 图表
        key: chart
        icon:
          lib: fa
          icon: ad
          prefix: fas
  slots:
    search:
      type: bricks
      bricks:
        - brick: div
          properties:
            style:
              padding: 0 16px
              height: 100px
              background: red
            textContent: 测试
    app:
      type: bricks
      bricks:
        - brick: div
          properties:
            textContent: 内容区域
            style:
              background: yellow
              height: 100px
    chart:
      type: bricks
      bricks:
        - brick: div
          properties:
            textContent: 图表区域
            style:
              background: green
              height: 100px
  events:
    close:
      - action: console.log
    tab.change:
      - action: console.log
```

### Method Control

通过调用 open/close 方法程序化控制抽屉的展开与收起。

```yaml preview
- brick: eo-button
  properties:
    textContent: 打开抽屉
  events:
    click:
      - target: "#controlled-drawer"
        method: open
- brick: data-view.tabs-drawer
  properties:
    id: controlled-drawer
    style:
      height: 500px
      display: block
    tabList:
      - tooltip: 信息
        key: info
        icon:
          lib: antd
          icon: info-circle
    zIndex: 100
  slots:
    info:
      type: bricks
      bricks:
        - brick: div
          properties:
            textContent: 抽屉内容区域
            style:
              padding: 16px
  events:
    open:
      - action: console.log
    close:
      - action: console.log
```
