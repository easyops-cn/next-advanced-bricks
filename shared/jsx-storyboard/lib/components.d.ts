/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface ViewProps {
  title: string;
}

export interface BaseProps {
  componentId?: string;
  key?: string | number;
}

export interface TableProps<T extends object> extends BaseProps {
  dataSource: {
    list: T[];
    page?: number;
    pageSize?: number;
    total?: number;
  };
  columns: TableColumn<T>[];
  rowKey: string;
  rowSelection?: boolean;
  sort?: TableSort | null;
  pagination?: boolean;
  onSelect?: (event: CustomEvent<T[]>) => void;
  onPaginate?: (event: CustomEvent<{ page: number; pageSize: number }>) => void;
  onSort?: (event: CustomEvent<TableSort | null>) => void;
}

export interface ListProps extends BaseProps {
  dataSource: object[];
  fields?: {
    title?: string;
    icon?: string;
    url?: string;
  };
  variant?: "default" | "navigation" | "ranking";
}

export interface DescriptionsProps<T extends object> extends BaseProps {
  title?: string;
  dataSource?: T;
  list: Array<
    | {
        label: string;
        text: string;
      }
    | {
        label: string;
        /** 数据字段，多级字段使用点号分隔 */
        field: string;
      }
    | {
        label: string;
        render: (record: T) => any;
      }
  >;
}

export interface ButtonProps extends BaseProps {
  type?: "default" | "primary";
  icon?: IconProps;
  onClick?: (e: Event) => void;
}

export interface SearchProps extends BaseProps {
  placeholder?: string;
  onSearch?: (e: CustomEvent<string>) => void;
}

export interface FormProps<T extends object> extends BaseProps {
  values?: T;
  onValidateSuccess?: (e: CustomEvent<T>) => void;
}

export interface InputProps extends FormItemProps {
  placeholder?: string;
}

export interface NumberInputProps extends InputProps {
  min?: number;
  max?: number;
}

export interface TextareaProps extends InputProps {}

export interface SelectProps extends InputProps {
  options: FormItemOptions[];
  onChange?: (e: CustomEvent<string | number | boolean | null>) => void;
}

export interface RadioProps extends SelectProps {}

export interface CheckboxProps extends SelectProps {}

export interface SwitchProps extends FormItemProps {}

export interface DatePickerProps extends FormItemProps {}

export interface TimePickerProps extends FormItemProps {}

export interface DashboardProps extends BaseProps {
  dataSource: Array<object>;
  groupField?: string;
  widgets: Array<DashboardWidget>;
}

export interface ModalProps extends BaseProps {
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

export interface CardProps extends BaseProps {
  title?: string;
}

export interface TagProps extends BaseProps {
  color?: string;
  outline?: boolean;
}

export interface LinkProps extends BaseProps {
  /** 站外链接 */
  href?: string;

  /** 站内链接 */
  url?: string;

  target?: "_blank" | "_self";
}

export interface PlaintextProps extends BaseProps {
  /** Related advisory information */
  title?: string;
}

export interface DashboardWidget {
  widget: "chart";
  type: "line" | "area";
  title?: string;
  metric: {
    id: string;
    unit: string;
  };
  precision?: number;
}

export interface FormItemProps extends BaseProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface FormItemOptions {
  label: string;
  value: string;
}

export interface IconProps {
  lib: "fa";
  prefix: "fas" | "far";
  icon: string;
}

export interface TableColumn<T extends object> {
  key: string;
  /** 数据索引，多级索引使用数组 */
  dataIndex: string | string[];
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => any;
}

export interface TableSort {
  columnKey: string | number;
  order: "ascend" | "descend";
}

declare const View: (props: ViewProps) => any;
declare const Table: <T extends object>(props: TableProps<T>) => any;
declare const List: (props: ListProps) => any;
declare const Descriptions: <T extends object>(
  props: DescriptionsProps<T>
) => any;
declare const Button: (props: ButtonProps) => any;
declare const Toolbar: (props: BaseProps) => any;
declare const Search: (props: SearchProps) => any;
declare const Form: <T extends object>(props: FormProps<T>) => any;
declare const Input: (props: InputProps) => any;
declare const NumberInput: (props: NumberInputProps) => any;
declare const Textarea: (props: TextareaProps) => any;
declare const Select: (props: SelectProps) => any;
declare const Radio: (props: RadioProps) => any;
declare const Checkbox: (props: CheckboxProps) => any;
declare const Switch: (props: SwitchProps) => any;
declare const DatePicker: (props: DatePickerProps) => any;
declare const TimePicker: (props: TimePickerProps) => any;
declare const Dashboard: (props: DashboardProps) => any;
declare const Modal: (props: ModalProps) => any;
declare const Card: (props: CardProps) => any;
declare const Output: (props: BaseProps) => any;
declare const Tag: (props: TagProps) => any;
declare const Link: (props: LinkProps) => any;
declare const Plaintext: (props: PlaintextProps) => any;
declare const Fragment: (props: { key?: string | number }) => any;
