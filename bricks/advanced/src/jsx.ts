import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { DefaultOptionType } from "antd/es/cascader";
import type { RowSelectMethod } from "antd/es/table/interface";
import type { EoTree, EoTreeProps } from "./tree";
import type { TreeSelectBrick, TreeSelectProps } from "./tree-select";
import type { CascaderBrick, CascaderProps } from "./cascader";
import type { PdfViewer, PdfViewerProps } from "./pdf-viewer";
import type { EoTextTooltip, EoTextTooltipProps } from "./text-tooltip";
import type { EoNextTable, NextTableProps } from "./next-table";
import type { RecordType, Sort } from "./next-table/interface";

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
              selectedOptions: DefaultOptionType[] | DefaultOptionType[][];
            }>
          ) => void;
        };

      "eo-next-table": DetailedHTMLProps<
        HTMLAttributes<EoNextTable>,
        EoNextTable
      > &
        NextTableProps & {
          onPageChange?: (
            event: CustomEvent<{ page: number; pageSize: number }>
          ) => void;
          onSortChange?: (
            event: CustomEvent<Sort | Sort[] | undefined>
          ) => void;
          onRowSelect?: (
            event: CustomEvent<{
              keys: (string | number)[];
              rows: RecordType[];
              info: { type: RowSelectMethod };
            }>
          ) => void;
          onRowSelectV2?: (event: CustomEvent<RecordType[]>) => void;
          onRowExpand?: (
            event: CustomEvent<{
              expanded: boolean;
              record: RecordType;
            }>
          ) => void;
          onExpandedRowsChange?: (
            event: CustomEvent<(string | number)[]>
          ) => void;
          onRowDrag?: (
            event: CustomEvent<{
              list: RecordType[];
              active: RecordType;
              over: RecordType;
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
