---
tagName: data-view.tabs-drawer
displayName: WrappedDataViewTabsDrawer
description: 大屏仪标签页抽屉
category: big-screen-layout
source: "@next-bricks/data-view"
---

# WrappedDataViewTabsDrawer

> 大屏仪标签页抽屉

## 导入

```tsx
import { WrappedDataViewTabsDrawer } from "@easyops/wrapped-components";
```

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

| 事件        | detail                             | 说明                                                          |
| ----------- | ---------------------------------- | ------------------------------------------------------------- |
| onOpen      | `void`                             | 抽屉打开事件                                                  |
| onClose     | `void`                             | 抽屉关闭事件                                                  |
| onTabChange | `string` — 切换后激活的 tab 的 key | 切换 `tab` 栏会触发的事件，`detail` 为目标 `tab` 对应的 `key` |

## Methods

| 方法  | 参数         | 返回值 | 说明     |
| ----- | ------------ | ------ | -------- |
| open  | `() => void` | `void` | 打开抽屉 |
| close | `() => void` | `void` | 关闭抽屉 |

## Examples

### Basic

展示带有三个标签页的基础抽屉，默认展开并高亮第一个标签。

```tsx
<WrappedDataViewTabsDrawer
  activeKey="search"
  visible={true}
  width={800}
  style={{ height: "600px", display: "block" }}
  tabList={[
    {
      tooltip: "搜索",
      key: "search",
      icon: { lib: "fa", icon: "search", prefix: "fas" },
    },
    {
      tooltip: "内容",
      key: "app",
      icon: {
        lib: "easyops",
        category: "app",
        icon: "micro-app-configuration",
      },
    },
    {
      tooltip: "图表",
      key: "chart",
      icon: { lib: "fa", icon: "ad", prefix: "fas" },
    },
  ]}
  onClose={(e) => console.log(e)}
  onTabChange={(e) => console.log(e.detail)}
>
  <div
    slot="search"
    style={{ padding: "0 16px", height: "100px", background: "red" }}
  >
    测试
  </div>
  <div slot="app" style={{ background: "yellow", height: "100px" }}>
    内容区域
  </div>
  <div slot="chart" style={{ background: "green", height: "100px" }}>
    图表区域
  </div>
</WrappedDataViewTabsDrawer>
```

### Method Control

通过调用 open/close 方法程序化控制抽屉的展开与收起。

```tsx
const drawerRef = useRef<any>();

<button onClick={() => drawerRef.current?.open()}>打开抽屉</button>
<WrappedDataViewTabsDrawer
  ref={drawerRef}
  style={{ height: "500px", display: "block" }}
  tabList={[
    { tooltip: "信息", key: "info", icon: { lib: "antd", icon: "info-circle" } },
  ]}
  zIndex={100}
  onOpen={(e) => console.log(e)}
  onClose={(e) => console.log(e)}
>
  <div slot="info" style={{ padding: "16px" }}>抽屉内容区域</div>
</WrappedDataViewTabsDrawer>
```
