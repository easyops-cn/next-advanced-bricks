import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { AutoComplete, AutoCompleteProps } from "./auto-complete";
import type { Checkbox, CheckboxProps, CheckboxOptionType } from "./checkbox";
import type { EoColorPicker, EoColorPickerProps } from "./color-picker";
import type { Form, FormProps } from "./form";
import type { IconSelect, IconSelectProps } from "./icon-select";
import type { Input, InputProps } from "./input/index.js";
import type { GeneralComplexOption, Radio, RadioProps } from "./radio";
import type { GeneralSearch, SearchProps } from "./search";
import type { Select, SelectProps } from "./select";
import type { Textarea, TextareaProps } from "./textarea";
import type {
  EoTimeRangePicker,
  EoTimeRangePickerProps,
  TimeRange,
} from "./time-range-picker";
import type { UploadImage, UploadImageProps } from "./upload/upload-image";
import type { ImageData } from "./upload/upload-image/utils.js";
import type { EoUploadFile, UploadFileProps } from "./upload/upload-file";
import type { FileData } from "./upload/utils.js";
import type { EoDatePicker } from "./date-picker";
import type { DynamicFormItem } from "./dynamic-form-item";
import type { SubmitButtons, SubmitButtonsProps } from "./submit-buttons";
import type { GeneralSwitch } from "./general-switch";
import type { EoTimePicker } from "./time-picker";
import type { MessageBody } from "@next-shared/form";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "eo-auto-complete": DetailedHTMLProps<
        HTMLAttributes<AutoComplete>,
        AutoComplete
      > &
        AutoCompleteProps & {
          onChange?: (event: CustomEvent<string>) => void;
        };

      "eo-checkbox": DetailedHTMLProps<HTMLAttributes<Checkbox>, Checkbox> &
        CheckboxProps & {
          onChange?: (event: CustomEvent<CheckboxOptionType[]>) => void;
        };

      "eo-color-picker": DetailedHTMLProps<
        HTMLAttributes<EoColorPicker>,
        EoColorPicker
      > &
        EoColorPickerProps & {
          onChange?: (event: CustomEvent<string | undefined>) => void;
        };

      "eo-date-picker": DetailedHTMLProps<
        HTMLAttributes<EoDatePicker>,
        EoDatePicker
      > & {
        onChange?: (event: CustomEvent<string>) => void;
        onOk?: (event: CustomEvent<string>) => void;
      };

      "eo-dynamic-form-item": DetailedHTMLProps<
        HTMLAttributes<DynamicFormItem>,
        DynamicFormItem
      > & {
        onChange?: (event: CustomEvent<Record<string, unknown>[]>) => void;
        onRowAdd?: (
          event: CustomEvent<{ detail: Record<string, unknown>; index: number }>
        ) => void;
        onRowRemove?: (
          event: CustomEvent<{ detail: Record<string, unknown>; index: number }>
        ) => void;
      };

      "eo-form": DetailedHTMLProps<HTMLAttributes<Form>, Form> &
        FormProps & {
          onValuesChange?: (
            event: CustomEvent<Record<string, unknown>>
          ) => void;
          onValidateSuccess?: (
            event: CustomEvent<Record<string, unknown>>
          ) => void;
          onValidateError?: (
            event: CustomEvent<(MessageBody & { name: string })[]>
          ) => void;
        };

      "eo-icon-select": DetailedHTMLProps<
        HTMLAttributes<IconSelect>,
        IconSelect
      > &
        IconSelectProps & {
          onChange?: (
            event: CustomEvent<
              | {
                  lib: string;
                  icon: string;
                  theme: string;
                  category?: string;
                  color?: string;
                }
              | undefined
            >
          ) => void;
        };

      "eo-input": DetailedHTMLProps<HTMLAttributes<Input>, Input> &
        InputProps & {
          onChange?: (event: CustomEvent<string>) => void;
        };

      "eo-radio": DetailedHTMLProps<HTMLAttributes<Radio>, Radio> &
        RadioProps & {
          onChange?: (
            event: CustomEvent<GeneralComplexOption | undefined>
          ) => void;
          onOptionsChange?: (
            event: CustomEvent<{
              options: {
                label: string;
                value: unknown;
                [key: string]: unknown;
              };
              name: string;
            }>
          ) => void;
        };

      "eo-search": DetailedHTMLProps<
        HTMLAttributes<GeneralSearch>,
        GeneralSearch
      > &
        SearchProps & {
          onChange?: (event: CustomEvent<string>) => void;
          onSearch?: (event: CustomEvent<string>) => void;
        };

      "eo-select": DetailedHTMLProps<HTMLAttributes<Select>, Select> &
        SelectProps & {
          onChange?: (
            event: CustomEvent<{
              value: string | string[];
              options: GeneralComplexOption[];
            }>
          ) => void;
          onChangeV2?: (event: CustomEvent<string | string[]>) => void;
          onSearch?: (event: CustomEvent<{ value: string }>) => void;
          onSelectFocus?: (event: CustomEvent<void>) => void;
          onOptionsChange?: (
            event: CustomEvent<{
              options: {
                label: string;
                value: unknown;
                [key: string]: unknown;
              };
              name: string;
            }>
          ) => void;
        };

      "eo-submit-buttons": DetailedHTMLProps<
        HTMLAttributes<SubmitButtons>,
        SubmitButtons
      > &
        SubmitButtonsProps & {
          onSubmit?: (event: CustomEvent<void>) => void;
          onCancel?: (event: CustomEvent<void>) => void;
        };

      "eo-switch": DetailedHTMLProps<
        HTMLAttributes<GeneralSwitch>,
        GeneralSwitch
      > & {
        onSwitch?: (event: CustomEvent<boolean>) => void;
      };

      "eo-textarea": DetailedHTMLProps<HTMLAttributes<Textarea>, Textarea> &
        TextareaProps & {
          onChange?: (event: CustomEvent<string>) => void;
        };

      "eo-time-picker": DetailedHTMLProps<
        HTMLAttributes<EoTimePicker>,
        EoTimePicker
      > & {
        onChange?: (event: CustomEvent<string>) => void;
        onOpen?: (event: CustomEvent<string>) => void;
        onClose?: (event: CustomEvent<string>) => void;
      };

      "eo-time-range-picker": DetailedHTMLProps<
        HTMLAttributes<EoTimeRangePicker>,
        EoTimeRangePicker
      > &
        EoTimeRangePickerProps & {
          onChange?: (event: CustomEvent<TimeRange>) => void;
        };

      "eo-upload-file": DetailedHTMLProps<
        HTMLAttributes<EoUploadFile>,
        EoUploadFile
      > &
        UploadFileProps & {
          onChange?: (event: CustomEvent<FileData[]>) => void;
        };

      "eo-upload-image": DetailedHTMLProps<
        HTMLAttributes<UploadImage>,
        UploadImage
      > &
        UploadImageProps & {
          onChange?: (event: CustomEvent<ImageData[]>) => void;
        };
    }
  }
}
