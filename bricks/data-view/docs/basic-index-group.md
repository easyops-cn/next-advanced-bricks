---
tagName: data-view.basic-index-group
displayName: WrappedDataViewBasicIndexGroup
description: 基础指标组构件
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.basic-index-group

> 基础指标组构件

## Props

| 属性     | 类型          | 必填 | 默认值         | 说明                     |
| -------- | ------------- | ---- | -------------- | ------------------------ |
| itemList | `ItemProps[]` | 是   | -              | 指标组的数据源           |
| width    | `number`      | 否   | -              | 容器组宽度               |
| gap      | `number`      | 否   | `30`           | 指标卡片之间的间距       |
| layout   | `string`      | 否   | `"left-right"` | 布局，左右或上下两种形式 |

## Examples

### Basic

展示基础指标组的多种布局形式，包含有描述和无描述的左右布局及上下布局。

```yaml preview
- brick: div
  properties:
    textContent: 左右布局，有描述，不换行
- brick: data-view.basic-index-group
  properties:
    width: 1000
    style:
      margin-top: 20px
    itemList:
      - type: host
        title: 主机
        number: 289
        description: 较昨日增长24.5%
        trendIcon: up
      - type: cloud
        title: 容器
        number: 24
        description: 较昨日下降10.2%
        trendIcon: down
      - type: network
        title: 网络设施
        number: 24
        description: 较昨日下降10.2%
        trendIcon: down
      - type: database
        title: 数据库
        number: 24
        description: 较昨日下降10.2%
        trendIcon: down
- brick: div
  properties:
    textContent: 左右布局，有描述，换行
    style:
      margin-top: 20px
- brick: data-view.basic-index-group
  properties:
    width: 500
    style:
      margin-top: 20px
    itemList:
      - type: host
        title: 主机
        number: 289
        description: 较昨日增长24.5%
        trendIcon: up
      - type: cloud
        title: 容器
        number: 24
        description: 较昨日下降10.2%
        trendIcon: down
      - type: network
        title: 网络设施
        number: 24
        description: 较昨日下降10.2%
        trendIcon: down
      - type: database
        title: 数据库
        number: 24
        description: 较昨日下降10.2%
        trendIcon: down
- brick: div
  properties:
    textContent: 左右布局，无描述
    style:
      margin-top: 20px
- brick: data-view.basic-index-group
  properties:
    width: 500
    gap: 48
    style:
      margin-top: 20px
    itemList:
      - type: host
        title: 主机
        number: 289
      - type: cloud
        title: 容器
        number: 24
      - type: network
        title: 网络设施
        number: 24
      - type: database
        title: 数据库
        number: 24
- brick: div
  properties:
    textContent: 上下布局
    style:
      margin-top: 20px
- brick: data-view.basic-index-group
  properties:
    width: 1000
    layout: top-bottom
    gap: 48
    style:
      margin-top: 20px
    itemList:
      - type: host
        title: 主机
        number: 289
      - type: cloud
        title: 容器
        number: 24
      - type: network
        title: 网络设施
        number: 24
      - type: database
        title: 数据库
        number: 24
```
