---
tagName: eo-switch
displayName: WrappedEoSwitch
description: 开关
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoSwitch

> 开关

## 导入

```ts
import { WrappedEoSwitch } from "@next-bricks/form/eo-switch";
```

## Props

| 属性          | 类型                   | 必填 | 默认值 | 说明                                         |
| ------------- | ---------------------- | ---- | ------ | -------------------------------------------- |
| name          | `string`               | 否   | -      | 字段名称                                     |
| label         | `string`               | 否   | -      | 字段文本                                     |
| value         | `boolean`              | 否   | -      | 初始值                                       |
| disabled      | `boolean`              | 否   | -      | 是否禁用                                     |
| size          | `ComponentSize`        | 否   | -      | 按钮大小，目前只支持small和非small两种大小。 |
| checkedText   | `string`               | 否   | -      | 选中时的文本                                 |
| unCheckedText | `string`               | 否   | -      | 非选中时的文本                               |
| checkedIcon   | `GeneralIconProps`     | 否   | -      | 选中时的图标                                 |
| unCheckedIcon | `GeneralIconProps`     | 否   | -      | 非选中时的图标                               |
| themeVariant  | `"default" \| "elevo"` | 否   | -      | 主题变体                                     |

## Events

| 事件     | detail                                                  | 说明           |
| -------- | ------------------------------------------------------- | -------------- |
| onSwitch | `boolean` — 开关当前状态，true 表示开启，false 表示关闭 | 开关改变时触发 |

## Examples

### Basic

```tsx preview
<WrappedEoSwitch disabled={false} onSwitch={(value) => console.log(value)} />
```

### Label

```tsx preview
<WrappedEoSwitch
  disabled={false}
  label="switch"
  onSwitch={(value) => console.log(value)}
/>
```

### Value

通过 `value` 属性设置开关的初始状态。

```tsx preview
<WrappedEoSwitch value={true} label="switch" />
```

### Disabled

```tsx preview
<WrappedEoSwitch disabled={true} value={true} label="switch" />
```

### Size

```tsx preview
<WrappedEoSwitch disabled={false} value={true} label="switch" size="small" />
```

### Customizations

通过 `checkedText`、`unCheckedText`、`checkedIcon`、`unCheckedIcon` 属性自定义开关的文本和图标。

```tsx preview
<WrappedEoSwitch
  checkedText="123"
  unCheckedText="456"
  disabled={false}
  size="small"
  label="text"
  checkedIcon={{ icon: "plus-circle", lib: "antd", theme: "outlined" }}
  unCheckedIcon={{ icon: "plus-circle", lib: "antd" }}
/>
```

### Theme Variant

```tsx preview
<WrappedEoSwitch themeVariant="elevo" label="switch" value={true} />
```

### Event

```tsx preview
function Demo() {
  const [switchValue, setSwitchValue] = useState(false);
  return (
    <div>
      <WrappedEoSwitch
        disabled={false}
        onSwitch={(value) => {
          console.log(value);
          setSwitchValue(value);
        }}
      />
      <p>当前状态: {switchValue ? "开启" : "关闭"}</p>
    </div>
  );
}
```

### With Form

```tsx preview
function Demo() {
  const formRef = useRef(null);
  return (
    <WrappedEoForm
      ref={formRef}
      onValidateSuccess={(values) => console.log(values)}
      onValuesChange={(values) => console.log(values)}
    >
      <WrappedEoSwitch name="switch" label="开关" />
      <WrappedEoSubmitButtons />
    </WrappedEoForm>
  );
}
```
