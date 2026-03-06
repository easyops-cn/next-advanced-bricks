---
tagName: data-view.cabinet-container
displayName: WrappedDataViewCabinetContainer
description: 大屏集群容器构件
category: ""
source: "@next-bricks/data-view"
---

# WrappedDataViewCabinetContainer

> 大屏集群容器构件

## 导入

```tsx
import { WrappedDataViewCabinetContainer } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型                  | 必填 | 默认值   | 说明                                                  |
| ----------- | --------------------- | ---- | -------- | ----------------------------------------------------- |
| type        | `ContainerType`       | 是   | `"host"` | 容器类型，host、k8s（主题橙色）、k8s-blue（蓝色主题） |
| data        | `CabinetNodeProps[]`  | 是   | `[]`     | 数据                                                  |
| status      | `"active" \| "faded"` | 否   | -        | 当前状态,是否高亮或者淡化                             |
| customTitle | `string \| undefined` | 否   | -        | 容器标题                                              |

## Events

| 事件               | detail                                                                                                                       | 说明                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| onContainerClick   | `ClickEventDataType` — { type: 点击对象类型（"node" 或 "container"）, data: 被点击节点的数据（点击容器本身时为 undefined） } | 节点或者container 点击事件 |
| onContainerDbclick | `ClickEventDataType` — { type: 点击对象类型（"node" 或 "container"）, data: 被双击节点的数据（双击容器本身时为 undefined） } | 节点或者container 双击事件 |

## Examples

### Basic

展示一个基本的大屏集群容器，包含若干物理机节点。

```tsx
<WrappedDataViewCabinetContainer
  customTitle="集群容器"
  data={[
    { type: "physical-machine", nodeTitle: "255.255.255" },
    { type: "physical-machine", nodeTitle: "255.255.255" },
  ]}
  style={{ width: "400px", height: "500px" }}
/>
```

### Status

展示高亮状态下的集群容器。

```tsx
<WrappedDataViewCabinetContainer
  customTitle="集群容器"
  status="active"
  data={[
    { type: "physical-machine", nodeTitle: "255.255.255" },
    { type: "physical-machine", nodeTitle: "255.255.255" },
  ]}
  style={{ width: "400px", height: "500px" }}
/>
```

### Click events

演示节点和容器的点击与双击事件处理。

```tsx
<WrappedDataViewCabinetContainer
  type="k8s"
  customTitle="K8S集群"
  data={[
    { type: "container-group", nodeTitle: "容器组A" },
    { type: "pod", nodeTitle: "Pod-1" },
  ]}
  style={{ width: "400px", height: "500px" }}
  onContainerClick={(e) => console.log(e.detail)}
  onContainerDbclick={(e) => console.log(e.detail)}
/>
```
