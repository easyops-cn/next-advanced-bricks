---
tagName: visual-builder.workbench-action
displayName: WrappedVisualBuilderWorkbenchAction
description: 工作台侧边栏操作按钮，显示图标链接并在右侧显示 tooltip
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderWorkbenchAction

> 工作台侧边栏操作按钮，显示图标链接并在右侧显示 tooltip

## 导入

```tsx
import { WrappedVisualBuilderWorkbenchAction } from "@easyops/wrapped-components";
```

## Props

| 属性    | 类型               | 必填 | 默认值 | 说明                     |
| ------- | ------------------ | ---- | ------ | ------------------------ |
| icon    | `GeneralIconProps` | 否   | -      | 按钮图标配置             |
| to      | `string`           | 否   | -      | 路由跳转地址             |
| active  | `boolean`          | 否   | -      | 是否处于激活状态         |
| href    | `string`           | 否   | -      | 外部链接地址             |
| target  | `string`           | 否   | -      | 链接打开方式             |
| tooltip | `string`           | 否   | -      | 鼠标悬停时显示的提示文字 |

## Examples

### Basic

显示一个带有图标和 tooltip 的侧边栏操作按钮。

```tsx
<WrappedVisualBuilderWorkbenchAction
  icon={{ lib: "antd", icon: "home", theme: "outlined" }}
  to="/home"
  tooltip="首页"
/>
```

### 激活状态

通过 active 属性控制按钮的高亮激活状态。

```tsx
<>
  <WrappedVisualBuilderWorkbenchAction
    icon={{ lib: "antd", icon: "setting", theme: "outlined" }}
    to="/settings"
    active={true}
    tooltip="设置"
  />
  <WrappedVisualBuilderWorkbenchAction
    icon={{ lib: "antd", icon: "user", theme: "outlined" }}
    to="/profile"
    active={false}
    tooltip="个人中心"
  />
</>
```

### 外部链接

使用 href 和 target 配置跳转到外部地址。

```tsx
<WrappedVisualBuilderWorkbenchAction
  icon={{ lib: "antd", icon: "link", theme: "outlined" }}
  href="https://example.com"
  target="_blank"
  tooltip="外部链接"
/>
```
