---
tagName: eo-workbench-layout-v2
displayName: WrappedEoWorkbenchLayoutV2
description: 工作台布局 V2，支持拖拽式卡片布局与全局样式（不使用 shadow DOM）
category: layout
source: "@next-bricks/advanced"
---

# eo-workbench-layout-v2

> 工作台布局 V2，支持拖拽式卡片布局与全局样式（不使用 shadow DOM）

## Props

| 属性                       | 类型                                 | 必填 | 默认值 | 说明                                                         |
| -------------------------- | ------------------------------------ | ---- | ------ | ------------------------------------------------------------ |
| cardTitle                  | `string`                             | 否   | -      | 编辑模式下左侧卡片列表面板的标题                             |
| isEdit                     | `boolean`                            | 否   | -      | 是否进入编辑模式，编辑模式下可拖拽调整布局并显示卡片选择面板 |
| layouts                    | `ExtraLayout[]`                      | 否   | -      | 当前布局配置，每项对应一个卡片的位置与大小及样式信息         |
| toolbarBricks              | `{ useBrick: UseSingleBrickConf[] }` | 否   | -      | 编辑模式下工具栏区域的自定义构件                             |
| componentList              | `WorkbenchComponent[]`               | 否   | -      | 组件列表，每项包含 key、title、useBrick 和 position 信息     |
| customDefaultCardConfigMap | `Record<string, CardStyleConfig>`    | 否   | -      | 自定义卡片默认配置，用于覆盖默认卡片样式配置                 |
| showSettingButton          | `boolean`                            | 否   | -      | 是否显示设置按钮，用于触发页面样式和布局设置                 |
| gap                        | `number`                             | 否   | -      | 卡片之间的间距（px）                                         |

## Events

| 事件         | detail                                                                                              | 说明                           |
| ------------ | --------------------------------------------------------------------------------------------------- | ------------------------------ |
| change       | `ExtraLayout[]` — 当前布局配置数组                                                                  | 布局发生变化时触发             |
| save         | `ExtraLayout[]` — 保存时的布局配置数组                                                              | 点击保存按钮时触发             |
| cancel       | `void`                                                                                              | 点击取消按钮时触发             |
| setting      | `void`                                                                                              | 点击设置按钮时触发             |
| action.click | `{ action: SimpleAction; layouts: Layout[] }` — { action: 点击的操作项, layouts: 当前布局配置数组 } | 更多操作菜单中的操作点击时触发 |

## Methods

| 方法       | 参数                          | 返回值 | 说明         |
| ---------- | ----------------------------- | ------ | ------------ |
| setLayouts | `(layouts: Layout[]) => void` | `void` | 设置布局配置 |

## Examples

### Basic

展示工作台布局 V2 的基本用法，通过 layouts 和 componentList 配置卡片布局。

```yaml preview
- brick: eo-workbench-layout-v2
  properties:
    layouts:
      - i: hello
        x: 0
        y: 0
        w: 2
        h: 1
        type: hello
        cardWidth: 2
      - i: world
        x: 0
        y: 1
        w: 2
        h: 1
        type: world
        cardWidth: 2
      - i: small
        x: 2
        y: 0
        w: 1
        h: 1
        type: small
        cardWidth: 1
    componentList:
      - title: Hello 卡片
        key: hello
        position:
          i: hello
          x: 0
          y: 0
          w: 2
          h: 1
        useBrick:
          brick: div
          properties:
            style:
              padding: 16px
              background: "#fff"
              height: 100%
            textContent: Hello World
      - title: World 卡片
        key: world
        position:
          i: world
          x: 0
          y: 2
          w: 2
          h: 1
        useBrick:
          brick: div
          properties:
            style:
              padding: 16px
              background: "#fff"
              height: 100%
            textContent: World Content
      - title: Small 卡片
        key: small
        position:
          i: small
          x: 2
          y: 0
          w: 1
          h: 1
        useBrick:
          brick: div
          properties:
            style:
              padding: 16px
              background: "#fff"
              height: 100%
            textContent: Small
```

### Edit Mode with Settings

开启编辑模式，显示设置按钮，并监听 save、cancel、setting 事件。

```yaml preview
- brick: eo-workbench-layout-v2
  events:
    save:
      - action: console.log
    cancel:
      - action: console.log
    change:
      - action: console.log
    setting:
      - action: console.log
  properties:
    isEdit: true
    showSettingButton: true
    gap: 16
    layouts:
      - i: hello
        x: 0
        y: 0
        w: 2
        h: 1
        type: hello
        cardWidth: 2
      - i: small
        x: 2
        y: 0
        w: 1
        h: 1
        type: small
        cardWidth: 1
    componentList:
      - title: Hello 卡片
        key: hello
        position:
          i: hello
          x: 0
          y: 0
          w: 2
          h: 1
        useBrick:
          brick: div
          properties:
            style:
              padding: 16px
              height: 100%
            textContent: Hello World
      - title: Small 卡片
        key: small
        position:
          i: small
          x: 2
          y: 0
          w: 1
          h: 1
        useBrick:
          brick: div
          properties:
            style:
              padding: 16px
              height: 100%
            textContent: Small
      - title: Extra 卡片
        key: extra
        position:
          i: extra
          x: 0
          y: 2
          w: 2
          h: 1
        useBrick:
          brick: div
          properties:
            style:
              padding: 16px
              height: 100%
            textContent: Extra Content
```
