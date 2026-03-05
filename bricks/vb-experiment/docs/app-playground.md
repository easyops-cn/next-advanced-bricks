---
tagName: vb-experiment.app-playground
displayName: WrappedVbExperimentAppPlayground
description: App 编辑器与预览的集成 Playground，支持用 TSX 语法编写 App，并实时转换为 Storyboard 进行预览
category: ""
source: "@next-bricks/vb-experiment"
---

# vb-experiment.app-playground

> App 编辑器与预览的集成 Playground，支持用 TSX 语法编写 App，并实时转换为 Storyboard 进行预览

## Props

| 属性      | 类型         | 必填 | 默认值 | 说明                                                       |
| --------- | ------------ | ---- | ------ | ---------------------------------------------------------- |
| source    | `string`     | 否   | -      | 初始代码内容，仅在首次渲染时有效，后续更改不会同步到编辑器 |
| extraLibs | `ExtraLib[]` | 否   | -      | 额外注入到编辑器的类型声明库，用于提供代码补全和类型检查   |

## Events

| 事件   | detail                              | 说明                 |
| ------ | ----------------------------------- | -------------------- |
| change | `string` — 当前编辑器中的代码字符串 | 编辑器内容变化时触发 |

## Examples

### Basic

展示 App Playground 的基本用法，左侧代码编辑器，右侧实时预览。

```yaml preview minHeight="600px"
- brick: vb-experiment.app-playground
  properties:
    style:
      display: block
      position: fixed
      inset: 0
    source: |
      import { useState } from "next-tsx";

      const RESPONSE = {
        "list": [
          {
            "inode_usage": [
              {
                "total_inodes": 21162000,
                "used_inodes": 1385716,
                "free_inodes": 19776284,
                "percent": "7%",
                "device": "/dev/mapper/centos-root",
                "mount_point": "/"
              }
            ],
            "ip": "172.30.0.134",
            "disk_usage": [
              {
                "total": "95.00GB",
                "used": "85.00GB",
                "free": "9.00GB",
                "percent": "91%",
                "rw_status": "rw",
                "device": "/dev/mapper/centos-root",
                "mount_point": "/"
              }
            ]
          }
        ]
      };

      export default (
        <View title="磁盘使用情况">
          {RESPONSE.list.map((item) => (
            <Card title={item.ip}>
              <Plaintext>磁盘空间使用</Plaintext>
              <Table
                dataSource={{ list: item.disk_usage }}
                columns={[
                  { dataIndex: "device", key: "device", title: "设备" },
                  { dataIndex: "mount_point", key: "mount_point", title: "挂载点" },
                  { dataIndex: "total", key: "total", title: "总大小" },
                  { dataIndex: "used", key: "used", title: "已用空间" },
                  { dataIndex: "free", key: "free", title: "可用空间" },
                  { dataIndex: "percent", key: "percent", title: "使用率" }
                ]}
                rowKey="device"
                pagination={false}
              />
            </Card>
          ))}
        </View>
      );
- brick: style
  properties:
    textContent: |
      .monaco-editor .overflow-guard {
        border-radius: 0!important;
        border: none!important;
      }
```

### With Change Event

监听代码变化事件，获取编辑器中最新的代码内容。

```yaml preview minHeight="300px"
brick: vb-experiment.app-playground
properties:
  style:
    display: block
    height: 300px
  source: |
    export default (
      <View title="Hello World">
        <Plaintext>Hello, Next TSX!</Plaintext>
      </View>
    );
events:
  change:
    action: console.log
```
