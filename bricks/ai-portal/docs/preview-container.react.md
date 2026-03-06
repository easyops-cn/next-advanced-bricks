---
tagName: ai-portal.preview-container
displayName: WrappedAiPortalPreviewContainer
description: TSX 源码预览容器，将 TSX 源码字符串解析并渲染为完整的页面视图。
category: ""
source: "@next-bricks/ai-portal"
---

# WrappedAiPortalPreviewContainer

> TSX 源码预览容器，将 TSX 源码字符串解析并渲染为完整的页面视图。

## 导入

```tsx
import { WrappedAiPortalPreviewContainer } from "@easyops/wrapped-components";
```

## Props

| 属性   | 类型     | 必填 | 默认值 | 说明                                                            |
| ------ | -------- | ---- | ------ | --------------------------------------------------------------- |
| source | `string` | 否   | -      | TSX 源码字符串，将被解析并渲染为页面视图                        |
| url    | `string` | 否   | -      | 渲染上下文中可访问的 URL，传入后可在视图内通过路由相关 API 使用 |

## Examples

### 基础使用

将 TSX 源码字符串解析并渲染为磁盘使用情况报告视图。

```tsx
<WrappedAiPortalPreviewContainer
  style={{ position: "fixed", inset: 0, overflowY: "auto" }}
  source={`
    const RESPONSE = {
      "list": [
        {
          "ip": "172.30.0.134",
          "disk_usage": [
            { "device": "/dev/sda1", "mount_point": "/", "total": "95.00GB", "used": "85.00GB", "free": "9.00GB", "percent": "91%", "rw_status": "rw" }
          ]
        }
      ]
    };

    export default (
      <View title="磁盘使用情况">
        {RESPONSE.list.map((item) => (
          <Card title={item.ip}>
            <Table
              dataSource={{ list: item.disk_usage }}
              columns={[
                { dataIndex: "device", key: "device", title: "设备" },
                { dataIndex: "mount_point", key: "mount_point", title: "挂载点" },
                { dataIndex: "total", key: "total", title: "总大小" },
                { dataIndex: "used", key: "used", title: "已用空间" },
                { dataIndex: "free", key: "free", title: "可用空间" },
                { dataIndex: "percent", key: "percent", title: "使用率" },
                { dataIndex: "rw_status", key: "rw_status", title: "读写状态" }
              ]}
              rowKey="device"
              pagination={false}
            />
          </Card>
        ))}
      </View>
    );
  `}
/>
```
