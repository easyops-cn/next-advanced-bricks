---
tagName: eo-search
displayName: WrappedEoSearch
description: 搜索框
category: interact-basic
source: "@next-bricks/form"
---

# WrappedEoSearch

> 搜索框

## 导入

```tsx
import { WrappedEoSearch } from "@easyops/wrapped-components";
```

## Props

| 属性         | 类型                   | 必填 | 默认值 | 说明                     |
| ------------ | ---------------------- | ---- | ------ | ------------------------ |
| value        | `string`               | 是   | `""`   | 搜索框的值               |
| placeholder  | `string`               | 否   | -      | 提示语                   |
| autoFocus    | `boolean`              | 否   | -      | 是否自动聚焦             |
| clearable    | `boolean`              | 否   | -      | 可以点击清除图标删除内容 |
| trim         | `boolean`              | 否   | -      | 是否剔除前后空格         |
| debounceTime | `number`               | 是   | `0`    | 默认延迟时间             |
| inputStyle   | `React.CSSProperties`  | 否   | -      | 输入框样式               |
| themeVariant | `"default" \| "elevo"` | 否   | -      | 主题变体                 |

## Events

| 事件     | detail                | 说明                           |
| -------- | --------------------- | ------------------------------ |
| onChange | `string` — 当前输入值 | 输入的搜索字符，输入变化时触发 |
| onSearch | `string` — 搜索关键词 | 搜索时触发                     |

## Examples

### Basic

展示搜索框的最基本用法，配合 `placeholder`、`clearable` 和 `trim` 属性，并监听 `onChange` 和 `onSearch` 事件。

```tsx
<WrappedEoSearch
  placeholder="请输入"
  clearable
  trim
  onChange={(e) => console.log(e.detail)}
  onSearch={(e) => console.log(e.detail)}
/>
```

### Value

通过 `value` 属性设置搜索框的默认值。

```tsx
<WrappedEoSearch value="默认搜索词" placeholder="请输入" />
```

### AutoFocus

设置 `autoFocus` 属性使搜索框在页面加载后自动获取焦点。

```tsx
<WrappedEoSearch autoFocus placeholder="自动聚焦" />
```

### Debounce

通过 `debounceTime` 属性设置 `onChange` 事件的防抖延迟时间（毫秒），减少频繁触发。

```tsx
<WrappedEoSearch
  placeholder="防抖 500ms"
  debounceTime={500}
  onChange={(e) => console.log(e.detail)}
/>
```

### Input Style

通过 `inputStyle` 属性自定义搜索框的内联样式。

```tsx
<WrappedEoSearch placeholder="自定义样式" inputStyle={{ width: "300px" }} />
```

### Theme Variant

通过 `themeVariant` 属性切换搜索框的主题变体，支持 `default` 和 `elevo`。

```tsx
<WrappedEoSearch placeholder="elevo 主题" themeVariant="elevo" />
```

### Events

使用 `useState` 管理搜索状态，同时监听 `onChange` 实时更新输入值和 `onSearch` 触发搜索。

```tsx
function SearchExample() {
  const [searchValue, setSearchValue] = React.useState("");
  const [result, setResult] = React.useState("");

  return (
    <div>
      <WrappedEoSearch
        value={searchValue}
        placeholder="请输入搜索内容"
        clearable
        trim
        onChange={(e) => setSearchValue(e.detail)}
        onSearch={(e) => setResult(e.detail)}
      />
      {result && <p>搜索关键词：{result}</p>}
    </div>
  );
}
```
