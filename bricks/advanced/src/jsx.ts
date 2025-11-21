import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { EoTree, EoTreeProps } from "./tree";
import type { TreeSelectBrick, TreeSelectProps } from "./tree-select";
import type { CascaderBrick, CascaderProps } from "./cascader";
import type { PdfViewer, PdfViewerProps } from "./pdf-viewer";
import type { EoTextTooltip, EoTextTooltipProps } from "./text-tooltip";
import type { EoNextTable, NextTableProps } from "./next-table";
import type { ColumnProp, Sort } from "./next-table/interface";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "eo-text-tooltip": DetailedHTMLProps<
        HTMLAttributes<EoTextTooltip>,
        EoTextTooltip
      > &
        EoTextTooltipProps;

      "eo-tree": DetailedHTMLProps<HTMLAttributes<EoTree>, EoTree> &
        EoTreeProps & {
          onCheck?: (event: CustomEvent<(string | number)[]>) => void;
          onCheckDetail?: (
            event: CustomEvent<{
              checkedKeys: (string | number)[];
              halfCheckedKeys: (string | number)[];
            }>
          ) => void;
          onExpand?: (event: CustomEvent<(string | number)[]>) => void;
          onNodeDrop?: (event: CustomEvent) => void;
          onSelect?: (event: CustomEvent<(string | number)[]>) => void;
          onSelectNode?: (event: CustomEvent) => void;
        };

      "eo-tree-select": DetailedHTMLProps<
        HTMLAttributes<TreeSelectBrick>,
        TreeSelectBrick
      > &
        TreeSelectProps & {
          onChange?: (event: CustomEvent<{ value: any }>) => void;
          onSearch?: (event: CustomEvent<string>) => void;
          onSelect?: (event: CustomEvent<{ value: any }>) => void;
          onExpand?: (event: CustomEvent<{ keys: React.Key[] }>) => void;
        };

      "eo-cascader": DetailedHTMLProps<
        HTMLAttributes<CascaderBrick>,
        CascaderBrick
      > &
        CascaderProps & {
          onCascaderChange?: (
            event: CustomEvent<{
              value: (string | number | null)[] | undefined;
              selectedOptions: Record<string, any>[] | Record<string, any>[][];
            }>
          ) => void;
        };

      "eo-next-table": DetailedHTMLProps<
        HTMLAttributes<EoNextTable>,
        EoNextTable
      > &
        Omit<NextTableProps, "columns" | "cell"> & {
          columns?: Array<
            Omit<ColumnProp, "useBrick" | "headerBrick"> & {
              align?: string;
              dataIndex?: number | string;
              title?: string;
              width?: number | string;
              colSpan?: number;
              ellipsis?: { showTitle?: boolean } | boolean;
              fixed?: "left" | "right" | boolean;
              rowScope?: "row" | "rowgroup";
              showSorterTooltip?: boolean | object;
              sortDirections?: ("descend" | "ascend" | null)[];
              render?: (data: {
                rowData: Record<string, any>;
                cellData: any;
              }) => React.ReactNode;
              headerBrick?: {
                render?: (data: any) => React.ReactNode;
              };
            }
          >;
          cell?: {
            render?: (data: {
              rowData: Record<string, any>;
              cellData: any;
              columnKey: string | number;
            }) => React.ReactNode;
            header?: {
              render?: (data: {
                title: string;
                columnKey: string | number;
              }) => React.ReactNode;
            };
          };
          onPageChange?: (
            event: CustomEvent<{ page: number; pageSize: number }>
          ) => void;
          onSortChange?: (
            event: CustomEvent<Sort | Sort[] | undefined>
          ) => void;
          onRowSelect?: (
            event: CustomEvent<{
              keys: (string | number)[];
              rows: Record<string, any>[];
              info: { type: string };
            }>
          ) => void;
          onRowSelectV2?: (event: CustomEvent<Record<string, any>[]>) => void;
          onRowExpand?: (
            event: CustomEvent<{
              expanded: boolean;
              record: Record<string, any>;
            }>
          ) => void;
          onExpandedRowsChange?: (
            event: CustomEvent<(string | number)[]>
          ) => void;
          onRowDrag?: (
            event: CustomEvent<{
              list: Record<string, any>[];
              active: Record<string, any>;
              over: Record<string, any>;
            }>
          ) => void;
        };

      "advanced.pdf-viewer": DetailedHTMLProps<
        HTMLAttributes<PdfViewer>,
        PdfViewer
      > &
        PdfViewerProps;
    }
  }
}
