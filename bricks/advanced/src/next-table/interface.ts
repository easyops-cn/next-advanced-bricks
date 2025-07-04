import type { ColumnType, TablePaginationConfig } from "antd/es/table";
import type {
  SortOrder,
  ExpandableConfig as TableExpandableConfig,
  TableRowSelection,
} from "antd/es/table/interface.js";
import type { UseBrickConf } from "@next-core/types";
import { CSSProperties } from "react";
import type { TableProps } from "antd/es/table";

export interface NextTableProps {
  rowKey?: string;
  columns?: Column[];
  cell?: CellConfig;
  dataSource?: DataSource;
  frontSearch?: boolean;
  pagination?: PaginationType;
  loading?: boolean;
  multiSort?: boolean;
  sort?: Sort | Sort[];
  rowSelection?: RowSelectionType;
  selectedRowKeys?: (string | number)[];
  hiddenColumns?: (string | number)[];
  expandable?: ExpandableType;
  expandedRowKeys?: (string | number)[];
  childrenColumnName?: string;
  rowDraggable?: boolean;
  searchFields?: (string | string[])[];
  size?: TableProps<RecordType>["size"];
  showHeader?: boolean;
  bordered?: boolean;
  scrollConfig?: TableScroll;
  optimizedColumns?: (string | number)[];
  themeVariant?: "default" | "elevo";
}

export type TableScroll = TableProps<RecordType>["scroll"] | false;

export type RecordType = Record<string, any>;

export interface Column
  extends Pick<
    ColumnType<RecordType>,
    | "align"
    | "colSpan"
    | "dataIndex"
    | "ellipsis"
    | "fixed"
    | "rowScope"
    | "showSorterTooltip"
    | "sortDirections"
    | "title"
    | "width"
  > {
  key?: string | number;
  /** 表头自定义展示构件 */
  headerBrick?: WithUseBrick;
  /** 内容自定义展示构件 */
  useBrick?: UseBrickConf;
  /** 记录表格列合并的值的 key */
  cellColSpanKey?: string;
  /** 记录表格行合并的值的 key */
  cellRowSpanKey?: string;
  /** 是否可排序 */
  sortable?: boolean;
  /** 前端搜索时，多列排序优先级，数字越大优先级越高 */
  sortPriority?: number;
  /** 垂直对齐方式 */
  verticalAlign?: CSSProperties["verticalAlign"];
  /** 单元格样式 */
  cellStyle?: CSSProperties;
  /** 头部单元格样式 */
  headerStyle?: CSSProperties;
  cellStatus?: CellStatus;
}

export interface CellStatus {
  dataIndex?: string;
  mapping: CellStatusMap[];
}

export interface CellStatusMap {
  value: unknown;
  leftBorderColor: string;
}

export interface CellConfig extends WithUseBrick {
  header?: WithUseBrick;
}

export interface WithUseBrick {
  useBrick?: UseBrickConf;
}

export interface DataSource {
  list?: RecordType[];
  total?: number;
  page?: number;
  pageSize?: number;
}

interface PaginationConfig
  extends Pick<
    TablePaginationConfig,
    | "disabled"
    | "hideOnSinglePage"
    | "pageSizeOptions"
    | "responsive"
    | "showLessItems"
    | "showQuickJumper"
    | "showSizeChanger"
    | "showTitle"
    | "simple"
    | "size"
  > {
  showTotal?: boolean;
}

export type PaginationType = false | PaginationConfig | undefined;

interface RowSelectionConfig
  extends Pick<
    TableRowSelection<RecordType>,
    | "columnWidth"
    | "fixed"
    | "hideSelectAll"
    | "preserveSelectedRowKeys"
    | "type"
    | "checkStrictly"
  > {
  showSelectInfo?: boolean;
  rowDisabled?: string | boolean;
}

export type RowSelectionType = boolean | RowSelectionConfig | undefined;

interface ExpandableConfig
  extends Pick<
    TableExpandableConfig<RecordType>,
    | "columnWidth"
    | "expandRowByClick"
    | "defaultExpandAllRows"
    | "fixed"
    | "showExpandColumn"
  > {
  expandIconBrick?: {
    useBrick: UseBrickConf;
  };
  expandedRowBrick?: {
    useBrick: UseBrickConf;
  };
  rowExpandable?: string | boolean;
}

export type ExpandableType = boolean | ExpandableConfig | undefined;

export interface Sort {
  columnKey?: string | number;
  order?: SortOrder;
}
