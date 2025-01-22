大型表格

## Examples

### Basic

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

### Expandable

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

```yaml preview
- brick: eo-next-table
  properties:
    pagination: false
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

设置 childrenColumnName 来指定树形结构的列名，展开功能的配置可以使用 expandable。目前树形结构暂不支持拖拽。

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

#### With Row Selection

设置 rowSelection.checkStrictly 来控制父子数据选中状态是否关联。注意，关联的时候，节点勾选传导策略为【只勾选可触达的可勾选节点】

```yaml preview
- brick: eo-next-table
  events:
    row.select:
      - action: console.log
  properties:
    pagination: false
    childrenColumnName: student
    rowSelection:
      checkStrictly: false
      indentSize: 50
      rowDisabled: <% DATA.rowData.age > 30 %>
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
              age: 34
              address: Guangzhou
        - key: "2"
          name: Bob
          age: 27
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
              age: 35
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

#### With Front Search

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
  properties:
    id: table
    searchFields:
      - name
      - age
      - address
    pagination: false
    childrenColumnName: student
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
              age: 34
              address: Guangzhou
        - key: "2"
          name: Bob
          age: 27
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
              age: 35
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
  # Dynamic columns, such as by dates
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
