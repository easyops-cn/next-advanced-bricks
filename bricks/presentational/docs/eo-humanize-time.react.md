---
tagName: eo-humanize-time
displayName: WrappedEoHumanizeTime
description: 人性化时间展示，可显示完整时间、相对时间、未来时间、耗时等，支持自定义输入值格式和输出格式。
category: ""
source: "@next-bricks/presentational"
---

# WrappedEoHumanizeTime

> 人性化时间展示，可显示完整时间、相对时间、未来时间、耗时等，支持自定义输入值格式和输出格式。

## 导入

```tsx
import { WrappedEoHumanizeTime } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型                                                                              | 必填 | 默认值       | 说明                                                                                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------- | ---- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value         | `number \| string`                                                                | 是   | -            | 时间戳（秒或毫秒，由 `isMillisecond` 决定），或时间字符串（字符串类型时应提供 `inputFormat`）                                                                                             |
| formatter     | `"full" \| "default" \| "relative" \| "past" \| "future" \| "accurate" \| "auto"` | 否   | `"auto"`     | 格式类型：`"full"` 完整时间、`"default"` 自动相对/完整、`"relative"` 相对时间（支持过去和未来）、`"past"` 仅过去相对时间、`"future"` 仅未来相对时间、`"accurate"` 精确耗时、`"auto"` 自动 |
| isMillisecond | `boolean`                                                                         | 否   | `false`      | `value` 值的单位是否为毫秒，默认将 `value` 视为秒级时间戳                                                                                                                                 |
| isCostTime    | `boolean`                                                                         | 否   | `false`      | 是否展示为耗费时间，例如：'1 个月 20 天'                                                                                                                                                  |
| inputFormat   | `string`                                                                          | 否   | -            | 字符串类型 `value` 的解析格式，如 `"YYYY-MM-DD"`，[时间格式参照表](https://momentjs.com/docs/#/parsing/string-format/)                                                                    |
| outputFormat  | `string`                                                                          | 否   | -            | 自定义输出格式，如 `"YYYY-MM-DD HH:mm:ss"`，设置后 `formatter` 属性无效，[时间格式参照表](https://momentjs.com/docs/#/displaying/format/)                                                 |
| type          | `"datetime" \| "date"`                                                            | 否   | `"datetime"` | 使用日期+时间格式输出还是仅日期                                                                                                                                                           |
| link          | `LinkInfo`                                                                        | 否   | -            | 将时间显示为可点击链接，`LinkInfo` — { url: 链接地址, target: 打开方式 }                                                                                                                  |
| isMicrosecond | `boolean`                                                                         | 否   | -            | **已废弃**，请使用 `isMillisecond`                                                                                                                                                        |

## Examples

### Basic

使用默认格式展示一个秒级时间戳。

```tsx preview
<WrappedEoHumanizeTime value={1714026348} />
```

### 完整时间

使用 `formatter="full"` 展示精确的完整时间。

```tsx preview
<WrappedEoHumanizeTime formatter="full" value={1714026348} />
```

### 精确时间

使用 `formatter="accurate"` 展示精确的相对耗时。

```tsx preview
<WrappedEoHumanizeTime formatter="accurate" value={1714026348} />
```

### 相对时间

使用毫秒级时间戳和 `formatter="relative"` 展示相对时间（如"3 天前"）。

```tsx preview
<WrappedEoHumanizeTime
  formatter="relative"
  isMillisecond={true}
  value={1714026348000}
/>
```

### 耗时展示

使用 `isCostTime` 将时间戳转换为易读的耗时格式（如"1 个月 20 天"）。

```tsx preview
<WrappedEoHumanizeTime isCostTime={true} value={1000} />
```

### 仅日期

使用 `type="date"` 只展示日期部分，不展示时间。

```tsx preview
<WrappedEoHumanizeTime formatter="full" type="date" value={1714026348} />
```

### 自定义格式

通过 `inputFormat` 解析字符串输入，通过 `outputFormat` 自定义展示格式。

```tsx preview
<WrappedEoHumanizeTime
  inputFormat="YYYY-MM-DD"
  outputFormat="LLL"
  value="2020-02-27 16:36"
/>
```

### 链接

设置 `link` 将时间文本渲染为可点击链接。

```tsx preview
<WrappedEoHumanizeTime
  formatter="full"
  link={{ url: "/aaa/bbb", target: "_blank" }}
  value={1714026348}
/>
```
