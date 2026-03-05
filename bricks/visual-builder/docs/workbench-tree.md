---
tagName: visual-builder.workbench-tree
displayName: WrappedVisualBuilderWorkbenchTree
description: 工作台树形组件，支持搜索、拖拽排序、折叠展开和节点操作
category: ""
source: "@next-bricks/visual-builder"
---

# visual-builder.workbench-tree

> 工作台树形组件，支持搜索、拖拽排序、折叠展开和节点操作

## Props

| 属性                | 类型                                                   | 必填 | 默认值 | 说明                                            |
| ------------------- | ------------------------------------------------------ | ---- | ------ | ----------------------------------------------- |
| nodes               | `WorkbenchNodeData[]`                                  | 是   | -      | 树节点数据列表                                  |
| actions             | `WorkbenchTreeAction[]`                                | 是   | -      | 节点操作按钮配置列表                            |
| actionsHidden       | `boolean`                                              | 是   | -      | 是否隐藏节点操作按钮                            |
| placeholder         | `string`                                               | 是   | -      | 无数据时显示的占位文本                          |
| isTransformName     | `boolean`                                              | 是   | -      | 是否将节点名称转换为可读格式                    |
| searchPlaceholder   | `string`                                               | 是   | -      | 搜索框占位文本                                  |
| noSearch            | `boolean`                                              | 是   | -      | 是否隐藏搜索框                                  |
| activeKey           | `string \| number`                                     | 是   | -      | 当前激活节点的 key                              |
| showMatchedNodeOnly | `boolean`                                              | 是   | -      | 搜索时是否只显示匹配的节点                      |
| matchNodeDataFields | `string \| string[]`                                   | 是   | -      | 搜索时匹配的节点数据字段，"\*" 表示匹配所有字段 |
| fixedActionsFor     | `Record<string, unknown> \| Record<string, unknown>[]` | 是   | -      | 始终显示操作按钮的节点数据条件                  |
| collapsible         | `boolean`                                              | 是   | -      | 是否启用节点折叠功能                            |
| collapsedNodes      | `string[]`                                             | 是   | -      | 当前已折叠节点的 ID 列表                        |
| allowDrag           | `boolean`                                              | 是   | -      | 是否允许拖拽排序                                |
| allowDragToRoot     | `boolean`                                              | 是   | -      | 是否允许拖拽到根节点位置                        |
| allowDragToInside   | `boolean`                                              | 是   | -      | 是否允许拖拽到节点内部成为子节点                |
| nodeKey             | `string`                                               | 是   | -      | 节点唯一标识字段名                              |
| skipNotify          | `boolean`                                              | 是   | -      | 是否跳过节点点击时的通知                        |

## Events

| 事件         | detail                                                                                 | 说明                        |
| ------------ | -------------------------------------------------------------------------------------- | --------------------------- |
| action.click | `ActionClickDetail` — { action: 操作标识, data: 节点数据 }                             | 点击节点操作按钮时触发      |
| node.click   | `unknown` — 节点的 data 数据                                                           | 点击节点时触发              |
| node.drop    | `any` — 拖拽完成后的节点位置信息                                                       | 拖拽节点完成时触发          |
| context.menu | `unknown` — { active: true, node: 节点的 data 数据, x: 鼠标 X 坐标, y: 鼠标 Y 坐标 }   | 右键点击节点时触发          |
| node.toggle  | `{ nodeId: string; collapsed: boolean; }` — { nodeId: 节点 ID, collapsed: 是否已折叠 } | 节点折叠/展开状态变化时触发 |

## Examples

### Basic

展示基本的树形结构，包含节点数据和操作按钮。

```yaml preview
brick: visual-builder.workbench-tree
properties:
  nodes:
    - key: "1"
      name: 页面A
      data:
        id: "1"
        type: page
      children:
        - key: "1-1"
          name: 子页面A1
          data:
            id: "1-1"
            type: page
        - key: "1-2"
          name: 子页面A2
          data:
            id: "1-2"
            type: page
    - key: "2"
      name: 页面B
      data:
        id: "2"
        type: page
  actions:
    - action: add
      icon:
        lib: antd
        icon: plus
        theme: outlined
      title: 新增
    - action: delete
      icon:
        lib: antd
        icon: delete
        theme: outlined
      title: 删除
  actionsHidden: false
  placeholder: 暂无页面
  searchPlaceholder: 搜索页面
  noSearch: false
  activeKey: "1"
  showMatchedNodeOnly: false
  matchNodeDataFields: []
  fixedActionsFor: []
  collapsible: true
  collapsedNodes: []
  allowDrag: false
  allowDragToRoot: false
  allowDragToInside: false
  nodeKey: ""
  skipNotify: false
events:
  node.click:
    - action: console.log
  action.click:
    - action: console.log
```

### 可拖拽排序

启用拖拽功能，支持在节点间拖拽调整顺序和层级。

```yaml preview
brick: visual-builder.workbench-tree
properties:
  nodes:
    - key: "1"
      name: 构件A
      data:
        id: "1"
      children: []
    - key: "2"
      name: 构件B
      data:
        id: "2"
      children:
        - key: "2-1"
          name: 子构件B1
          data:
            id: "2-1"
        - key: "2-2"
          name: 子构件B2
          data:
            id: "2-2"
    - key: "3"
      name: 构件C
      data:
        id: "3"
      children: []
  actions: []
  actionsHidden: true
  placeholder: 暂无构件
  searchPlaceholder: 搜索构件
  noSearch: false
  activeKey: ""
  showMatchedNodeOnly: false
  matchNodeDataFields: []
  fixedActionsFor: []
  collapsible: true
  collapsedNodes: []
  allowDrag: true
  allowDragToRoot: true
  allowDragToInside: true
  nodeKey: ""
  skipNotify: false
events:
  node.drop:
    - action: console.log
  node.toggle:
    - action: console.log
```

### 搜索和右键菜单

启用节点数据字段搜索，并监听右键菜单事件。

```yaml preview
brick: visual-builder.workbench-tree
properties:
  nodes:
    - key: "1"
      name: 登录页
      data:
        id: "1"
        path: /login
    - key: "2"
      name: 首页
      data:
        id: "2"
        path: /home
    - key: "3"
      name: 详情页
      data:
        id: "3"
        path: /detail
  actions:
    - action: edit
      icon:
        lib: antd
        icon: edit
        theme: outlined
      title: 编辑
  actionsHidden: false
  placeholder: 暂无页面
  searchPlaceholder: 搜索路径或名称
  noSearch: false
  activeKey: "2"
  showMatchedNodeOnly: true
  matchNodeDataFields:
    - path
  fixedActionsFor: []
  collapsible: false
  collapsedNodes: []
  allowDrag: false
  allowDragToRoot: false
  allowDragToInside: false
  nodeKey: ""
  skipNotify: false
events:
  context.menu:
    - action: console.log
  action.click:
    - action: console.log
```
