---
tagName: data-view.modern-style-treemap
displayName: WrappedDataViewModernStyleTreemap
description: 现代风树图
category: big-screen-content
source: "@next-bricks/data-view"
---

# data-view.modern-style-treemap

> 现代风树图

## Props

| 属性               | 类型                                                                                                                   | 必填 | 默认值              | 说明              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- | ---- | ------------------- | ----------------- |
| data               | `TreemapData`                                                                                                          | 是   | -                   | 数据              |
| tail               | `"treemapBinary" \| "treemapDice" \| "treemapResquarify" \| "treemapSlice" \| "treemapSliceDice" \| "treemapSquarify"` | 否   | `"treemapSquarify"` | 平铺方法          |
| leafUseBrick       | `{ useBrick: UseBrickConf }`                                                                                           | 否   | -                   | 叶子节点 useBrick |
| leafContainerStyle | `React.CSSProperties`                                                                                                  | 否   | -                   | 叶子节点容器样式  |
| tooltipUseBrick    | `{ useBrick: UseBrickConf }`                                                                                           | 否   | -                   | tooltip useBrick  |
| tooltipStyle       | `React.CSSProperties`                                                                                                  | 否   | -                   | tooltip 容器样式  |

## Events

| 事件          | detail                                                                    | 说明               |
| ------------- | ------------------------------------------------------------------------- | ------------------ |
| treemap.click | `TreemapData` — { name: 节点名称, value: 节点数值, children: 子节点列表 } | 点击叶子节点时触发 |

## Examples

### Basic

展示现代风树图的基本用法，包含叶子节点自定义渲染和 tooltip 配置。

```yaml preview
- brick: data-view.modern-style-treemap
  properties:
    data:
      name: flare
      children:
        - name: analytics
          children:
            - name: cluster
              children:
                - name: AgglomerativeCluster
                  value: 3938
                - name: CommunityStructure
                  value: 3812
                - name: HierarchicalCluster
                  value: 6714
                - name: MergeEdge
                  value: 743
            - name: graph
              children:
                - name: BetweennessCentrality
                  value: 3534
                - name: LinkDistance
                  value: 5731
                - name: MaxFlowMinCut
                  value: 7840
                - name: ShortestPaths
                  value: 5914
                - name: SpanningTree
                  value: 3416
            - name: optimization
              children:
                - name: AspectRatioBanker
                  value: 7074
        - name: animate
          children:
            - name: Easing
              value: 17010
            - name: FunctionSequence
              value: 5842
            - name: interpolate
              children:
                - name: ArrayInterpolator
                  value: 1983
                - name: ColorInterpolator
                  value: 2047
                - name: DateInterpolator
                  value: 1375
                - name: Interpolator
                  value: 8746
                - name: MatrixInterpolator
                  value: 2202
                - name: NumberInterpolator
                  value: 1382
                - name: ObjectInterpolator
                  value: 1629
                - name: PointInterpolator
                  value: 1675
                - name: RectangleInterpolator
                  value: 2042
            - name: ISchedulable
              value: 1041
            - name: Parallel
              value: 5176
            - name: Pause
              value: 449
            - name: Scheduler
              value: 5593
            - name: Sequence
              value: 5534
            - name: Transition
              value: 9201
            - name: Transitioner
              value: 19975
            - name: TransitionEvent
              value: 1116
            - name: Tween
              value: 6006
        - name: data
          children:
            - name: converters
              children:
                - name: Converters
                  value: 721
                - name: DelimitedTextConverter
                  value: 4294
                - name: GraphMLConverter
                  value: 9800
                - name: IDataConverter
                  value: 1314
                - name: JSONConverter
                  value: 2220
            - name: DataField
              value: 1759
            - name: DataSchema
              value: 2165
            - name: DataSet
              value: 586
            - name: DataSource
              value: 3331
            - name: DataTable
              value: 772
            - name: DataUtil
              value: 3322
        - name: display
          children:
            - name: DirtySprite
              value: 8833
            - name: LineSprite
              value: 1732
            - name: RectSprite
              value: 3623
            - name: TextSprite
              value: 10066
        - name: flex
          children:
            - name: FlareVis
              value: 4116
        - name: physics
          children:
            - name: DragForce
              value: 1082
            - name: GravityForce
              value: 1336
            - name: IForce
              value: 319
            - name: NBodyForce
              value: 10498
            - name: Particle
              value: 2822
            - name: Simulation
              value: 9983
            - name: Spring
              value: 2213
            - name: SpringForce
              value: 1681
    style:
      width: 100%
      height: 800px
      display: block
      background-color: "#1c1e21"
    tooltipUseBrick:
      useBrick:
        brick: span
        properties:
          textContent: <% DATA.data?.name %>
    leafUseBrick:
      useBrick:
        - if: <% DATA.x1 - DATA.x0 > 70 && DATA.y1 - DATA.y0 > 100 %>
          brick: div
          properties:
            style:
              padding: "8px 6px"
          slots:
            "":
              type: bricks
              bricks:
                - brick: div
                  properties:
                    textContent: <% DATA.data.name %>
                    style:
                      "font-size": "20px"
                      "font-weight": 500
                      color: "#FFFFFF"
                      "line-height": "28px"
                      "text-shadow": "0px 1px 4px #3366FF"
                      overflow: "hidden"
                      "white-space": "nowrap"
                      "text-overflow": "ellipsis"
  events:
    treemap.click:
      - action: console.log
```

### Custom Tiling

展示使用不同平铺算法的现代风树图。

```yaml preview
- brick: data-view.modern-style-treemap
  properties:
    tail: treemapBinary
    leafContainerStyle:
      border: "1px solid rgba(74, 234, 255, 0.3)"
    data:
      name: root
      children:
        - name: A
          value: 500
        - name: B
          value: 300
        - name: C
          value: 200
        - name: D
          value: 150
        - name: E
          value: 100
    style:
      width: 100%
      height: 400px
      display: block
      background-color: "#1c1e21"
    leafUseBrick:
      useBrick:
        brick: div
        properties:
          textContent: <% DATA.data.name %>
          style:
            color: "#FFFFFF"
            padding: "8px"
```
