---
tagName: data-view.cabinet-graph
displayName: WrappedDataViewCabinetGraph
description: cabinet 部署架构拓扑
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.cabinet-graph

> cabinet 部署架构拓扑

## Props

| 属性           | 类型                 | 必填 | 默认值 | 说明                 |
| -------------- | -------------------- | ---- | ------ | -------------------- |
| dataSource     | `AppData`            | 是   | -      | 数据源               |
| activeKey      | `string \| string[]` | 否   | -      | 选中项，支持数组     |
| hiddenCloseBtn | `boolean`            | 否   | -      | 取消按钮是否需要展示 |

## Events

| 事件               | detail                                                                                                                 | 说明                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| close.button.click | `void`                                                                                                                 | 关闭按钮点击事件                       |
| cabinet.click      | `{ type: ChangeType, data: Record<string, any> }` — { type: 点击类型（node/cluster/layer），data: 对应节点或集群数据 } | 节点或外层的点击事件                   |
| cabinet.dbclick    | `{ type: ChangeType, data: Record<string, any> }` — { type: 双击类型（node/cluster），data: 对应节点或集群数据 }       | 节点或外层的双击事件，目前不支持应用层 |

## Examples

### Basic

展示 cabinet 部署架构拓扑构件的基本用法，包含物理机、虚拟机和容器组节点。

```yaml preview
- brick: data-view.cabinet-graph
  properties:
    dataSource:
      appName: inventory-api
      key: inventory-api
      clusters:
        - clusterName: inventory-api##aaaaa
          key: inventory-api##aaaaa
          type: host
          nodes:
            - nodeTitle: 244.244.244.244
              key: 244.244.244.244
              type: physical-machine
              isAlert: true
            - nodeTitle: 244.244.244.245
              key: 244.244.244.245
              type: virtual-machine
              isAlert: true
            - nodeTitle: 244.244.245.245
              key: 244.244.245.245
              type: physical-machine
            - nodeTitle: 244.244.245.244
              key: 244.244.245.244
              type: virtual-machine
        - clusterName: K8S集群xxx
          key: k8s-cluster
          type: k8s
          nodes:
            - nodeTitle: a容器组
              key: aa
              type: container-group
              isAlert: true
            - nodeTitle: b容器组
              key: bb
              type: container-group
        - clusterName: K8S集群xx
          key: xxxx
          type: k8s-blue
          nodes:
            - nodeTitle: a容器组
              key: aa
              type: pod
              isAlert: true
            - nodeTitle: b容器组
              key: bb
              type: pod
  events:
    cabinet.click:
      action: console.log
    cabinet.dbclick:
      action: console.log
    close.button.click:
      action: console.log
```

### 隐藏关闭按钮

展示隐藏关闭按钮的部署架构拓扑。

```yaml preview
- brick: data-view.cabinet-graph
  properties:
    hiddenCloseBtn: true
    activeKey: k8s-cluster
    dataSource:
      appName: my-app
      key: my-app
      clusters:
        - clusterName: K8S集群
          key: k8s-cluster
          type: k8s
          nodes:
            - nodeTitle: web容器组
              key: web-pod
              type: container-group
            - nodeTitle: api容器组
              key: api-pod
              type: container-group
```
