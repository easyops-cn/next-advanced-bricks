---
tagName: ai-portal.mcp-tools
displayName: WrappedAiPortalMcpTools
description: MCP 工具列表组件，按服务分组展示工具信息，支持按平台分类过滤和吸顶标签栏。
category: display-component
source: "@next-bricks/ai-portal"
---

# ai-portal.mcp-tools

> MCP 工具列表组件，按服务分组展示工具信息，支持按平台分类过滤和吸顶标签栏。

## Props

| 属性      | 类型        | 必填 | 默认值 | 说明                                                                       |
| --------- | ----------- | ---- | ------ | -------------------------------------------------------------------------- |
| list      | `McpTool[]` | 否   | -      | MCP 工具列表数据，按 server.id 自动分组并归属平台分类                      |
| stickyTop | `number`    | 否   | -      | 平台过滤标签栏的吸顶偏移量（px），设置后标签栏使用吸顶容器，未设置则不吸顶 |

## Examples

### Basic

展示基础 MCP 工具列表，按服务分组展示。

```yaml preview
brick: ai-portal.mcp-tools
properties:
  list:
    - name: list_hosts
      title: 查询主机列表
      description: 查询 CMDB 中的主机资源列表，支持按条件过滤。
      server:
        id: cmdb
        name: CMDB
    - name: get_host_detail
      title: 获取主机详情
      description: 根据主机实例 ID 获取主机的详细信息，包括配置、状态等。
      server:
        id: cmdb
        name: CMDB
    - name: list_alerts
      title: 查询告警列表
      description: 获取当前活跃告警列表，支持按严重性筛选。
      server:
        id: alert
        name: 监控事件
```

### With Custom Icons

为工具配置自定义图标，增强视觉区分。

```yaml preview
brick: ai-portal.mcp-tools
properties:
  list:
    - name: deploy_app
      title: 部署应用
      description: 向 Kubernetes 集群部署应用，支持指定命名空间和镜像版本。
      icon:
        lib: antd
        icon: cloud-upload
      server:
        id: kubernetes
        name: Kubernetes
    - name: scale_deployment
      title: 弹性伸缩
      description: 调整 Kubernetes Deployment 的副本数量。
      icon:
        lib: antd
        icon: apartment
      server:
        id: kubernetes
        name: Kubernetes
    - name: execute_llm
      title: 调用大模型
      description: 向大模型发送请求并获取响应。
      icon:
        lib: antd
        icon: robot
      server:
        id: llm
        name: 大模型
```

### With Sticky Tabs

启用吸顶平台过滤标签栏，适合内容较多的场景。

```yaml preview
brick: ai-portal.mcp-tools
properties:
  stickyTop: 0
  list:
    - name: list_hosts
      title: 查询主机列表
      description: 查询 CMDB 中的主机资源列表，支持按条件过滤。
      server:
        id: cmdb
        name: CMDB
    - name: create_page
      title: 创建页面
      description: 在低代码平台中创建一个新的页面。
      server:
        id: web-builder
        name: 低代码
    - name: list_dashboards
      title: 查询仪表盘
      description: 获取 Grafana 中所有仪表盘列表。
      server:
        id: grafana
        name: Grafana
```
