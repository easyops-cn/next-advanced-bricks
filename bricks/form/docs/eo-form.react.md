---
tagName: eo-form
displayName: WrappedEoForm
description: 表单构件
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoForm

> 表单构件

## 导入

```tsx
import { WrappedEoForm } from "@easyops/wrapped-components";
```

## Props

| 属性                      | 类型                      | 必填 | 默认值                                                                                          | 说明                                                                    |
| ------------------------- | ------------------------- | ---- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| staticValues              | `Record<string, unknown>` | 否   | -                                                                                               | 静态附加值，在表单验证成功时会合并到 onValidateSuccess 事件的 detail 中 |
| layout                    | `Layout`                  | 否   | `"vertical"`                                                                                    | 布局方式，可选值为 `vertical`、`horizontal`、`inline`                   |
| size                      | `ComponentSize`           | 否   | -                                                                                               | 表单组件尺寸                                                            |
| labelCol                  | `ColProps`                | 否   | `{ sm: { span: 24 }, md: { span: 24 }, lg: { span: 7 }, xl: { span: 5 }, xxl: { span: 4 } }`    | 标签列布局样式（仅当 layout="horizontal" 时有效）                       |
| wrapperCol                | `ColProps`                | 否   | `{ sm: { span: 18 }, md: { span: 18 }, lg: { span: 13 }, xl: { span: 16 }, xxl: { span: 18 } }` | 输入控件列布局样式（仅当 layout="horizontal" 时有效）                   |
| autoScrollToInvalidFields | `boolean`                 | 否   | -                                                                                               | 是否在验证失败时自动滚动到第一个错误字段                                |
| formStyle                 | `React.CSSProperties`     | 否   | -                                                                                               | 表单自定义样式                                                          |

## Events

| 事件              | detail                                                                                           | 说明                   |
| ----------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| onValuesChange    | `Record<string, unknown>` — 当前所有表单字段的值                                                 | 表单值变更事件         |
| onValidateSuccess | `Record<string, unknown>` — 表单所有字段的值，包含合并后的 staticValues                          | 表单验证成功时触发事件 |
| onValidateError   | `(MessageBody & { name: string })[]` — 校验失败的字段信息列表，每项包含 name（字段名）及错误消息 | 表单验证报错时触发事件 |

## Methods

| 方法               | 参数                                                                                                                                                                                                                                 | 返回值                               | 说明                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------ |
| validate           | -                                                                                                                                                                                                                                    | `boolean \| Record<string, unknown>` | 表单校验方法，校验通过触发 onValidateSuccess 事件，校验失败触发 onValidateError 事件 |
| setInitValue       | <ul><li>`values: Record<string, unknown>` - 要设置的表单字段值</li><li>`options?: { runInMacrotask?: boolean; runInMicrotask?: boolean }` - 可选配置，支持 runInMicrotask（微任务中执行）和 runInMacrotask（宏任务中执行）</li></ul> | `void`                               | 表单设置值方法                                                                       |
| resetFields        | <ul><li>`name?: string` - 要重置的字段名，不传则重置所有字段</li></ul>                                                                                                                                                               | `void`                               | 表单重置值方法                                                                       |
| getFieldsValue     | <ul><li>`name?: string` - 要获取的字段名，不传则获取所有字段的值</li></ul>                                                                                                                                                           | `Record<string, unknown> \| unknown` | 获取表单值方法                                                                       |
| validateField      | <ul><li>`name: string` - 要校验的字段名</li></ul>                                                                                                                                                                                    | `void`                               | 校验表单字段方法                                                                     |
| resetValidateState | -                                                                                                                                                                                                                                    | `void`                               | 重置表单校验状态方法                                                                 |

## Slots

| 名称     | 说明     |
| -------- | -------- |
| （默认） | 表单内容 |

## Examples

### Layout

展示 inline、horizontal、vertical 三种布局方式的表单。

```tsx
<>
  <WrappedEoForm layout="inline">
    <WrappedEoInput label="input" />
    <WrappedEoSelect label="select" />
  </WrappedEoForm>
  <div style={{ height: 1, background: "#abc", margin: "20px 0" }} />
  <WrappedEoForm layout="horizontal">
    <WrappedEoInput label="input" />
    <WrappedEoSelect label="select" />
  </WrappedEoForm>
  <div style={{ height: 1, background: "#abc", margin: "20px 0" }} />
  <WrappedEoForm layout="vertical">
    <WrappedEoInput label="input" />
    <WrappedEoSelect label="select" />
  </WrappedEoForm>
</>
```

### Values

通过 `values` 属性为表单字段设置初始值。

```tsx
<WrappedEoForm
  values={{
    input: "This is default value",
    select: "Beijing",
    radio: "Guangzhou",
    checkbox: ["C", "D"],
    textarea: "Hello World! \nNice to see you!",
    dynamicForm: [
      { input: "beijing", select: "Guangzhou" },
      { input: "shenzhen", select: "Shenzhen" },
    ],
  }}
>
  <WrappedEoInput label="input" name="input" />
  <WrappedEoSelect
    label="select"
    name="select"
    options={["Beijing", "Shanghai"]}
  />
  <WrappedEoRadio
    label="radio"
    name="radio"
    options={["Guangzhou", "Shenzhen"]}
  />
  <WrappedEoCheckbox
    name="checkbox"
    label="checkbox"
    options={["A", "B", "C", "D"]}
  />
  <WrappedEoTextarea
    name="textarea"
    label="textarea"
    autoSize={{ minRows: 3 }}
  />
  <WrappedEoDynamicFormItem
    label="dynamic-form"
    name="dynamicForm"
    useBrick={[
      { brick: "eo-input", properties: { name: "input" } },
      {
        brick: "eo-select",
        properties: {
          name: "select",
          options: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"],
        },
      },
    ]}
  />
</WrappedEoForm>
```

### Events

监听 onValuesChange、onValidateSuccess、onValidateError 事件响应表单交互。

```tsx
<WrappedEoForm
  onValuesChange={(e) => console.log(e.detail)}
  onValidateSuccess={(e) => message.success("表单提交成功")}
  onValidateError={(e) => message.error("表单校验失败")}
>
  <WrappedEoInput
    required
    name="name"
    label="姓名"
    max={6}
    min={2}
    message={{
      required: "一定要填写姓名哟",
      max: "不能超过 6 个字符哟",
      min: "最少填写 2 个字符哟",
    }}
  />
  <WrappedEoSelect
    required
    name="sex"
    label="性别"
    options={[
      { label: "男", value: 0 },
      { label: "女", value: 1 },
    ]}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Methods

通过方法调用实现表单校验、赋值、重置、取值及字段级校验等操作。

```tsx
const formRef = useRef<any>();

<>
  <WrappedEoForm ref={formRef} autoScrollToInvalidFields>
    <WrappedEoInput required name="name" label="姓名" max={6} min={2} />
    <WrappedEoSelect
      required
      name="sex"
      label="性别"
      options={[
        { label: "男", value: 0 },
        { label: "女", value: 1 },
      ]}
    />
  </WrappedEoForm>
  <button onClick={() => formRef.current?.validate()}>validate</button>
  <button
    onClick={() => formRef.current?.setInitValue({ name: "Mike", sex: 0 })}
  >
    setInitValue
  </button>
  <button onClick={() => formRef.current?.resetFields()}>resetFields</button>
  <button onClick={() => formRef.current?.resetFields("name")}>
    resetFields(name)
  </button>
  <button onClick={() => console.log(formRef.current?.getFieldsValue())}>
    getFieldsValue
  </button>
  <button onClick={() => console.log(formRef.current?.getFieldsValue("name"))}>
    getFieldsValue(name)
  </button>
  <button onClick={() => formRef.current?.validateField("name")}>
    validateField(name)
  </button>
  <button onClick={() => formRef.current?.resetValidateState()}>
    resetValidateState
  </button>
</>;
```

### Static Values

通过 staticValues 为验证成功事件附加额外的静态字段。

```tsx
<WrappedEoForm
  staticValues={{ source: "web", version: "1.0" }}
  onValidateSuccess={(e) => console.log(e.detail)}
>
  <WrappedEoInput name="username" label="用户名" required />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Custom Style

通过 formStyle 自定义表单容器样式。

```tsx
<WrappedEoForm
  layout="vertical"
  formStyle={{
    gap: "16px",
    padding: "16px",
    background: "#f5f5f5",
    borderRadius: "8px",
  }}
>
  <WrappedEoInput name="username" label="用户名" />
  <WrappedEoSelect
    name="city"
    label="城市"
    options={["北京", "上海", "深圳"]}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Horizontal Layout with Column Config

使用 horizontal 布局并自定义 labelCol 和 wrapperCol 比例。

```tsx
<WrappedEoForm
  layout="horizontal"
  labelCol={{ span: 6 }}
  wrapperCol={{ span: 18 }}
  size="large"
>
  <WrappedEoInput name="name" label="姓名" />
  <WrappedEoInput name="email" label="邮箱" />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Theme variant Elevo

在 Elevo 主题下展示表单的视觉效果。

```tsx
<WrappedAiPortalHomeContainer
  style={{ padding: "2em", backgroundColor: "#d8d8d8" }}
>
  <WrappedEoForm
    themeVariant="elevo"
    layout="vertical"
    values={{ city: "深圳", public: true, tags: ["活泼"] }}
    onValidateSuccess={(e) => {
      // show dialog
    }}
  >
    <WrappedEoInput
      label="名称"
      name="name"
      themeVariant="elevo"
      placeholder="请输入"
    />
    <WrappedEoTextarea
      label="说明"
      name="desc"
      themeVariant="elevo"
      placeholder="请输入"
    />
    <WrappedEoSelect
      label="类型"
      name="type"
      themeVariant="elevo"
      placeholder="请选择"
      options={["默认", "其他"]}
    />
    <WrappedEoRadio
      label="城市"
      name="city"
      type="button"
      themeVariant="elevo"
      options={["北京", "上海", "深圳"]}
    />
    <WrappedEoCheckbox
      label="标签"
      name="tags"
      themeVariant="elevo"
      options={["活泼", "开朗", "好动"]}
    />
    <WrappedEoSwitch label="公开" name="public" themeVariant="elevo" />
    <WrappedEoSubmitButtons
      themeVariant="elevo"
      submitText="提交"
      cancelText="取消"
      submitType="primary"
      cancelType="default"
    />
  </WrappedEoForm>
</WrappedAiPortalHomeContainer>
```
