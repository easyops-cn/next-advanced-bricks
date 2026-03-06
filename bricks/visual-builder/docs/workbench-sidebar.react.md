---
tagName: visual-builder.workbench-sidebar
displayName: WrappedVisualBuilderWorkbenchSidebar
description: 工作台侧边栏容器，包含标题栏和面板容器，自动管理子面板（workbench-pane）的展开/折叠布局
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderWorkbenchSidebar

> 工作台侧边栏容器，包含标题栏和面板容器，自动管理子面板（workbench-pane）的展开/折叠布局

## 导入

```tsx
import { WrappedVisualBuilderWorkbenchSidebar } from "@easyops/wrapped-components";
```

## Props

| 属性       | 类型     | 必填 | 默认值 | 说明           |
| ---------- | -------- | ---- | ------ | -------------- |
| titleLabel | `string` | 否   | -      | 侧边栏标题文本 |

## Slots

| 名称         | 说明                       |
| ------------ | -------------------------- |
| titleToolbar | 标题栏右侧工具栏区域       |
| (default)    | 放置 workbench-pane 子面板 |

## Examples

### Basic

展示包含多个可折叠面板的侧边栏容器，子面板会自动响应展开/折叠状态调整布局。

```tsx
<WrappedVisualBuilderWorkbenchSidebar titleLabel="工作区">
  <WrappedVisualBuilderWorkbenchPane titleLabel="资源列表" active={true}>
    <div style={{ padding: "16px" }}>资源内容区域</div>
  </WrappedVisualBuilderWorkbenchPane>
  <WrappedVisualBuilderWorkbenchPane titleLabel="属性面板" active={false}>
    <div style={{ padding: "16px" }}>属性内容区域</div>
  </WrappedVisualBuilderWorkbenchPane>
</WrappedVisualBuilderWorkbenchSidebar>
```

### 带标题栏工具栏

在侧边栏标题栏右侧添加操作按钮。

```tsx
<WrappedVisualBuilderWorkbenchSidebar titleLabel="组件树">
  <WrappedEoButton
    slot="titleToolbar"
    icon={{ lib: "antd", icon: "plus", theme: "outlined" }}
    type="text"
    size="small"
    tooltip="新增节点"
  />
  <WrappedVisualBuilderWorkbenchPane titleLabel="页面结构" active={true}>
    <div style={{ padding: "16px" }}>页面结构树</div>
  </WrappedVisualBuilderWorkbenchPane>
</WrappedVisualBuilderWorkbenchSidebar>
```
