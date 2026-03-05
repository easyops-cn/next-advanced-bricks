---
tagName: data-view.china-map
displayName: WrappedDataViewChinaMap
description: 中国地图展示构件，支持全国地图和省级地图，可在地图上标注文字标签
category: ""
source: "@next-bricks/data-view"
---

# data-view.china-map

> 中国地图展示构件，支持全国地图和省级地图，可在地图上标注文字标签

## Props

| 属性       | 类型                      | 必填 | 默认值 | 说明                                                                   |
| ---------- | ------------------------- | ---- | ------ | ---------------------------------------------------------------------- |
| province   | `string \| undefined`     | 否   | -      | 省份名称，例如"广东"。如果设置，则只显示该省份的地图，否则显示全国地图 |
| dataSource | `DataItem[] \| undefined` | 否   | -      | 数据源                                                                 |
| maxScale   | `number \| undefined`     | 否   | `1`    | 最大缩放比例                                                           |
| textScale  | `number \| undefined`     | 否   | `1`    | 标签文本缩放比例                                                       |

## Examples

### Basic

展示带省份标签的全国地图。

```yaml preview height="600px"
brick: div
properties:
  style:
    height: calc(100vh - 4em)
    position: relative
children:
  - brick: data-view.china-map
    properties:
      dataSource:
        - text: "西藏 12311"
          province: 西藏
        - text: "四川 89781169"
          province: 四川
        - text: "台湾 234181"
          province: 台湾
        - text: "江西 21348"
          province: 江西
    # Currently this brick only looks well within dark theme
    lifeCycle:
      onPageLoad:
        action: theme.setTheme
        args:
          - dark-v2
```

### Province map

展示指定省份的地图并标注城市标签。

```yaml preview height="600px"
brick: div
properties:
  style:
    height: calc(100vh - 4em)
    position: relative
children:
  - brick: data-view.china-map
    properties:
      province: 广东
      dataSource:
        - text: "广州 12311"
          city: 广州
        - text: "深圳 89781169"
          city: 深圳
        - text: "湛江 234181"
          city: 湛江
    # Currently this brick only looks well within dark theme
    lifeCycle:
      onPageLoad:
        action: theme.setTheme
        args:
          - dark-v2
```

### Specific coordinates

通过手动指定经纬度来精确定位标签位置。

```yaml preview height="600px"
brick: div
properties:
  style:
    height: calc(100vh - 4em)
    position: relative
children:
  - brick: data-view.china-map
    properties:
      textScale: 2
      dataSource:
        - text: "北京昌平 21348"
          coordinate:
            - 116
            - 40
        - text: "山东青岛 4242"
          coordinate:
            - 119
            - 35.5
    # Currently this brick only looks well within dark theme
    lifeCycle:
      onPageLoad:
        action: theme.setTheme
        args:
          - dark-v2
```
