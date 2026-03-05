---
tagName: ui-test.preview-container
displayName: WrappedUiTestPreviewContainer
description: UI 测试预览容器，内嵌 iframe 展示目标页面，支持录制操作步骤和检视构件。
category: ui-test
source: "@next-bricks/ui-test"
---

# ui-test.preview-container

> UI 测试预览容器，内嵌 iframe 展示目标页面，支持录制操作步骤和检视构件。

## Props

| 属性                  | 类型              | 必填 | 默认值 | 说明                                                             |
| --------------------- | ----------------- | ---- | ------ | ---------------------------------------------------------------- |
| src                   | `string`          | 是   | -      | iframe 加载的目标页面 URL                                        |
| recording             | `boolean`         | 否   | -      | 是否处于录制模式，开启后将监听并记录用户操作步骤                 |
| inspecting            | `boolean`         | 否   | -      | 是否处于构件检视模式，开启后可在预览页面中点选构件并高亮对应节点 |
| hoverRelatedCommands  | `NodeGraphData[]` | 否   | -      | 悬停高亮关联的命令节点数据                                       |
| activeRelatedCommands | `NodeGraphData[]` | 否   | -      | 激活高亮关联的命令节点数据                                       |

## Events

| 事件            | detail                                     | 说明                               |
| --------------- | ------------------------------------------ | ---------------------------------- |
| url.change      | `string` — 当前预览页面的 URL              | 预览页面 URL 变化时触发            |
| inspect.select  | `InspectSelector[]` — 选中的构件选择器列表 | 在检视模式下点选构件时触发         |
| record.complete | `RecordStep[]` — 录制完成的操作步骤列表    | 录制完成时触发，返回录制的操作步骤 |

## Methods

| 方法    | 参数         | 返回值 | 说明             |
| ------- | ------------ | ------ | ---------------- |
| back    | `() => void` | `void` | 控制 iframe 后退 |
| forward | `() => void` | `void` | 控制 iframe 前进 |
| reload  | `() => void` | `void` | 控制 iframe 刷新 |

## Examples

### Basic

基础预览容器，展示目标页面并监听 URL 变化。

```yaml preview
brick: ui-test.preview-container
properties:
  src: /next/
events:
  url.change:
    - action: console.log
      args:
        - url changed
        - <% EVENT.detail %>
```

### Recording Mode

开启录制模式，监听用户操作并在完成时获取步骤列表。

```yaml preview
- brick: ui-test.preview-container
  properties:
    id: preview
    src: /next/
    recording: true
  events:
    record.complete:
      - action: console.log
        args:
          - record complete
          - <% EVENT.detail %>
    url.change:
      - action: console.log
        args:
          - <% EVENT.detail %>
- brick: eo-button
  properties:
    textContent: 后退
  events:
    click:
      - target: "#preview"
        method: back
- brick: eo-button
  properties:
    textContent: 前进
  events:
    click:
      - target: "#preview"
        method: forward
- brick: eo-button
  properties:
    textContent: 刷新
  events:
    click:
      - target: "#preview"
        method: reload
```

### Inspect Mode

开启构件检视模式，点选构件后触发选择事件。

```yaml preview
brick: ui-test.preview-container
properties:
  src: /next/
  inspecting: true
events:
  inspect.select:
    - action: console.log
      args:
        - inspect select
        - <% EVENT.detail %>
  url.change:
    - action: console.log
      args:
        - <% EVENT.detail %>
```
