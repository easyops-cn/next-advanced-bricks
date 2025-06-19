用于手工绘图的画布。

注意：将配套另外一个用于展示的画布构件。

## Examples

### Basic

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              id: "container-1",
              decorator: "container",
              view: {
                direction: "left",
                text: "上层服务" ,
                level: 1
              },
            },
            {
              type: "decorator",
              id: "container-2",
              decorator: "container",
              view: {
                direction: "left",
                text: "应用" ,
                level: 2
              },
            },
            {
              type: "edge", 
              source: "X",
              target: "Y",
            },
            {
              type: "edge",
              source: "Z", 
              target: "W",
            },
            {
              type: "edge",
              source: "X",
              target: "Z",
              data: {
                virtual: true,
              }
            },
          ].concat(
            ["A","B","X", "Y", "Z", "W",].map((id) => ({
              type: "node",
              id,
              containerId: ["W","Z","X","Y"].includes(id)?"container-1":"container-2",
              data: {
                name: `Node ${id}`,
              }, 
              view: {
                x: ["A","B","Z","X","Y"].includes(id)?null:Math.round(
                  id === "X"
                    ? 200 + Math.random() * 200
                    : id === "Y"
                    ? Math.random() * 300
                    : 300 + Math.random() * 300
                ),
                y: ["A","B","Z","X","Y"].includes(id)?null:(id === "X" ? 0 : 300) + Math.round((Math.random() * 200)),
                width: 60,
                height: 60,
              }
            }))
          ).concat([
            {
              type: "decorator",
              id: "text-1",
              decorator: "text", 
              view: {
                x: 300,
                y: 120,
                width: 100,
                height: 20,
                text: "Hello\nWorld!",
                style: {
                  // 垂直书写（从右到左）
                  writingMode: "vertical-rl",
                },
              },
            },
          ])
        %>
    - name: dragging
    - name: activeTarget
    - name: contextMenuDetail
    - name: scale
      value: 1
  children:
    - brick: div
      properties:
        style:
          width: 200px
          display: flex
          flexDirection: column
          gap: 1em
          border-right: "1px solid var(--palette-gray-6)"
          overflow: scroll
      children:
        - brick: eo-button
          properties:
            textContent: Add random nodes
          events:
            click:
              target: eo-draw-canvas
              method: addNodes
              args:
                - |
                  <%
                    ((...seeds) => seeds.map((seed) => ({
                      id: seed,
                      data: {
                        name: String(seed),
                      },
                    })))(
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                    )
                  %>
              callback:
                success:
                  action: console.log
                  args:
                    - Added nodes
                    - <% EVENT.detail %>
        - brick: eo-button
          properties:
            textContent: Add nodes to container-1
          events:
            click:
              target: eo-draw-canvas
              method: addNodes
              args:
                - |
                  <%
                    ((...seeds) => seeds.map((seed) => ({
                      id: seed,
                      containerId: "container-1",
                      data: {
                        name: String(seed),
                      },
                    })))(
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                    )
                  %>
              callback:
                success:
                  action: console.log
                  args:
                    - Added nodes
                    - <% EVENT.detail %>
        - brick: eo-button
          properties:
            textContent: "Add edge: Y => Z"
          events:
            click:
              target: eo-draw-canvas
              method: addEdge
              args:
                - source: Y
                  target: Z
                  data:
                    virtual: true
        - brick: :forEach
          dataSource:
            - X
            - Y
          children:
            - brick: eo-button
              properties:
                textContent: <% `Add nodes below ${ITEM}` %>
              events:
                click:
                  target: eo-draw-canvas
                  method: updateCells
                  args:
                    - |
                      <%
                        CTX.initialCells.concat([
                          {
                            type: "edge",
                            source: ITEM,
                            target: "U",
                          },
                          {
                            type: "edge",
                            source: ITEM,
                            target: "V",
                          },
                          {
                            type: "node",
                            id: "U",
                            data: {
                              name: "U"
                            }
                          },
                          {
                            type: "node",
                            id: "V",
                            data: {
                              name: "V"
                            }
                          },
                        ])
                      %>
                    - reason: add-related-nodes
                      parent: <% ITEM %>
                  callback:
                    success:
                      action: console.log
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag nodes below
        - brick: :forEach
          dataSource: |
            <%
              ["A", "B", "C"].map((id) => ({
                type: "node",
                id,
                data: {
                  name: `Node ${id}`,
                },
              }))
            %>
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% ITEM.data.name %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, ...ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropNode
                    args:
                      - position: <% EVENT.detail %>
                        id: <% ITEM.id %>
                        data: <% ITEM.data %>
                    callback:
                      success:
                        if: <% EVENT.detail %>
                        then:
                          action: message.success
                          args:
                            - <% JSON.stringify(EVENT.detail) %>
                        else:
                          action: message.warn
                          args:
                            - Unexpected drop position
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag decorators below
        - brick: :forEach
          dataSource:
            - area
            - text
            - line
            - rect
            - container.top
            - container.right
            - container.bottom
            - container.left
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% _.upperFirst(ITEM) %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, type: "decorator", decorator: ITEM.split(".")[0]} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropDecorator
                    args:
                      - |
                        <%
                          ITEM === "line"
                            ? {
                                position: EVENT.detail,
                                decorator: ITEM.split(".")[0],
                              }
                            : {
                                position: EVENT.detail,
                                decorator: ITEM.split(".")[0],
                                text: _.upperFirst(ITEM),
                                direction: ITEM.split(".").pop(),
                              }
                        %>
                    callback:
                      success:
                        if: <% !EVENT.detail %>
                        action: message.warn
                        args:
                          - Unexpected drop position
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            allowEdgeToArea: true
            dragBehavior: lasso
            layoutOptions:
              initialLayout: layered-architecture
              snap:
                # grid: true
                object: true
            # Initial nodes only
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: '<% `Node ${DATA.node.id}${DATA.node.locked ? " (locked)" : ""}` %>'
                    status: |
                      <%=
                        (CTX.activeTarget?.type === "multi"
                          ? CTX.activeTarget.targets
                          : CTX.activeTarget
                          ? [CTX.activeTarget]
                          : []
                        ).some((target) => (
                          target.type === "node" && target.id === DATA.node.id
                        ))
                          ? "highlighted"
                          : "default"
                      %>
            defaultEdgeLines:
              - if: <% DATA.edge.data?.virtual %>
                dashed: true
              - if: <% !DATA.edge.data?.virtual %>
                dotted: true
                showStartArrow: true
                markers:
                  - placement: start
                    type: circle
                  - placement: end
                    type: arrow
            cells: <% CTX.initialCells %>
            lineConnector: true
            lineSettings:
              type: polyline
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cells.move:
              action: message.info
              args:
                - <% `You just moved ${EVENT.detail.length} cells` %>
            cell.resize:
              action: message.info
              args:
                - <% `You just resized ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.width)}, ${Math.round(EVENT.detail.height)})` %>
            cells.delete:
              action: message.warn
              args:
                - |
                  <% `You wanna delete ${EVENT.detail.length} cells?` %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - contextMenuDetail
                  - <% EVENT.detail %>
            edge.add:
              action: message.info
              args:
                - |
                  <% `Added an nice edge: ${JSON.stringify(EVENT.detail)}` %>
            edge.view.change:
              action: message.info
              args:
                - |
                  <% `Edge view changed: ${JSON.stringify(EVENT.detail)}` %>
            decorator.view.change:
              action: message.info
              args:
                - |
                  <% `Decorator view changed: ${JSON.stringify(EVENT.detail)}` %>
            decorator.text.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            node.container.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        !CTX.contextMenuDetail
        ? []
        : CTX.contextMenuDetail.target?.type === "multi"
        ? [
            {
              text: "锁定/取消锁定",
              event: "toggle-lock",
            },
          ]
        : [
          ...(CTX.contextMenuDetail.locked ? [] : [{
            text: "添加边",
            event: "add-edge",
          },{
            text: "移除",
            event: "remove"
          }]),
          {
            text: "锁定/取消锁定",
            event: "toggle-lock",
          },
        ].filter((action) =>
          CTX.contextMenuDetail.cell.type === "node" || (
            CTX.contextMenuDetail.cell.type === "decorator" &&
            CTX.contextMenuDetail.cell.decorator === "area"
          ) || action.event !== "add-edge"
        )
      %>
  events:
    remove:
      target: eo-draw-canvas
      method: updateCells
      args:
        - |
          <%
            CTX.initialCells.filter((cell) =>
              !(
                CTX.contextMenuDetail.cell.type === "edge"
                  ? cell.type === "edge" && CTX.contextMenuDetail.cell.source === cell.source && CTX.contextMenuDetail.cell.target === cell.target
                  : cell.id === CTX.contextMenuDetail.cell.id ||
                    (cell.type === "edge" && (
                      CTX.contextMenuDetail.cell.id === cell.source ||
                      CTX.contextMenuDetail.cell.id === cell.target))
              )
            )
          %>
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.contextMenuDetail.cell.id %>
      callback:
        success:
          - target: eo-draw-canvas
            method: addEdge
            args:
              - source: <% EVENT.detail.source.id %>
                target: <% EVENT.detail.target.id %>
    toggle-lock:
      target: eo-draw-canvas
      method: toggleLock
      args:
        - <% CTX.contextMenuDetail.target %>
      callback:
        success:
          action: console.log
          args:
            - "Updated cells after toggle lock:"
            - <% EVENT.detail %>
```

### Line labels

设置连线文字。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      flexDirection: column
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "edge",
              source: "X",
              target: "Y",
              description: "X->Y",
              placement: "end",
              view: {
                type: "polyline"
              }
            },
            {
              type: "edge",
              source: "X",
              target: "Z"
            },
            {
              type: "node",
              id: "X",
              data: {
                name: "Node X",
              },
              view: {
                x: 100,
                y: 100,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Y",
              data: {
                name: "Node Y",
              },
              view: {
                x: 0,
                y: 300,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Z",
              data: {
                name: "Node Z",
              },
              view: {
                x: 300,
                y: 200,
                width: 60,
                height: 60,
              }
            },
          ]
        %>
    - name: activeTarget
    - name: scale
      value: 1
  children:
    - brick: eo-draw-canvas
      properties:
        style:
          width: 100%
          height: 100%
        activeTarget: <%= CTX.activeTarget %>
        fadeUnrelatedCells: true
        dragBehavior: lasso
        layoutOptions:
          snap:
            object: true
        defaultNodeSize: [60, 60]
        defaultNodeBricks:
          - useBrick:
              brick: diagram.experimental-node
              properties:
                textContent: <% `Node ${DATA.node.id}` %>
                status: |
                  <%=
                    (CTX.activeTarget?.type === "multi"
                      ? CTX.activeTarget.targets
                      : CTX.activeTarget
                      ? [CTX.activeTarget]
                      : []
                    ).some((target) => (
                      target.type === "node" && target.id === DATA.node.id
                    ))
                      ? "highlighted"
                      : "default"
                  %>
        cells: <% CTX.initialCells %>
        lineConnector: true
        defaultEdgeLines:
          - callLabelOnDoubleClick: enableEditing
            label:
              placement: <% DATA.edge.placement %>
              offset: 10
              useBrick:
                brick: diagram.editable-label
                properties:
                  label: <% DATA.edge.description %>
                  type: line
                  # Set `readOnly: true` for eo-display-canvas
                  # readOnly: true
                events:
                  label.change:
                    # Make sure only trigger update if label actually changed
                    if: <% (DATA.edge.description || "") !== (EVENT.detail || "") %>
                    action: context.replace
                    args:
                      - initialCells
                      - |-
                        <%
                          CTX.initialCells.map((edge) =>
                            edge.type === "edge" &&
                            edge.source === DATA.edge.source &&
                            edge.target === DATA.edge.target
                              ? { ...edge, description: EVENT.detail }
                              : edge
                          )
                        %>
      events:
        activeTarget.change:
          action: context.replace
          args:
            - activeTarget
            - <% EVENT.detail %>
        cell.delete:
          action: message.warn
          args:
            - |
              <% `You wanna delete ${EVENT.detail.type} ${EVENT.detail.type === "edge" ? `(${EVENT.detail.source} => ${EVENT.detail.target})` : EVENT.detail.id}?` %>
        scale.change:
          action: context.replace
          args:
            - scale
            - <% EVENT.detail %>
```

### Line settings

设置属性 `lineSettings` 来调整新的连线的样式，例如使用折线或直线。注意，该设置不影响已有的 edge 的连线样式。

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      flexDirection: column
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              decorator: "line",
              id: "line-1",
              view: {
                source: {
                  x: 200,
                  y: 200,
                },
                target: {
                  x: 250,
                  y: 150,
                },
                // type: "polyline",
                vertices: [
                  {
                    x: 180,
                    y: 125,
                  },
                ],
                markers: [{
                  placement: "end",
                  type: "arrow",
                }],
              },
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
            },
            {
              type: "node",
              id: "X",
              data: {
                name: "Node X",
              },
              view: {
                x: 100,
                y: 100,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Y",
              data: {
                name: "Node Y",
              },
              view: {
                x: 0,
                y: 300,
                width: 60,
                height: 60,
              }
            },
            {
              type: "node",
              id: "Z",
              data: {
                name: "Node Z",
              },
              view: {
                x: 300,
                y: 200,
                width: 60,
                height: 60,
              }
            },
          ]
        %>
    - name: dragging
    - name: activeTarget
    - name: targetCell
    - name: scale
      value: 1
    - name: lineType
      value: polyline
  children:
    - brick: div
      children:
        - brick: eo-radio
          properties:
            type: button
            value: polyline
            options:
              - polyline
              - curve
              - straight
          events:
            change:
              action: context.replace
              args:
                - lineType
                - <% EVENT.detail.value %>
    - brick: div
      properties:
        style:
          flex: 1
          minHeight: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            dragBehavior: lasso
            layoutOptions:
              snap:
                object: true
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        (CTX.activeTarget?.type === "multi"
                          ? CTX.activeTarget.targets
                          : CTX.activeTarget
                          ? [CTX.activeTarget]
                          : []
                        ).some((target) => (
                          target.type === "node" && target.id === DATA.node.id
                        ))
                          ? "highlighted"
                          : "default"
                      %>
            cells: <% CTX.initialCells %>
            defaultEdgeLines:
              - jumps: true
            lineConnector: true
            lineSettings: |
              <%= { type: CTX.lineType } %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - targetCell
                  - <% EVENT.detail.cell %>
            edge.add:
              action: message.info
              args:
                - |
                  <% `Added an nice edge: ${JSON.stringify(EVENT.detail)}` %>
            edge.view.change:
              action: message.info
              args:
                - |
                  <% `Edge view changed: ${JSON.stringify(EVENT.detail)}` %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        (["node"].includes(CTX.targetCell?.type )||CTX.targetCell?.decorator=="area") ? [
          {
            text: "添加边",
            event: "add-edge",
          }
        ] : [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
  events:
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.targetCell.id %>
      callback:
        success:
          - target: eo-draw-canvas
            method: addEdge
            args:
              - source: <% EVENT.detail.source.id %>
                target: <% EVENT.detail.target.id %>
```

### Force layout

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              id: "area-1",
              decorator: "area",
              view: {
                x: 10,
                y: 20,
                width: 400,
                height: 300,
              },
            },
             {
              type: "decorator",
              id: "container-1",
              decorator: "container",
              view: {
               x: 50,
                y: 400,
                width: 280,
                height: 120,
                direction: "top",
                text: " 上层服务"
              },
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
            },
            {
              type: "edge",
              source: "X",
              target: "Z",
              data: {
                virtual: true,
              }
            },
          ].concat(
            ["X", "Y", "Z", "W"].map((id) => ({
              type: "node",
              id,
              containerId: ["X","Y","Z"].includes(id)?"container-1":undefined,
              data: {
                name: `Node ${id}`,
              },
              view: {
                width: 60,
                height: 60,
              }
            }))
          ).concat([
            {
              type: "decorator",
              id: "text-1",
              decorator: "text",
              view: {
                x: 100,
                y: 120,
                width: 100,
                height: 20,
                text: "Hello!"
              },
            },
          ])
        %>
    - name: dragging
    - name: activeTarget
    - name: targetCell
    - name: scale
      value: 1
  children:
    - brick: div
      properties:
        style:
          width: 180px
          display: flex
          flexDirection: column
          gap: 1em
      children:
        - brick: eo-button
          properties:
            textContent: Add random nodes
          events:
            click:
              target: eo-draw-canvas
              method: addNodes
              args:
                - |
                  <%
                    ((...seeds) => seeds.map((seed) => ({
                      id: seed,
                      data: {
                        name: String(seed),
                      },
                    })))(
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                    )
                  %>
              callback:
                success:
                  action: console.log
                  args:
                    - Added nodes
                    - <% EVENT.detail %>
        - brick: eo-button
          properties:
            textContent: "Add edge: Y => Z"
          events:
            click:
              target: eo-draw-canvas
              method: addEdge
              args:
                - source: Y
                  target: Z
                  data:
                    virtual: true
        - brick: :forEach
          dataSource:
            - X
            - Y
          children:
            - brick: eo-button
              properties:
                textContent: <% `Add nodes below ${ITEM}` %>
              events:
                click:
                  target: eo-draw-canvas
                  method: updateCells
                  args:
                    - |
                      <%
                        CTX.initialCells.concat([
                          {
                            type: "edge",
                            source: ITEM,
                            target: "U",
                          },
                          {
                            type: "edge",
                            source: ITEM,
                            target: "V",
                          },
                          {
                            type: "node",
                            id: "U",
                            data: {
                              name: "U"
                            }
                          },
                          {
                            type: "node",
                            id: "V",
                            data: {
                              name: "V"
                            }
                          },
                        ])
                      %>
                    - reason: add-related-nodes
                      parent: <% ITEM %>
                  callback:
                    success:
                      action: console.log
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag nodes below
        - brick: :forEach
          dataSource: |
            <%
              ["A", "B", "C"].map((id) => ({
                type: "node",
                id,
                data: {
                  name: `Node ${id}`,
                },
              }))
            %>
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% ITEM.data.name %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, ...ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropNode
                    args:
                      - position: <% EVENT.detail %>
                        id: <% ITEM.id %>
                        data: <% ITEM.data %>
                    callback:
                      success:
                        if: <% EVENT.detail %>
                        then:
                          action: message.success
                          args:
                            - <% JSON.stringify(EVENT.detail) %>
                        else:
                          action: message.warn
                          args:
                            - Unexpected drop position
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag decorators below
        - brick: :forEach
          dataSource:
            - area
            - text
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% _.upperFirst(ITEM) %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, type: "decorator", decorator: ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropDecorator
                    args:
                      - position: <% EVENT.detail %>
                        decorator: <% ITEM %>
                        text: '<% ITEM === "text" ? "Text" : undefined %>'
                    callback:
                      success:
                        if: <% !EVENT.detail %>
                        action: message.warn
                        args:
                          - Unexpected drop position
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            layout: force
            # Initial nodes only
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        CTX.activeTarget?.type === "node" && CTX.activeTarget.id === DATA.node.id
                          ? "highlighted"
                          // : CTX.unrelated.some(n =>
                          //     n.type === "node" && n.id === DATA.node.id
                          //   )
                          // ? "faded"
                          : "default"
                      %>
            defaultEdgeLines:
              - if: <% DATA.edge.data?.virtual %>
                dashed: true
            cells: <% CTX.initialCells %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.move:
              action: message.info
              args:
                - <% `You just moved ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.x)}, ${Math.round(EVENT.detail.y)})` %>
            cell.resize:
              action: message.info
              args:
                - <% `You just resized ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.width)}, ${Math.round(EVENT.detail.height)})` %>
            cell.delete:
              action: message.warn
              args:
                - |
                  <% `You wanna delete ${EVENT.detail.type} ${EVENT.detail.type === "edge" ? `(${EVENT.detail.source} => ${EVENT.detail.target})` : EVENT.detail.id}?` %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - targetCell
                  - <% EVENT.detail.cell %>
            decorator.text.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        CTX.targetCell?.type === "node" ? [
          {
            text: "添加边",
            event: "add-edge",
          }
        ] : [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
  events:
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.targetCell.id %>
      callback:
        success:
          target: eo-draw-canvas
          method: addEdge
          args:
            - source: <% EVENT.detail.source.id %>
              target: <% EVENT.detail.target.id %>
```

### Dagre layout

```yaml preview minHeight="600px"
- brick: div
  properties:
    style:
      display: flex
      height: 600px
      gap: 1em
  context:
    - name: initialCells
      value: |
        <%
          [
            {
              type: "decorator",
              id: "area-1",
              decorator: "area",
              view: {
                x: 10,
                y: 20,
                width: 400,
                height: 300,
              },
            },
            {
              type: "decorator",
              id: "container-1",
              decorator: "container",
              view: {
               x: 50,
                y: 400,
                width: 280,
                height: 120,
                direction: "top",
                text: " 上层服务"
              },
            },
            {
              type: "edge",
              source: "X",
              target: "Y",
            },
            {
              type: "edge",
              source: "X",
              target: "Z",
              data: {
                virtual: true,
              }
            },
            {
              type: "edge",
              source: "Z",
              target: "W",
            },
          ].concat(
            ["X", "Y", "Z", "W"].map((id) => ({
              type: "node",
              id,
              containerId: ["W","Z"].includes(id)?"container-1":undefined,
              data: {
                name: `Node ${id}`,
              },
              view: {
                width: 60,
                height: 60,
              }
            }))
          )
        %>
    - name: dragging
    - name: activeTarget
    - name: targetCell
    - name: scale
      value: 1
  children:
    - brick: div
      properties:
        style:
          width: 180px
          display: flex
          flexDirection: column
          gap: 1em
      children:
        - brick: eo-button
          properties:
            textContent: Add random nodes
          events:
            click:
              target: eo-draw-canvas
              method: addNodes
              args:
                - |
                  <%
                    ((...seeds) => seeds.map((seed) => ({
                      id: seed,
                      data: {
                        name: String(seed),
                      },
                    })))(
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                      Math.round(Math.random() * 1e6),
                    )
                  %>
              callback:
                success:
                  action: console.log
                  args:
                    - Added nodes
                    - <% EVENT.detail %>
        - brick: eo-button
          properties:
            textContent: "Add edge: Y => Z"
          events:
            click:
              target: eo-draw-canvas
              method: addEdge
              args:
                - source: Y
                  target: Z
                  data:
                    virtual: true
        - brick: :forEach
          dataSource:
            - X
            - Y
          children:
            - brick: eo-button
              properties:
                textContent: <% `Add nodes below ${ITEM}` %>
              events:
                click:
                  target: eo-draw-canvas
                  method: updateCells
                  args:
                    - |
                      <%
                        CTX.initialCells.concat([
                          {
                            type: "edge",
                            source: ITEM,
                            target: "U",
                          },
                          {
                            type: "edge",
                            source: ITEM,
                            target: "V",
                          },
                          {
                            type: "node",
                            id: "U",
                            data: {
                              name: "U"
                            }
                          },
                          {
                            type: "node",
                            id: "V",
                            data: {
                              name: "V"
                            }
                          },
                        ])
                      %>
                    - reason: add-related-nodes
                      parent: <% ITEM %>
                  callback:
                    success:
                      action: console.log
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag nodes below
        - brick: :forEach
          dataSource: |
            <%
              ["A", "B", "C"].map((id) => ({
                type: "node",
                id,
                data: {
                  name: `Node ${id}`,
                },
              }))
            %>
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% ITEM.data.name %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, ...ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropNode
                    args:
                      - position: <% EVENT.detail %>
                        id: <% ITEM.id %>
                        data: <% ITEM.data %>
                    callback:
                      success:
                        if: <% EVENT.detail %>
                        then:
                          action: message.success
                          args:
                            - <% JSON.stringify(EVENT.detail) %>
                        else:
                          action: message.warn
                          args:
                            - Unexpected drop position
        - brick: hr
          properties:
            style:
              width: 100%
        - brick: h3
          properties:
            textContent: Drag decorators below
        - brick: :forEach
          dataSource:
            - area
            - text
          children:
            - brick: diagram.experimental-node
              properties:
                textContent: <% _.upperFirst(ITEM) %>
                usage: library
              events:
                drag.move:
                  action: context.replace
                  args:
                    - dragging
                    - |
                      <% {position: EVENT.detail, type: "decorator", decorator: ITEM} %>
                drag.end:
                  - action: context.replace
                    args:
                      - dragging
                      - null
                  - target: eo-draw-canvas
                    method: dropDecorator
                    args:
                      - position: <% EVENT.detail %>
                        decorator: <% ITEM %>
                        text: '<% ITEM === "text" ? "Text" : undefined %>'
                    callback:
                      success:
                        if: <% !EVENT.detail %>
                        action: message.warn
                        args:
                          - Unexpected drop position
    - brick: div
      properties:
        style:
          flex: 1
          minWidth: 0
      children:
        - brick: eo-draw-canvas
          properties:
            style:
              width: 100%
              height: 100%
            activeTarget: <%= CTX.activeTarget %>
            fadeUnrelatedCells: true
            layout: dagre
            # Initial nodes only
            defaultNodeSize: [60, 60]
            defaultNodeBricks:
              - useBrick:
                  brick: diagram.experimental-node
                  properties:
                    textContent: <% `Node ${DATA.node.id}` %>
                    status: |
                      <%=
                        CTX.activeTarget?.type === "node" && CTX.activeTarget.id === DATA.node.id
                          ? "highlighted"
                          // : CTX.unrelated.some(n =>
                          //     n.type === "node" && n.id === DATA.node.id
                          //   )
                          // ? "faded"
                          : "default"
                      %>
            defaultEdgeLines:
              - dashed: <% !!DATA.edge.data?.virtual %>
                strokeColor: var(--palette-blue-6)
                overrides:
                  active:
                    strokeWidth: <% 2 * (DATA.edge?.data?.strokeWidth ?? 1) %>
                    strokeColor: cyan
            cells: <% CTX.initialCells %>
          events:
            activeTarget.change:
              action: context.replace
              args:
                - activeTarget
                - <% EVENT.detail %>
            cell.move:
              action: message.info
              args:
                - <% `You just moved ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.x)}, ${Math.round(EVENT.detail.y)})` %>
            cell.resize:
              action: message.info
              args:
                - <% `You just resized ${EVENT.detail.type} ${EVENT.detail.id} to (${Math.round(EVENT.detail.width)}, ${Math.round(EVENT.detail.height)})` %>
            cell.delete:
              action: message.warn
              args:
                - |
                  <% `You wanna delete ${EVENT.detail.type} ${EVENT.detail.type === "edge" ? `(${EVENT.detail.source} => ${EVENT.detail.target})` : EVENT.detail.id}?` %>
            cell.contextmenu:
              - target: eo-context-menu
                method: open
                args:
                  - position:
                      - <% EVENT.detail.clientX %>
                      - <% EVENT.detail.clientY %>
              - action: context.replace
                args:
                  - targetCell
                  - <% EVENT.detail.cell %>
            decorator.text.change:
              action: message.info
              args:
                - <% JSON.stringify(EVENT.detail) %>
            scale.change:
              action: context.replace
              args:
                - scale
                - <% EVENT.detail %>
- brick: diagram.experimental-node
  properties:
    usage: dragging
    textContent: |
      <%= CTX.dragging?.type === "decorator" ? (CTX.dragging.decorator === "text" ? "Text" : null) : CTX.dragging?.data.name %>
    decorator: |
      <%= CTX.dragging?.type === "decorator" ? CTX.dragging.decorator : null %>
    style: |
      <%=
        {
          left: `${CTX.dragging?.position[0]}px`,
          top: `${CTX.dragging?.position[1]}px`,
          transform: `scale(${CTX.scale})`,
          transformOrigin: "0 0",
          padding: CTX.dragging?.decorator === "text" ? "0.5em" : "0"
        }
      %>
    hidden: <%= !CTX.dragging %>
- brick: eo-context-menu
  properties:
    actions: |
      <%=
        CTX.targetCell?.type === "node" ? [
          {
            text: "添加边",
            event: "add-edge",
          }
        ] : [
          {
            text: `Test ${CTX.targetCell?.type}`,
            event: `test-${CTX.targetCell?.type}`,
          }
        ]
      %>
  events:
    add-edge:
      target: eo-draw-canvas
      method: manuallyConnectNodes
      args:
        - <% CTX.targetCell.id %>
      callback:
        success:
          target: eo-draw-canvas
          method: addEdge
          args:
            - source: <% EVENT.detail.source.id %>
              target: <% EVENT.detail.target.id %>
```
