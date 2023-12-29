菜单构件

## Examples

### basic

```yaml preview minHeight="300px"
brick: eo-nav-menu
properties:
  menu:
    title: mock data
    menuItems:
      - text: 创造
        to: /a
        type: default
      - title: 资源库
        type: subMenu
        items:
          - text: 构件库
            to: /b
            type: default
          - title: 契约中心
            to: /c
            type: subMenu
            items:
              - text: cmdb契约
                to: /cmdb
                type: default
              - title: devops契约
                type: subMenu
                items:
                  - text: flow
                    to: /flow
                    type: default
                  - text: tool
                    to: /tool
                    type: default
      - text: 文档中心
        href: "http://www.baidu.com"
        type: default
      - title: 接口与数据
        type: subMenu
        items:
          - text: Api Gateway
            to: /d
            type: default
          - title: 测试组
            type: group
            items:
              - text: 挂件
                to: /e
                type: default
              - text: 构件
                to: /f
                type: default
```

### overflow

```yaml preview minHeight="300px"
brick: eo-nav-menu
properties:
  style:
    width: 100px
  menu:
    title: mock data
    menuItems:
      - text: 创造
        to: /a
        type: default
      - title: 资源库
        type: subMenu
        items:
          - text: 构件库
            to: /b
            type: default
          - title: 契约中心
            to: /c
            type: subMenu
            items:
              - text: cmdb契约
                to: /cmdb
                type: default
              - title: devops契约
                type: subMenu
                items:
                  - text: flow
                    to: /flow
                    type: default
                  - text: tool
                    to: /tool
                    type: default
      - text: 文档中心
        href: "http://www.baidu.com"
        type: default
      - title: 接口与数据
        type: subMenu
        items:
          - text: Api Gateway
            to: /d
            type: default
          - title: 测试组
            type: group
            items:
              - text: 挂件
                to: /e
                type: default
              - text: 构件
                to: /f
                type: default
```

### 带网站地图的菜单

```yaml preview minHeight="500px"
brick: eo-nav-menu
properties:
  menu:
    title: mock data
    menuItems:
      - text: 创造
        to: /a
        type: default
      - title: 资源库
        type: subMenu
        items:
          - text: 构件库
            to: /b
            type: default
          - title: 契约中心
            to: /c
            type: subMenu
            items:
              - text: cmdb契约
                to: /cmdb
                type: default
              - title: devops契约
                type: subMenu
                items:
                  - text: flow
                    to: /flow
                    type: default
                  - text: tool
                    to: /tool
                    type: default
      - title: 服务
        type: group
        groupId: resource
        childLayout: siteMap
        items:
          - type: group
            childLayout: default
            title: 计算
            items:
              - activeExcludes: []
                activeIncludes:
                  - "/computing-resource-monitor/local/host/:path+"
                activeMatchSearch: false
                childLayout: default
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: host-second-menu
                  lib: easyops
                instanceId: 6026b804c1a66
                sort: 10
                text: 主机(本地部署)
                to: /computing-resource-monitor/local/host
                type: default
                children: []
                key: 1.0.0
              - activeExcludes: []
                activeIncludes:
                  - /computing-resource-monitor/kubernetes/guide
                  - /computing-resource-monitor/kubernetes/activation
                  - "/computing-resource-monitor/kubernetes/activation/:path+"
                activeMatchSearch: false
                childLayout: default
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: cluster-second-menu
                  lib: easyops
                instanceId: 6026b804c1aca
                sort: 20
                text: 集群
                to: /computing-resource-monitor/kubernetes/cluster
                type: default
                children: []
                key: 1.0.1
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: pod-second-menu
                  lib: easyops
                instanceId: 6026b804c1b2e
                sort: 30
                text: Pod
                to: /computing-resource-monitor/kubernetes/pod
                type: default
                children: []
                key: 1.0.2
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: node-second-menu
                  lib: easyops
                instanceId: 6026b804c1b92
                sort: 40
                text: 节点
                to: /computing-resource-monitor/kubernetes/node
                type: default
                children: []
                key: 1.0.3
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: container-second-menu
                  lib: easyops
                instanceId: 6026b804c1bf6
                sort: 50
                text: 容器
                to: /computing-resource-monitor/docker/container
                type: default
                children: []
                key: 1.0.4
            key: "1.0"
          - type: group
            title: 存储
            items:
              - activeExcludes: []
                activeIncludes:
                  - "/storage-resource-monitor/cbs/:path+"
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: tencent-cloud-hard-disk-second-menu
                  lib: easyops
                instanceId: 6026b6cf6bb56
                sort: 0
                text: 腾讯云・云磁盘CBS
                to: /storage-resource-monitor/cbs
                type: default
                children: []
                key: 1.1.0
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: container-second-menu
                  lib: easyops
                instanceId: 6026b6cf6bbba
                sort: 0
                text: 腾讯云对象存储
                to: /storage-resource-monitor/cos
                type: default
                children: []
                key: 1.1.1
            key: "1.1"
          - type: group
            title: 网络
            items:
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: loadbalance-second-menu
                  lib: easyops
                instanceId: 6026b7c20c8cf
                sort: 0
                text: 负载均衡策略
                to: /network-resource-monitor/loadbalance
                type: default
                children: []
                key: 1.2.0
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: alibaba-cloud-elastic-public-ip-second-menu
                  lib: easyops
                instanceId: 6026b7c20c933
                sort: 0
                text: 阿里云・弹性公网IP
                to: /network-resource-monitor/ali-eip
                type: default
                children: []
                key: 1.2.1
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                icon:
                  category: second-menu
                  icon: tencent-cloud-nat-gateway-second-menu
                  lib: easyops
                instanceId: 6026b7c20c997
                sort: 0
                text: 腾讯云 · NAT网关
                to: /network-resource-monitor/gateway
                type: default
                children: []
                key: 1.2.2
            key: "1.2"
          - type: group
            title: 网络设备
            items:
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                instanceId: 6026b8b05e892
                sort: 10
                text: 交换机
                to: /network-device-resource-monitor/switch
                type: default
                children: []
                key: 1.3.0
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                instanceId: 6026b8b05e8f6
                sort: 20
                text: 路由器
                to: /network-device-resource-monitor/router
                type: default
                children: []
                key: 1.3.1
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                instanceId: 6026b8b05e95a
                sort: 30
                text: 防火墙
                to: /network-device-resource-monitor/firewall
                type: default
                children: []
                key: 1.3.2
            key: "1.3"
          - type: group
            title: 自定义监控
            groupFrom: monitor
            items:
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                instanceId: 6026b8b05e892
                sort: 10
                text: 主机
                to: /network-device-resource-monitor/host
                type: default
                children: []
                key: 1.4.0
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                instanceId: 6026b8b05e8f6
                sort: 20
                text: 报文
                to: /network-device-resource-monitor/message
                type: default
                children: []
                key: 1.4.1
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                instanceId: 6026b8b05e891
                sort: 30
                text: EasyCore
                to: /network-device-resource-monitor/EasyCore
                type: default
                children: []
                key: 1.4.2
              - activeExcludes: []
                activeIncludes: []
                activeMatchSearch: false
                defaultExpanded: false
                exact: false
                instanceId: 6026b8b05e8f7
                sort: 40
                text: 视图
                to: /network-device-resource-monitor/view
                type: default
                children: []
                key: 1.4.3
            key: "1.4"
```
