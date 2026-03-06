---
tagName: diagram.editable-label
displayName: WrappedDiagramEditableLabel
description: 可编辑标签构件，用于在图表连线或节点上展示可双击编辑的文本标签，支持只读模式，常配合 `eo-draw-canvas` 和 `eo-diagram` 使用。
category: diagram
source: "@next-bricks/diagram"
---

# WrappedDiagramEditableLabel

> 可编辑标签构件，用于在图表连线或节点上展示可双击编辑的文本标签，支持只读模式，常配合 `eo-draw-canvas` 和 `eo-diagram` 使用。

## 导入

```tsx
import { WrappedDiagramEditableLabel } from "@easyops/wrapped-components";
```

## Props

| 属性                 | 类型                                | 必填 | 默认值 | 说明                                                                                                                           |
| -------------------- | ----------------------------------- | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| label                | `string \| undefined`               | -    | -      | 标签文本内容。                                                                                                                 |
| type                 | `LabelType \| undefined`            | -    | -      | 标签类型，`line` 用于连线标签样式，`default` 为默认节点标签样式，影响外观渲染（使用 `render: false` 仅更新属性不触发重渲染）。 |
| readOnly             | `boolean \| undefined`              | -    | -      | 是否为只读模式，启用后双击不会进入编辑状态，`enableEditing` 方法调用也不会生效。                                               |
| onLabelEditingChange | `(e: CustomEvent<boolean>) => void` | -    | -      | 标签编辑状态变化时触发。                                                                                                       |
| onLabelChange        | `(e: CustomEvent<string>) => void`  | -    | -      | 标签编辑完成后触发。                                                                                                           |

## Events

| 事件                 | detail                                                                  | 说明                                                                                                    |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| onLabelEditingChange | `boolean` — 当前是否处于编辑状态，true 表示正在编辑，false 表示结束编辑 | 标签编辑状态变化时触发，当用户开始编辑（双击或调用 `enableEditing`）或结束编辑（失焦/按 Enter）时触发。 |
| onLabelChange        | `string` — 编辑完成后的新标签文本                                       | 标签编辑完成后触发（用户失焦或按 Enter 键），即使内容未变化也会触发，需自行判断是否发生实际变更。       |

## Methods

| 方法          | 参数         | 返回值 | 说明                                                               |
| ------------- | ------------ | ------ | ------------------------------------------------------------------ |
| enableEditing | `() => void` | `void` | 以编程方式启用标签的编辑状态（相当于用户双击），只读模式下不生效。 |

## Examples

### Basic

展示可编辑标签的基本用法，双击标签可进入编辑模式，失焦或按 Enter 键确认修改。

```tsx
import { WrappedDiagramEditableLabel } from "@easyops/wrapped-components";

function BasicEditableLabel() {
  return (
    <WrappedDiagramEditableLabel
      type="line"
      label="Relation"
      onLabelChange={(e) => alert(`Label changed to: ${e.detail}`)}
    />
  );
}
```

### Read Only

展示只读模式下的标签，双击不会进入编辑状态。

```tsx
import { WrappedDiagramEditableLabel } from "@easyops/wrapped-components";

function ReadOnlyLabel() {
  return (
    <WrappedDiagramEditableLabel
      type="line"
      label="Read Only Label"
      readOnly={true}
      onLabelChange={(e) => alert(`Label changed to: ${e.detail}`)}
    />
  );
}
```

### Editing State Change

展示监听编辑状态变化事件，在用户开始/结束编辑时响应。

```tsx
import { WrappedDiagramEditableLabel } from "@easyops/wrapped-components";

function EditingStateLabel() {
  return (
    <WrappedDiagramEditableLabel
      type="default"
      label="Click to edit"
      onLabelEditingChange={(e) =>
        console.log(e.detail ? "Editing started" : "Editing ended")
      }
      onLabelChange={(e) => console.log(`New label: ${e.detail}`)}
    />
  );
}
```
