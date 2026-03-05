---
tagName: eo-next-table
displayName: WrappedEoNextTable
description: 大型表格
category: table
source: "@next-bricks/advanced"
---

# eo-next-table

> 大型表格

## Props

| 属性               | 类型                     | 必填 | 默认值        | 说明                                                                                       |
| ------------------ | ------------------------ | ---- | ------------- | ------------------------------------------------------------------------------------------ |
| rowKey             | `string`                 | 否   | `"key"`       | 指定表格行的 key                                                                           |
| columns            | `Column[]`               | 否   | -             | 列定义                                                                                     |
| cell               | `CellConfig`             | 否   | -             | 单元格统一配置，可配置 useBrick 自定义渲染所有单元格及表头                                 |
| dataSource         | `DataSource`             | 否   | -             | 数据源                                                                                     |
| frontSearch        | `boolean`                | 否   | -             | 是否前端搜索                                                                               |
| pagination         | `PaginationType`         | 否   | -             | 分页配置                                                                                   |
| loading            | `boolean`                | 否   | -             | 显示加载中状态                                                                             |
| multiSort          | `boolean`                | 否   | -             | 是否支持多列排序，前端搜索时需设置 column.sortPriority 优先级                              |
| sort               | `Sort \| Sort[]`         | 否   | -             | 排序信息                                                                                   |
| rowSelection       | `RowSelectionType`       | 否   | -             | 表格行可选择配置                                                                           |
| selectedRowKeys    | `(string \| number)[]`   | 否   | -             | 选中项的 key                                                                               |
| hiddenColumns      | `(string \| number)[]`   | 否   | -             | 隐藏的列（输入对应的 column.key）                                                          |
| expandable         | `ExpandableType`         | 否   | -             | 表格行展开配置                                                                             |
| expandedRowKeys    | `(string \| number)[]`   | 否   | -             | 展开项的 key                                                                               |
| childrenColumnName | `string`                 | 否   | `"children"`  | 树形结构的列名                                                                             |
| rowDraggable       | `boolean`                | 否   | -             | 表格行拖拽配置                                                                             |
| rowClickable       | `boolean`                | 否   | -             | 表格行可点击（激活鼠标手势）                                                               |
| searchFields       | `(string \| string[])[]` | 否   | -             | 进行前端搜索的字段，支持嵌套的写法。不配置的时候默认为对所有 column.dataIndex 进行前端搜索 |
| size               | `TableProps["size"]`     | 否   | `"large"`     | 表格大小                                                                                   |
| showHeader         | `boolean`                | 否   | `true`        | 是否显示表头                                                                               |
| bordered           | `boolean`                | 否   | -             | 是否显示边框                                                                               |
| scrollConfig       | `TableScroll`            | 否   | `{ x: true }` | 滚动配置                                                                                   |
| optimizedColumns   | `(string \| number)[]`   | 否   | -             | 优化渲染的列（输入对应的 column.key）                                                      |
| themeVariant       | `"default" \| "elevo"`   | 否   | -             | 主题变体                                                                                   |

## Events

| 事件                 | detail                                                                  | 说明                                                   |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------ |
| page.change          | `PageOrPageSizeChangeEventDetail` — 改变后的页码及每页条数              | page 或 pageSize 改变的回调                            |
| page.size.change     | `PageOrPageSizeChangeEventDetail` — 改变后的页码及每页条数              | pageSize 变化的回调（已废弃，统一用 page.change 事件） |
| sort.change          | `Sort \| Sort[] \| undefined` — 当前排序的信息                          | 排序变化的回调                                         |
| row.click            | `RecordType` — 被点击的行数据                                           | 行点击时的回调                                         |
| row.select           | `RowSelectEventDetail` — 改变后的 rowKey 及行数据                       | 行选中项发生变化时的回调                               |
| row.select.v2        | `RecordType[]` — 改变后的行数据                                         | 行选中项发生变化时的回调（v2 版本）                    |
| row.expand           | `RowExpandEventDetail` — 当前行的展开情况及数据                         | 点击展开图标时触发                                     |
| expanded.rows.change | `(string \| number)[]` — 所有展开行的 key                               | 展开的行变化时触发                                     |
| row.drag             | `RowDragEventDetail` — 重新排序的行数据、拖拽的行数据、放下位置的行数据 | 表格行拖拽结束发生的事件                               |

## Methods

| 方法   | 参数                                                                 | 返回值 | 说明     |
| ------ | -------------------------------------------------------------------- | ------ | -------- |
| search | <ul><li>`params: { q: string }` - 搜索参数，q 为搜索关键词</li></ul> | `void` | 前端搜索 |

## Examples

### Basic

展示大型表格的基本用法，配置 columns 和 dataSource，并支持分页与操作列。

```yaml preview
- brick: eo-next-table
  events:
    page.change:
      - action: console.log
    page.size.change:
      - action: console.log
  properties:
    scrollConfig:
      x: false
    pagination:
      pageSizeOptions:
        - 5
        - 10
        - 20
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
      - dataIndex: remarks
        key: remarks
        title: Long Column Long Column Long Column Long Column
        width: 200
        ellipsis: true
      - dataIndex: operator
        key: operator
        title: 操作
        width: 200
        useBrick:
          - brick: div
            properties:
              style:
                display: flex
                gap: 4px
            children:
              - brick: eo-button
                properties:
                  type: link
                  size: small
                  icon:
                    lib: antd
                    icon: edit
                events:
                  click:
                    - action: message.info
                      args:
                        - <% DATA.rowData.name %>
              - brick: eo-button
                properties:
                  type: link
                  size: small
                  danger: true
                  icon:
                    lib: antd
                    icon: delete
                events:
                  click:
                    - action: message.error
                      args:
                        - <% JSON.stringify(DATA) %>
    dataSource:
      pageSize: 5
      page: 1
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
          remarks: Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
          remarks: Long text Long text
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
        - key: 3
          name: Sam
          age: 28
          address: Guangzhou
          remarks: Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text
        - key: 4
          name: Bob
          age: 35
          address: Hainan
        - key: 5
          name: Ava
          age: 23
          address: Beijing
        - key: 6
          name: Sophia
          age: 20
          address: Shanghai
        - key: 7
          name: Charlotte
          age: 33
          address: Chongqing
        - key: 8
          name: Mia
          age: 18
          address: Chengdu
        - key: 9
          name: Noah
          age: 38
          address: Hainan
        - key: 10
          name: William
          age: 16
          address: Taiwan
```

### Fixed & Scroll & useBrick

展示固定列、水平滚动及通过 useBrick 自定义单元格内容。

```yaml preview
- brick: eo-next-table
  events:
    page.change:
      - action: console.log
    page.size.change:
      - action: console.log
  properties:
    scrollConfig:
      x: max-content
    pagination:
      pageSizeOptions:
        - 5
        - 10
        - 20
    columns:
      - dataIndex: name
        key: name
        title: Name
        width: 100
        fixed: true
        headerBrick:
          useBrick:
            brick: span
            properties:
              style:
                color: red
              textContent: <% DATA.title %>
        useBrick:
          - brick: span
            properties:
              style:
                color: pink
              textContent: <% DATA.cellData %>
      - dataIndex: address
        key: column1
        title: column1
      - dataIndex: address
        key: column2
        title: column2
      - dataIndex: address
        key: column3
        title: column3
      - dataIndex: address
        key: column4
        title: column4
      - dataIndex: address
        key: column5
        title: column5
      - dataIndex: address
        key: column6
        title: column6
      - dataIndex: address
        key: column7
        title: column7
      - dataIndex: address
        key: column8
        title: column8
      - dataIndex: address
        key: column9
        title: column9
      - dataIndex: address
        key: column10
        title: column10
      - dataIndex: age
        key: age
        title: Age
        width: 100
        fixed: right
    dataSource:
      pageSize: 5
      page: 1
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
        - key: 3
          name: Sam
          age: 28
          address: Guangzhou
        - key: 4
          name: Bob
          age: 35
          address: Hainan
        - key: 5
          name: Ava
          age: 23
          address: Beijing
        - key: 6
          name: Sophia
          age: 20
          address: Shanghai
        - key: 7
          name: Charlotte
          age: 33
          address: Chongqing
        - key: 8
          name: Mia
          age: 18
          address: Chengdu
        - key: 9
          name: Noah
          age: 38
          address: Hainan
        - key: 10
          name: William
          age: 16
          address: Taiwan
```

### Front Search

开启前端搜索，配合 search 方法与 searchFields 实现关键字过滤，支持多列排序。

```yaml preview
- brick: eo-search-bar
  children:
    - brick: eo-search
      slot: start
      properties:
        placeholder: Enter keyword
      events:
        search:
          target: "#table"
          method: search
          args:
            - q: <% EVENT.detail %>
- brick: eo-next-table
  events:
    page.change:
      - action: console.log
    page.size.change:
      - action: console.log
    sort.change:
      - action: console.log
  properties:
    id: table
    frontSearch: true
    searchFields:
      - address
    sort:
      columnKey: age
      order: descend
    multiSort: true
    pagination:
      pageSizeOptions:
        - 5
        - 10
        - 20
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
        sortable: true
        sortPriority: 1
      - dataIndex: address
        key: address
        title: Address
        sortable: true
        sortPriority: 2
    dataSource:
      pageSize: 5
      page: 1
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
        - key: 3
          name: Sam
          age: 28
          address: Guangzhou
        - key: 4
          name: Bob
          age: 35
          address: Hainan
        - key: 5
          name: Ava
          age: 23
          address: Beijing
        - key: 6
          name: Sophia
          age: 20
          address: Shanghai
        - key: 7
          name: Charlotte
          age: 33
          address: Chongqing
        - key: 8
          name: Mia
          age: 18
          address: Chengdu
        - key: 9
          name: Noah
          age: 38
          address: Hainan
        - key: 10
          name: William
          age: 16
          address: Taiwan
```

### Row Selection

配置 rowSelection 开启行选择功能，选中状态变化时触发 row.select 事件。

```yaml preview
- brick: eo-next-table
  events:
    row.select:
      - action: console.log
  properties:
    rowSelection: true
    pagination:
      pageSizeOptions:
        - 5
        - 10
        - 20
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
        useBrick:
          - brick: eo-tag
            properties:
              color: |
                <% DATA.cellData > 18 ? "green" : "red" %>
              textContent: <% DATA.cellData %>
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      pageSize: 5
      page: 1
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
        - key: 3
          name: Sam
          age: 28
          address: Guangzhou
        - key: 4
          name: Bob
          age: 35
          address: Hainan
        - key: 5
          name: Ava
          age: 23
          address: Beijing
        - key: 6
          name: Sophia
          age: 20
          address: Shanghai
        - key: 7
          name: Charlotte
          age: 33
          address: Chongqing
        - key: 8
          name: Mia
          age: 18
          address: Chengdu
        - key: 9
          name: Noah
          age: 38
          address: Hainan
        - key: 10
          name: William
          age: 16
          address: Taiwan
```

### Row Click

配置 rowClickable 开启行点击功能，点击行时触发 row.click 事件。

```yaml preview
- brick: eo-next-table
  events:
    row.click:
      - action: console.log
  properties:
    rowClickable: true
    pagination: false
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
```

### Expandable

配置 expandable 开启行展开功能，支持展开行内嵌套表格。

```yaml preview
- brick: eo-next-table
  events:
    row.expand:
      - action: console.log
    expanded.rows.change:
      - action: console.log
  properties:
    expandable:
      rowExpandable: <% DATA.rowData.key % 2 === 0 %>
      expandedRowBrick:
        useBrick:
          brick: eo-next-table
          properties:
            scrollConfig: false
            pagination: false
            bordered: true
            rowKey: title
            columns:
              - dataIndex: title
                key: title
                title: 标题
              - dataIndex: description
                key: description
                title: 描述
              - dataIndex: operator
                key: operator
                title: 操作
                useBrick:
                  brick: eo-link
                  properties:
                    textContent: 操作
            dataSource:
              list: <% DATA.rowData.info %>
    pagination:
      pageSizeOptions:
        - 5
        - 10
        - 20
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      pageSize: 5
      page: 1
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
          info:
            - title: 测试1
              description: 这是一串描述
              id: 1
            - title: 测试2
              description: 这是一串描述
              id: 2
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
          info:
            - title: 测试3
              description: 这是一串描述
              id: 3
            - title: 测试4
              description: 这是一串描述
              id: 4
        - key: 3
          name: Sam
          age: 28
          address: Shenzhen
        - key: 4
          name: Bob
          age: 35
          address: Hainan
        - key: 5
          name: Ava
          age: 23
          address: Beijing
        - key: 6
          name: Sophia
          age: 20
          address: Nanjing
        - key: 7
          name: Charlotte
          age: 33
          address: Chongqing
        - key: 8
          name: Mia
          age: 18
          address: Chengdu
        - key: 9
          name: Noah
          age: 38
          address: Wuhan
        - key: 10
          name: William
          age: 16
          address: Taiwan
```

### Bordered

展示带边框的表格样式。

```yaml preview
- brick: eo-next-table
  properties:
    bordered: true
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      pageSize: 5
      page: 1
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 3
          name: Sam
          age: 28
          address: Shenzhen
```

### Size

展示不同尺寸（large、middle、small）的表格效果。

```yaml preview
brick: eo-content-layout
children:
  - brick: :forEach
    dataSource:
      - large
      - middle
      - small
    children:
      - brick: strong
        properties:
          textContent: "<% `Size: ${ITEM}` %>"
      - brick: eo-next-table
        properties:
          size: <% ITEM %>
          pagination: false
          columns:
            - dataIndex: name
              key: name
              title: Name
            - dataIndex: age
              key: age
              title: Age
            - dataIndex: address
              key: address
              title: Address
          dataSource:
            pageSize: 5
            page: 1
            list:
              - key: 0
                name: Jack
                age: 18
                address: Guangzhou
              - key: 1
                name: Alex
                age: 20
                address: Shanghai
              - key: 3
                name: Sam
                age: 28
                address: Shenzhen
```

### Draggable

开启 rowDraggable 支持行拖拽排序，拖拽结束触发 row.drag 事件。

```yaml preview
- brick: eo-next-table
  events:
    row.drag:
      - action: console.log
  properties:
    rowKey: name
    rowDraggable: true
    pagination: false
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
        - key: 3
          name: Sam
          age: 28
          address: Guangzhou
        - key: 4
          name: Bob
          age: 35
          address: Hainan
        - key: 5
          name: Ava
          age: 23
          address: Beijing
        - key: 6
          name: Sophia
          age: 20
          address: Shanghai
        - key: 7
          name: Charlotte
          age: 33
          address: Chongqing
        - key: 8
          name: Mia
          age: 18
          address: Chengdu
        - key: 9
          name: Noah
          age: 38
          address: Hainan
        - key: 10
          name: William
          age: 16
          address: Taiwan
```

### RowSpan & ColSpan

通过列配置的 colSpan、cellColSpanKey、cellRowSpanKey 实现单元格合并。

```yaml preview
- brick: eo-next-table
  properties:
    pagination: false
    bordered: true
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: mobile
        key: mobile
        title: phone
        colSpan: 2
        cellColSpanKey: mobileColSpan
        cellRowSpanKey: mobileRowSpan
      - dataIndex: landlines
        key: landlines
        colSpan: 0
        cellColSpanKey: landlinesColSpan
        cellRowSpanKey: landlinesRowSpan
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
          mobile: 18900010222
          landlines: 0571-22098909
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
          mobile: 18900010333
          mobileColSpan: 2
          landlinesColSpan: 0
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
          mobile: 18900010444
          landlines: 0571-22098707
          landlinesRowSpan: 2
        - key: 3
          name: Sam
          age: 28
          address: Guangzhou
          mobile: 18900010555
          landlines: 0571-22098707
          landlinesRowSpan: 0
          mobileRowSpan: 2
        - key: 4
          name: Bob
          age: 35
          address: Hainan
          mobile: 18900010555
          landlines: 0571-22098606
          mobileRowSpan: 0
```

### Tree

设置 childrenColumnName 来指定树形结构的列名，展开功能的配置可以使用 expandable。

```yaml preview
- brick: eo-next-table
  events:
    row.expand:
      - action: console.log
    expanded.rows.change:
      - action: console.log
  properties:
    pagination: false
    childrenColumnName: student
    expandable:
      defaultExpandAllRows: true
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: "1"
          name: Jack
          age: 18
          address: Guangzhou
          student:
            - key: "11"
              name: Alex
              age: 20
              address: Shanghai
            - key: "12"
              name: Lucy
              age: 16
              address: Yunnan
            - key: "13"
              name: Sam
              age: 28
              address: Guangzhou
        - key: "2"
          name: Bob
          age: 35
          address: Hainan
          student:
            - key: "21"
              name: Ava
              age: 23
              address: Beijing
            - key: "22"
              name: Sophia
              age: 20
              address: Shanghai
            - key: "23"
              name: Charlotte
              age: 33
              address: Chongqing
              student:
                - key: "231"
                  name: Mia
                  age: 18
                  address: Chengdu
                - key: "232"
                  name: Noah
                  age: 38
                  address: Hainan
                - key: "233"
                  name: William
                  age: 16
                  address: Taiwan
```

### Dynamic Columns

通过 cell 配置统一自定义单元格渲染，结合动态列实现灵活的表格展示。

```yaml preview
brick: eo-next-table
properties:
  cell:
    useBrick:
      - if: <% DATA.columnKey !== '01-13' %>
        brick: em
        properties:
          textContent: <% DATA.cellData %>
      - if: <% DATA.columnKey === '01-13' %>
        brick: del
        properties:
          textContent: <% DATA.cellData %>
    header:
      useBrick:
        brick: em
        properties:
          textContent: <% DATA.title %>
  columns: <% CTX.dates %>
  dataSource:
    list:
      - "01-11": "abc"
        "01-12": "def"
        "01-13": "ghi"
        "01-14": "jkl"
      - "01-11": "123"
        "01-12": "345"
        "01-13": "789"
        "01-14": "-"
context:
  - name: dates
    value: |
      <%
        new Array(4).fill(null).map(
          (d, i) => moment('2023-01-11').add(i, 'days').format('MM-DD')
        ).map((key) => ({
          dataIndex: key,
          key,
          title: key,
        }))
      %>
```

### Cell Status

通过列的 cellStatus 配置，根据数据值设置单元格左边框颜色来表示状态。

```yaml preview
- brick: eo-next-table
  properties:
    columns:
      - dataIndex: name
        key: name
        title: Name
        cellStatus:
          dataIndex: age
          mapping:
            - value: 18
              leftBorderColor: green
            - value: 20
              leftBorderColor: blue
            - value: 28
              leftBorderColor: red
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      pageSize: 5
      page: 1
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 3
          name: Sam
          age: 28
          address: Shenzhen
```

### Hidden Columns

通过 hiddenColumns 隐藏指定列，传入对应的 column.key 即可。

```yaml preview
- brick: eo-next-table
  properties:
    hiddenColumns:
      - age
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
```

### Selected Row Keys

通过 selectedRowKeys 设置默认选中的行。

```yaml preview
- brick: eo-next-table
  events:
    row.select:
      - action: console.log
    row.select.v2:
      - action: console.log
  properties:
    rowSelection: true
    selectedRowKeys:
      - 0
      - 2
    pagination: false
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
```

### Expanded Row Keys

通过 expandedRowKeys 设置默认展开的行。

```yaml preview
- brick: eo-next-table
  events:
    row.expand:
      - action: console.log
    expanded.rows.change:
      - action: console.log
  properties:
    expandedRowKeys:
      - 0
    expandable:
      expandedRowBrick:
        useBrick:
          brick: span
          properties:
            textContent: 展开内容
    pagination: false
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
        - key: 2
          name: Lucy
          age: 16
          address: Yunnan
```

### Loading

显示加载中状态。

```yaml preview
- brick: eo-next-table
  properties:
    loading: true
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
```

### Show Header

通过 showHeader 控制是否显示表头。

```yaml preview
- brick: eo-next-table
  properties:
    showHeader: false
    pagination: false
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
```

### Optimized Columns

通过 optimizedColumns 指定需要优化渲染的列。

```yaml preview
- brick: eo-next-table
  properties:
    optimizedColumns:
      - name
    pagination: false
    columns:
      - dataIndex: name
        key: name
        title: Name
      - dataIndex: age
        key: age
        title: Age
      - dataIndex: address
        key: address
        title: Address
    dataSource:
      list:
        - key: 0
          name: Jack
          age: 18
          address: Guangzhou
        - key: 1
          name: Alex
          age: 20
          address: Shanghai
```

### Theme Variant Elevo

使用 themeVariant 为表格设置 elevo 主题样式。

```yaml preview
brick: ai-portal.home-container
properties:
  style:
    padding: 2em
    backgroundColor: "#d8d8d8"
children:
  - brick: eo-next-table
    properties:
      themeVariant: elevo
      pagination: false
      columns:
        - dataIndex: name
          key: name
          title: Name
        - dataIndex: age
          key: age
          title: Age
        - dataIndex: address
          key: address
          title: Address
      dataSource:
        pageSize: 5
        page: 1
        list:
          - key: 0
            name: Jack
            age: 18
            address: Guangzhou
          - key: 1
            name: Alex
            age: 20
            address: Shanghai
          - key: 3
            name: Sam
            age: 28
            address: Shenzhen
```
