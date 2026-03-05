---
tagName: ai-portal.tab-list
displayName: WrappedAiPortalTabList
description: 标签页列表构件，展示可切换的标签页，点击后触发事件并自动更新选中状态。
category: ""
source: "@next-bricks/ai-portal"
---

# ai-portal.tab-list

> 标签页列表构件，展示可切换的标签页，点击后触发事件并自动更新选中状态。

## Props

| 属性      | 类型     | 必填 | 默认值 | 说明                                 |
| --------- | -------- | ---- | ------ | ------------------------------------ |
| tabs      | `Tab[]`  | 否   | -      | 标签页配置列表，每项包含 id 和 label |
| activeTab | `string` | 否   | -      | 当前激活的标签页 id                  |

## Events

| 事件      | detail                                      | 说明                                     |
| --------- | ------------------------------------------- | ---------------------------------------- |
| tab.click | `Tab` — { id: 标签页ID, label: 标签页标题 } | 点击标签页时触发，同时自动更新 activeTab |

## CSS Parts

| 名称 | 说明                   |
| ---- | ---------------------- |
| tabs | The tab list container |
| tab  | The individual tab     |

## Examples

### 基础使用

展示可切换的标签页列表，点击后自动切换选中状态。

```yaml preview
brick: ai-portal.tab-list
properties:
  tabs:
    - id: "all"
      label: "全部"
    - id: "host"
      label: "主机故障排查"
    - id: "inspect"
      label: "主机巡检"
  activeTab: "all"
events:
  tab.click:
    action: console.log
    args:
      - "标签点击:"
      - "<% EVENT.detail %>"
```

### 与内容联动

结合事件监听，点击标签页时切换显示对应内容（通过 target 更新属性）。

```yaml preview
- brick: ai-portal.tab-list
  properties:
    tabs:
      - id: "tab1"
        label: "Tab 1"
      - id: "tab2"
        label: "Tab 2"
    activeTab: "tab1"
  events:
    tab.click:
      target: "#content"
      properties:
        textContent: "<% '当前 Tab: ' + EVENT.detail.label %>"
- brick: div
  id: content
  properties:
    textContent: "当前 Tab: Tab 1"
    style:
      padding: "16px"
```
