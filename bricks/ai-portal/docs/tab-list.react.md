---
tagName: ai-portal.tab-list
displayName: WrappedAiPortalTabList
description: 标签页列表构件，展示可切换的标签页，点击后触发事件并自动更新选中状态。
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalTabList

> 标签页列表构件，展示可切换的标签页，点击后触发事件并自动更新选中状态。

## 导入

```tsx
import { WrappedAiPortalTabList } from "@easyops/wrapped-components";
```

## Props

| 属性      | 类型     | 必填 | 默认值 | 说明                                 |
| --------- | -------- | ---- | ------ | ------------------------------------ |
| tabs      | `Tab[]`  | 否   | -      | 标签页配置列表，每项包含 id 和 label |
| activeTab | `string` | 否   | -      | 当前激活的标签页 id                  |

## Events

| 事件       | detail                                      | 说明                                     |
| ---------- | ------------------------------------------- | ---------------------------------------- |
| onTabClick | `Tab` — { id: 标签页ID, label: 标签页标题 } | 点击标签页时触发，同时自动更新 activeTab |

## CSS Parts

| 名称 | 说明                   |
| ---- | ---------------------- |
| tabs | The tab list container |
| tab  | The individual tab     |

## Examples

### 基础使用

展示可切换的标签页列表，点击后自动切换选中状态。

```tsx
<WrappedAiPortalTabList
  tabs={[
    { id: "all", label: "全部" },
    { id: "host", label: "主机故障排查" },
    { id: "inspect", label: "主机巡检" },
  ]}
  activeTab="all"
  onTabClick={(e) => console.log("标签点击:", e.detail)}
/>
```

### 与内容联动

结合 useState，点击标签页时切换显示对应内容。

```tsx
const [activeTab, setActiveTab] = useState("tab1");

<WrappedAiPortalTabList
  tabs={[
    { id: "tab1", label: "Tab 1" },
    { id: "tab2", label: "Tab 2" },
  ]}
  activeTab={activeTab}
  onTabClick={(e) => setActiveTab(e.detail.id)}
/>
<div style={{ padding: "16px" }}>当前 Tab: {activeTab === "tab1" ? "Tab 1" : "Tab 2"}</div>
```
