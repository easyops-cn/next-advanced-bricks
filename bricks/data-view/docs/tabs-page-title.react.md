---
tagName: data-view.tabs-page-title
displayName: WrappedDataViewTabsPageTitle
description: 带有tabs的标题构件
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewTabsPageTitle

> 带有tabs的标题构件

## 导入

```tsx
import { WrappedDataViewTabsPageTitle } from "@easyops/wrapped-components";
```

## Props

| 属性      | 类型         | 必填 | 默认值 | 说明                       |
| --------- | ------------ | ---- | ------ | -------------------------- |
| tabList   | `TabsItem[]` | 是   | -      | 标签，如果没有就不展示标签 |
| activeKey | `string`     | 是   | -      | 标签高亮显示，默认第一个   |

## Events

| 事件        | detail                             | 说明                                                          |
| ----------- | ---------------------------------- | ------------------------------------------------------------- |
| onTabChange | `string` — 切换后激活的 tab 的 key | 切换 `tab` 栏会触发的事件，`detail` 为目标 `tab` 对应的 `key` |

## Slots

| 名称      | 说明                       |
| --------- | -------------------------- |
| (default) | 默认插槽，用于放置标题内容 |
| start     | 顶部左边插槽               |
| end       | 顶部右边插槽               |
| [key]     | 标签对应的key的插槽        |

## Examples

### Basic

展示带有标题和顶部工具栏的页面标题构件（无标签页）。

```tsx
<WrappedDataViewTabsPageTitle>
  <WrappedDataViewTitleText slot="" text="大标题" type="gradient" />
  <WrappedDataViewBrickNotification
    slot="start"
    message="This is the content of the notification."
  />
  <div slot="end" style={{ fontSize: "16px", color: "#fff" }}>
    2022/11/30 17:25 星期四
  </div>
</WrappedDataViewTabsPageTitle>
```

### TabList

展示带有多个标签页的页面标题构件，支持通过 activeKey 指定初始激活标签。

```tsx
const [activeKey, setActiveKey] = useState("key2");

<WrappedDataViewTabsPageTitle
  tabList={[
    { text: "标签1", key: "key1" },
    { text: "标签2", key: "key2" },
    { text: "标签3", key: "key3" },
    { text: "标签4", key: "key4" },
    { text: "标签5", key: "key5" },
    { text: "标签6", key: "key6" },
  ]}
  activeKey={activeKey}
  onTabChange={(e) => setActiveKey(e.detail)}
>
  <WrappedDataViewTitleText slot="" text="大标题" type="gradient" />
  <div slot="key1">标签一内容</div>
  <div slot="key2">标签二内容</div>
  <div slot="key3">标签三内容</div>
  <div slot="key4">标签四内容</div>
  <div slot="key5">标签五内容</div>
  <div slot="key6">标签六内容</div>
</WrappedDataViewTabsPageTitle>;
```
