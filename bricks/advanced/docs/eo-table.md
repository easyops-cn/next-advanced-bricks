---
tagName: eo-table
displayName: WrappedEoTable
description: 简易表格构件。⚠️ 通常情况下，应使用 `eo-next-table` 替代。
category: table
source: "@next-bricks/advanced"
---

# eo-table

> 简易表格构件。⚠️ 通常情况下，应使用 `eo-next-table` 替代。

## Props

| 属性                                    | 类型                                                                  | 必填 | 默认值        | 说明                                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------- | ---- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| showCard                                | `any`                                                                 | 否   | `true`        | 是否显示外层卡片                                                                                                                      |
| rowSelection                            | `false \| TableRowSelection<any>`                                     | 否   | -             | 表格行是否可选择，具体查阅：[rowSelection](https://ant.design/components/table-cn/#rowSelection)                                      |
| rowKey                                  | `string`                                                              | 否   | -             | 指定每一行的 key，不指定则默认为索引 index。强烈建议设置该属性，否则在某些情况下可能行为不如预期。                                    |
| hiddenColumns                           | `Array<string \| number>`                                             | 否   | -             | 隐藏相应列（输入对应的 dataIndex 或者 key 即可）                                                                                      |
| showSelectInfo                          | `any`                                                                 | 否   | `false`       | 是否显示已选择信息和清除按钮。仅在设置了 `rowSelection` 时有效。                                                                      |
| filters                                 | `Record<string, string[]>`                                            | 否   | -             | 表头过滤的过滤项，key 为 column 的 dataIndex，value 为过滤值集合。                                                                    |
| configProps                             | `any`                                                                 | 否   | -             | ant-design 的 Table 相关配置项，具体查阅：[Table](https://ant.design/components/table-cn/#Table)                                      |
| sort                                    | `string`                                                              | 否   | -             | 被排序列的 dataIndex。通常来自于 url 参数，可以设置成 `${QUERY.sort}`。                                                               |
| order                                   | `string \| number`                                                    | 否   | -             | 升序/降序，可以设置成 `${QUERY.order}`。                                                                                              |
| rowDisabledConfig                       | `RowDisabledProps \| RowDisabledProps[]`                              | 否   | -             | 配置每一行是否禁用，field 表示数据源中的字段路径，value 表示与其字段比较的值，operator 表示两者比较的方法，结果为 true 时会禁用当前行 |
| expandedRowBrick                        | `{ useBrick?: UseSingleBrickConf }`                                   | 否   | -             | 自定义行展开的构件                                                                                                                    |
| expandIcon                              | `{ collapsedIcon: GeneralIconProps; expandedIcon: GeneralIconProps }` | 否   | -             | 自定义展开图标。                                                                                                                      |
| expandIconAsCell                        | `any`                                                                 | 否   | `true`        | 展开的图标是否为一个单元格，默认显示在第一列                                                                                          |
| expandIconColumnIndex                   | `number`                                                              | 否   | -             | 展开的图标显示在哪一列，当 `expandIconAsCell` 为 false 时生效                                                                         |
| expandRowByClick                        | `boolean`                                                             | 否   | -             | 通过点击行来展开子行                                                                                                                  |
| optimizedColumns                        | `Array<string \| number>`                                             | 否   | -             | 优化渲染的列（输入对应的 dataIndex），针对配置了 useBrick 的列                                                                        |
| stripEmptyExpandableChildren            | `any`                                                                 | 否   | `false`       | 树形数据展示时是否需要去除空数组                                                                                                      |
| defaultExpandAllRows                    | `boolean`                                                             | 否   | -             | 初始时，是否展开所有行                                                                                                                |
| ellipsisInfo                            | `boolean`                                                             | 否   | -             | 是否显示省略信息                                                                                                                      |
| expandedRowKeys                         | `string[]`                                                            | 否   | -             | 展开的行的 rowKey                                                                                                                     |
| selectAllChildren                       | `boolean`                                                             | 否   | -             | 树形数据展示时，行选择父节点是否同步勾选/取消勾选所有子节点                                                                           |
| defaultSelectAll                        | `boolean`                                                             | 否   | -             | 是否默认选择所有行                                                                                                                    |
| childrenColumnName                      | `any`                                                                 | 否   | `"children"`  | 指定树形结构的列名                                                                                                                    |
| sortable                                | `any`                                                                 | 否   | `true`        | 是否支持排序。当对应列的 sorter 设置成 true 时则可排序                                                                                |
| frontSearch                             | `boolean`                                                             | 否   | -             | 是否前端进行搜索，配合 `presentational-bricks.brick-input` 使用                                                                       |
| frontSearchQuery                        | `any`                                                                 | 否   | `""`          | 前端搜索参数                                                                                                                          |
| exactSearch                             | `boolean`                                                             | 否   | -             | 是否精确搜索                                                                                                                          |
| frontSearchFilterKeys                   | `string[]`                                                            | 否   | -             | 进行前端搜索的字段，支持嵌套的写法如 `["name","value.a"]`                                                                             |
| page                                    | `number`                                                              | 否   | -             | 页码                                                                                                                                  |
| pageSize                                | `number`                                                              | 否   | -             | 页码条数                                                                                                                              |
| scrollConfigs                           | `TableProps["scroll"]`                                                | 否   | `{ x: true }` | 表格是否可滚动，也可以指定滚动区域的宽、高                                                                                            |
| qField                                  | `any`                                                                 | 否   | `"q"`         | 把过滤条件更新到 url 时的字段名                                                                                                       |
| tableDraggable                          | `boolean`                                                             | 否   | -             | 表格行是否可拖拽，注意，树形数据的表格不支持该功能                                                                                    |
| zebraPattern                            | `boolean`                                                             | 否   | -             | 是否展示斑马纹                                                                                                                        |
| storeCheckedByUrl                       | `boolean`                                                             | 否   | -             | 翻页时是否记住之前选中的项                                                                                                            |
| extraRows                               | `Record<string, unknown>[]`                                           | 否   | `[]`          | 额外的行，通常为跨页勾选时，不在当前页的行                                                                                            |
| autoSelectParentWhenAllChildrenSelected | `boolean`                                                             | 否   | -             | 当所有子节点选中时，自动选中父节点                                                                                                    |
| thTransparent                           | `boolean`                                                             | 否   | -             | 表格表头是否透明                                                                                                                      |
| showHeader                              | `any`                                                                 | 否   | `true`        | 是否显示表头                                                                                                                          |
| pagination                              | `false \| TablePaginationConfig`                                      | 否   | -             | 是否显示分页                                                                                                                          |
| size                                    | `SizeType \| "x-small"`                                               | 否   | -             | 表格大小（antd 原生 size）                                                                                                            |
| type                                    | `RowSelectionType`                                                    | 否   | -             | 选框类型（单选/多选）                                                                                                                 |
| shouldUpdateUrlParams                   | `any`                                                                 | 否   | `true`        | 是否更新 url 参数                                                                                                                     |
| shouldRenderWhenUrlParamsUpdate         | `any`                                                                 | 否   | `true`        | 更新 url 参数时是否触发页面重新渲染                                                                                                   |
| selectedRowKeys                         | `React.Key[]`                                                         | 否   | `[]`          | 指定选中项的 key 数组                                                                                                                 |

## Events

| 事件                   | detail                                                                           | 说明                                     |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| page.update            | `Record<string, number>` — { page: 当前页码, pageSize: 每页条数 }                | 页码变化                                 |
| filter.update          | `Record<string, number>` — { page: 当前页码, pageSize: 每页条数 }                | 每页条数变化                             |
| select.update          | `Record<string, any>[]` — 选中的行数据数组                                       | 勾选框变化，detail 中为所选的行数据      |
| select.row.keys.update | `string[]` — 选中的行 key 集合                                                   | 勾选框变化，detail 中为所选的行 key 集合 |
| sort.update            | `SortUpdateEventDetail` — { sort: 排序列的 key/dataIndex, order: 升序/降序 }     | 排序变化                                 |
| row.expand             | `RowExpandEventDetail` — { expanded: 是否展开, record: 被点击的行数据 }          | 点击展开图标时触发                       |
| expand.rows.change     | `ExpandRowsChangeEventDetail` — { expandedRows: 当前展开的所有行的 rowKey 集合 } | 展开的行变化时触发                       |
| row.drag               | `RowDragEventDetail` — { data: 拖拽后重新排序的所有行数据 }                      | 表格行拖拽结束发生的事件                 |

## Methods

| 方法             | 参数                           | 返回值 | 说明       |
| ---------------- | ------------------------------ | ------ | ---------- |
| filterSourceData | `(event: CustomEvent) => void` | `void` | 搜索过滤   |
| expandAll        | `() => void`                   | `void` | 展开所有行 |

## Examples

### Basic

展示表格的基本用法，配置 columns 和 dataSource 展示列表数据。

```yaml preview
- brick: eo-table
  properties:
    showCard: false
    rowKey: key
    configProps:
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
```

### Row Selection

配置 rowSelection 开启行选择，通过 select.update 事件获取选中行数据。

```yaml preview
- brick: eo-table
  events:
    select.update:
      - action: console.log
    select.row.keys.update:
      - action: console.log
  properties:
    showCard: false
    rowKey: key
    rowSelection: true
    showSelectInfo: true
    configProps:
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

配置 expandedRowBrick 自定义展开行内容，通过 row.expand 事件监听展开状态变化。

```yaml preview
- brick: eo-table
  events:
    row.expand:
      - action: console.log
    expand.rows.change:
      - action: console.log
  properties:
    showCard: false
    rowKey: key
    expandedRowBrick:
      useBrick:
        brick: span
        properties:
          textContent: <% DATA.rowData.address %>
    configProps:
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

### Sortable

配置 sorter 列实现排序功能，通过 sort.update 事件获取排序变化。

```yaml preview
- brick: eo-table
  events:
    sort.update:
      - action: console.log
  properties:
    showCard: false
    rowKey: key
    configProps:
      columns:
        - dataIndex: name
          key: name
          title: Name
        - dataIndex: age
          key: age
          title: Age
          sorter: true
        - dataIndex: address
          key: address
          title: Address
      dataSource:
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
```

### Draggable

开启 tableDraggable 支持行拖拽排序，拖拽结束触发 row.drag 事件。

```yaml preview
- brick: eo-table
  events:
    row.drag:
      - action: console.log
  properties:
    showCard: false
    rowKey: key
    tableDraggable: true
    configProps:
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
