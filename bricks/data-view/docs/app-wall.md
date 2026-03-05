---
tagName: data-view.app-wall
displayName: WrappedDataViewAppWall
description: 应用墙
category: big-screen-layout
source: "@next-bricks/data-view"
---

# data-view.app-wall

> 应用墙

## Props

| 属性                      | 类型                       | 必填 | 默认值                                                                                        | 说明                                                                                    |
| ------------------------- | -------------------------- | ---- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| dataSource                | `AppData[]`                | 是   | -                                                                                             | 数据                                                                                    |
| relations                 | `Relation[]`               | 是   | -                                                                                             | 关系                                                                                    |
| cardSize                  | `CardSize`                 | 否   | `{ width: 120, height: 160, outerWidth: 140, outerHeight: 180, lgWidth: 180, lgHeight: 240 }` | 卡的大小配置，注意这里卡片大小宽高将影响T台大小展示                                     |
| cardBrickName             | `AppWallCardBrickNameType` | 否   | `"data-view.app-wall-card-item"`                                                              | 卡片支持的构件类型                                                                      |
| useDblclick               | `boolean`                  | 否   | -                                                                                             | 是否使用双击事件，开启之后卡片不会触发内部dblclick事件展示梯台                          |
| useDistanceConfig         | `boolean`                  | 否   | -                                                                                             | 是否使用内置的distanceConfig配置                                                        |
| disabledDefaultClickEvent | `boolean`                  | 否   | -                                                                                             | 是否禁用触发默认单击事件，开启之后卡片不会触发内部click事件展示卡片，直接抛出了点击事件 |
| containerId               | `string`                   | 否   | -                                                                                             | 容器id，用于监听容器大小                                                                |
| noRotate                  | `boolean`                  | 否   | -                                                                                             | 控制是否旋转                                                                            |
| boundMargin               | `number`                   | 否   | `100`                                                                                         | 四周的边距                                                                              |
| useSystemPopover          | `boolean`                  | 否   | -                                                                                             | 是否使用系统卡片popover                                                                 |

## Events

| 事件                     | detail                                         | 说明                                                                   |
| ------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------- |
| system.card.button.click | `AppData` — 当前点击的应用数据                 | 系统卡片详情按钮点击事件                                               |
| left.btn.click           | `AppData` — 展示台左边按钮点击时传出的应用数据 | 展示台左边按钮点击事件                                                 |
| right.btn.click          | `AppData` — 展示台右边按钮点击时传出的应用数据 | 展示台右边按钮点击事件                                                 |
| on.card.dbclick          | `AppData` — 双击卡片时传出的应用数据           | 卡片双击事件，useDblclick 为 true 或当前节点 clusters 属性无数据时触发 |
| card.click               | `AppData` — 单击卡片时传出的应用数据           | 卡片单击事件，disabledDefaultClickEvent 为 true 时点击卡片触发         |

## Examples

### Basic

展示包含多个应用节点和关系连线的三维应用墙。

```yaml preview
- brick: data-view.app-wall
  properties:
    style:
      width: 1000px
      height: 600px
      background-color: "#1c1e21"
    relations:
      - source: 5e63e70340f6f
        target: 5e63e70340f76
      - source: 5e63e70340f73
        target: 5e63e70340f6f
      - source: 5e63e70340f73
        target: 5e63e70340f81
    dataSource:
      - key: 5e63e70340f6f
        status: normal
        cardItemProps:
          status: normal
          cardTitle: diss
          description: 数字孪生门店
        systemCardProps:
          status: normal
          cardTitle: 数字孪生门店
          itemList:
            - key: 实例ID
              value: 5d570a851bef6
            - key: 系统英文名称
              value: app-fms
            - key: 系统中文名称
              value: A财务系统
          buttonName: 应用墙大屏
        trapezoidalProps:
          leftBtnName: 应用健康监控大屏
          rightBtnName: 应用部署架构
      - key: 5e63e70340f51
        status: normal
        cardItemProps:
          status: normal
          cardTitle: img
          description: 购物系统
        systemCardProps:
          status: normal
          cardTitle: 购物系统
          itemList:
            - key: 实例ID
              value: 5d570a851bef7
            - key: 系统英文名称
              value: app-shop
            - key: 系统中文名称
              value: 购物系统
          buttonName: 应用墙大屏
        trapezoidalProps:
          leftBtnName: 应用健康监控大屏
          rightBtnName: 应用部署架构
      - key: 5e63e70340f73
        status: warning
        cardItemProps:
          status: warning
          cardTitle: crm
          description: 零售CRM
        systemCardProps:
          status: warning
          cardTitle: 零售CRM
          itemList:
            - key: 实例ID
              value: 5d570a851bef8
            - key: 系统英文名称
              value: app-crm
            - key: 系统中文名称
              value: 零售CRM
          buttonName: 应用墙大屏
        trapezoidalProps:
          leftBtnName: 应用健康监控大屏
          rightBtnName: 应用部署架构
      - key: 5e63e70340f76
        status: normal
        cardItemProps:
          status: normal
          cardTitle: pos
          description: 店铺收银系统
        systemCardProps:
          status: normal
          cardTitle: 店铺收银系统
          itemList:
            - key: 实例ID
              value: 5d570a851bef9
            - key: 系统英文名称
              value: app-pos
            - key: 系统中文名称
              value: 店铺收银系统
          buttonName: 应用墙大屏
        trapezoidalProps:
          leftBtnName: 应用健康监控大屏
          rightBtnName: 应用部署架构
      - key: 5e63e70340f81
        status: normal
        cardItemProps:
          status: normal
          cardTitle: pay
          description: 支付中心
        systemCardProps:
          status: normal
          cardTitle: 支付中心
          itemList:
            - key: 实例ID
              value: 5d570a851befa
            - key: 系统英文名称
              value: app-pay
            - key: 系统中文名称
              value: 支付中心
          buttonName: 应用墙大屏
        trapezoidalProps:
          leftBtnName: 应用健康监控大屏
          rightBtnName: 应用部署架构
    boundMargin: 80
    noRotate: false
    useSystemPopover: true
  events:
    system.card.button.click:
      action: console.log
    left.btn.click:
      action: console.log
    right.btn.click:
      action: console.log
    card.click:
      action: console.log
    on.card.dbclick:
      action: console.log
```

### 禁用默认点击行为

设置 disabledDefaultClickEvent 为 true，点击卡片时直接抛出 card.click 事件，不展示内部卡片详情。

```yaml preview
- brick: data-view.app-wall
  properties:
    style:
      width: 1000px
      height: 600px
      background-color: "#1c1e21"
    disabledDefaultClickEvent: true
    useDblclick: true
    useDistanceConfig: true
    dataSource:
      - key: node-1
        status: normal
        cardItemProps:
          status: normal
          cardTitle: app-a
          description: 应用A
        systemCardProps:
          status: normal
          cardTitle: 应用A
          itemList:
            - key: 实例ID
              value: inst-001
          buttonName: 详情
        trapezoidalProps:
          leftBtnName: 健康监控
          rightBtnName: 部署架构
      - key: node-2
        status: error
        cardItemProps:
          status: error
          cardTitle: app-b
          description: 应用B
        systemCardProps:
          status: error
          cardTitle: 应用B
          itemList:
            - key: 实例ID
              value: inst-002
          buttonName: 详情
        trapezoidalProps:
          leftBtnName: 健康监控
          rightBtnName: 部署架构
    relations:
      - source: node-1
        target: node-2
  events:
    card.click:
      action: console.log
    on.card.dbclick:
      action: console.log
```
