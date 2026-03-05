---
tagName: vb-experiment.tsx-playground
displayName: WrappedVbExperimentTsxPlayground
description: TSX 视图编辑器与实时预览的集成 Playground，支持用 TSX 语法编写视图，并即时渲染到右侧预览区
category: ""
source: "@next-bricks/vb-experiment"
---

# WrappedVbExperimentTsxPlayground

> TSX 视图编辑器与实时预览的集成 Playground，支持用 TSX 语法编写视图，并即时渲染到右侧预览区

## 导入

```tsx
import { WrappedVbExperimentTsxPlayground } from "@easyops/wrapped-components";
```

## Props

| 属性           | 类型           | 必填 | 默认值 | 说明                                                               |
| -------------- | -------------- | ---- | ------ | ------------------------------------------------------------------ |
| source         | `string`       | 否   | -      | 初始代码内容，仅在首次渲染时有效，后续更改不会同步到编辑器         |
| extraLibs      | `ExtraLib[]`   | 否   | -      | 额外注入到编辑器的类型声明库，用于提供代码补全和类型检查           |
| viewLibs       | `SourceFile[]` | 否   | -      | 额外的视图库源文件，会合并到类型声明中，并在解析视图时作为依赖提供 |
| withoutWrapper | `boolean`      | 否   | -      | 是否跳过顶层 wrapper 包裹，启用后视图直接渲染为裸砖块列表          |
| allowAnyBricks | `boolean`      | 否   | -      | 是否允许使用任意砖块，默认仅允许 next-tsx 白名单砖块               |

## Events

| 事件     | detail                              | 说明                 |
| -------- | ----------------------------------- | -------------------- |
| onChange | `string` — 当前编辑器中的代码字符串 | 编辑器内容变化时触发 |

## Examples

### Basic

展示 TSX Playground 的基本用法，左侧代码编辑器，右侧实时预览视图。

```tsx
<WrappedVbExperimentTsxPlayground
  source={`
import { useState } from "next-tsx";

const RESPONSE = {
  list: [
    {
      ip: "172.30.0.134",
      disk_usage: [
        {
          total: "95.00GB",
          used: "85.00GB",
          free: "9.00GB",
          percent: "91%",
          rw_status: "rw",
          large_files: [
            { size: "1.00GB", path: "/opt/maxkb/maxkb-pro-2.0.1.tgz" }
          ],
          device: "/dev/mapper/centos-root",
          mount_point: "/"
        }
      ],
      inode_usage: [
        {
          total_inodes: 21162000,
          used_inodes: 1385716,
          free_inodes: 19776284,
          percent: "7%",
          device: "/dev/mapper/centos-root",
          mount_point: "/"
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
  style={{ display: "block", position: "fixed", inset: 0 }}
/>
```

### Without Wrapper

跳过顶层包裹，直接渲染裸砖块列表，适合嵌入到其他布局中使用。

```tsx
<WrappedVbExperimentTsxPlayground
  withoutWrapper={true}
  source={`
export default (
  <Button type="primary">Hello World</Button>
);
  `}
  style={{ display: "block", height: "300px" }}
/>
```

### Allow Any Bricks

允许使用任意砖块（不限于 next-tsx 白名单），适合高级使用场景。

```tsx
<WrappedVbExperimentTsxPlayground
  allowAnyBricks={true}
  source={`
export default (
  <View title="自定义砖块示例">
    <Plaintext>支持使用任意砖块</Plaintext>
  </View>
);
  `}
  style={{ display: "block", height: "300px" }}
  onChange={(e) => console.log(e.detail)}
/>
```
