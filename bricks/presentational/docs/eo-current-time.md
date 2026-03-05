---
tagName: eo-current-time
displayName: EoCurrentTime
description: 实时当前时间展示构件，每秒自动刷新，支持自定义时间格式和前置图标。
category: ""
source: "@next-bricks/presentational"
---

# eo-current-time

> 实时当前时间展示构件，每秒自动刷新，支持自定义时间格式和前置图标。

## Props

| 属性   | 类型                            | 必填 | 默认值                  | 说明                                |
| ------ | ------------------------------- | ---- | ----------------------- | ----------------------------------- |
| format | `string`                        | 是   | `"YYYY-MM-DD HH:mm:ss"` | 时间格式，使用 moment.js 格式字符串 |
| icon   | `GeneralIconProps \| undefined` | 否   | -                       | 前置图标，仅在时间已渲染后显示      |

## Examples

### Basic

使用默认时间格式展示当前时间，每秒自动刷新。

```yaml preview
brick: eo-current-time
properties:
  format: "YYYY-MM-DD HH:mm:ss"
```

### With Icon

在时间前面展示一个图标，图标仅在时间渲染后可见。

```yaml preview
brick: eo-current-time
properties:
  format: "YYYY-MM-DD HH:mm:ss"
  icon:
    lib: easyops
    category: itsc-form
    icon: time
```

### Custom Format

使用自定义格式只展示时分秒。

```yaml preview
brick: eo-current-time
properties:
  format: "HH:mm:ss"
```
