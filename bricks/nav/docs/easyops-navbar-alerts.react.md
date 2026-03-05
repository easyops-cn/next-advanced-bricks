---
tagName: nav.easyops-navbar-alerts
displayName: WrappedNavEasyopsNavbarAlerts
description: 导航栏告警提示组件，用于显示 License 到期提醒和页面性能问题警告。
category: ""
source: "@next-bricks/nav"
---

# WrappedNavEasyopsNavbarAlerts

> 导航栏告警提示组件，用于显示 License 到期提醒和页面性能问题警告。

## 导入

```tsx
import { WrappedNavEasyopsNavbarAlerts } from "@easyops/wrapped-components";
```

此构件为内部构件（@insider），主要在导航栏中使用，自动检测 License 剩余天数（不足 15 天时显示提示）和页面渲染性能问题，无需传入任何属性。

## Examples

### Basic

在导航栏中嵌入告警提示组件，自动展示 License 到期和性能问题告警。

```tsx
<WrappedNavEasyopsNavbarAlerts />
```
