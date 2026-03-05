---
tagName: data-view.cabinet-thumbnail
displayName: WrappedDataViewCabinetThumbnail
description: 应用墙缩略图
category: ""
source: "@next-bricks/data-view"
---

# WrappedDataViewCabinetThumbnail

> 应用墙缩略图

## 导入

```tsx
import { WrappedDataViewCabinetThumbnail } from "@easyops/wrapped-components";
```

## Props

| 属性     | 类型         | 必填 | 默认值 | 说明         |
| -------- | ------------ | ---- | ------ | ------------ |
| clusters | `Clusters[]` | 是   | `[]`   | 集群数据     |
| columns  | `number`     | 是   | `4`    | 单个容器列数 |
| appName  | `string`     | 是   | -      | 应用名称     |

## Examples

### Basic

展示应用墙缩略图，包含多个不同类型的集群容器。

```tsx
<WrappedDataViewCabinetThumbnail
  appName="inventory-api"
  clusters={[
    {
      title: "inventory-api##aaaaa",
      type: "host",
      data: [
        { nodeTitle: "244.244.244.244", type: "physical-machine" },
        { nodeTitle: "244.244.244.245", type: "virtual-machine" },
        { nodeTitle: "244.244.245.245", type: "physical-machine" },
        { nodeTitle: "244.244.245.244", type: "virtual-machine" },
      ],
    },
    {
      title: "K8S集群xxx",
      type: "k8s",
      data: [
        { nodeTitle: "a容器组", type: "container-group" },
        { nodeTitle: "b容器组", type: "container-group" },
      ],
    },
    {
      title: "K8S集群xx",
      type: "k8s-blue",
      data: [
        { nodeTitle: "a1容器组", type: "pod" },
        { nodeTitle: "b1容器组", type: "pod" },
      ],
    },
  ]}
/>
```

### Custom columns

通过 columns 属性控制单个容器的节点列数。

```tsx
<WrappedDataViewCabinetThumbnail
  appName="my-app"
  columns={2}
  clusters={[
    {
      title: "主机集群",
      type: "host",
      data: [
        { nodeTitle: "10.0.0.1", type: "physical-machine" },
        { nodeTitle: "10.0.0.2", type: "virtual-machine" },
        { nodeTitle: "10.0.0.3", type: "physical-machine" },
        { nodeTitle: "10.0.0.4", type: "virtual-machine" },
      ],
    },
  ]}
/>
```
