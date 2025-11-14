import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { AutoComplete, AutoCompleteProps } from "./auto-complete";
import type { Checkbox, CheckboxProps } from "./checkbox";
import type { EoColorPicker, EoColorPickerProps } from "./color-picker";
import type { Form, FormProps } from "./form";
import type { IconSelect, IconSelectProps } from "./icon-select";
import type { Input, InputProps } from "./input/index.jsx";
import type { GeneralComplexOption, Radio, RadioProps } from "./radio";
import type { GeneralSearch, SearchProps } from "./search";
import type { Select, SelectProps } from "./select";
import type { Textarea, TextareaProps } from "./textarea";
import type {
  EoTimeRangePicker,
  EoTimeRangePickerProps,
} from "./time-range-picker";
import type { UploadImage, UploadImageProps } from "./upload/upload-image";
import type { EoUploadFile, UploadFileProps } from "./upload/upload-file";
import type { EoDatePicker } from "./date-picker";
import type { DynamicFormItem } from "./dynamic-form-item";
import type { SubmitButtons } from "./submit-buttons";
import type { GeneralSwitch } from "./general-switch";
import type { EoTimePicker } from "./time-picker";

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
        CheckboxProps;

      "eo-color-picker": DetailedHTMLProps<
        HTMLAttributes<EoColorPicker>,
        EoColorPicker
      > &
        EoColorPickerProps;

      "eo-date-picker": DetailedHTMLProps<
        HTMLAttributes<EoDatePicker>,
        EoDatePicker
      >;

      "eo-dynamic-form-item": DetailedHTMLProps<
        HTMLAttributes<DynamicFormItem>,
        DynamicFormItem
      >;

      "eo-form": DetailedHTMLProps<HTMLAttributes<Form>, Form> & FormProps;

      "eo-icon-select": DetailedHTMLProps<
        HTMLAttributes<IconSelect>,
        IconSelect
      > &
        IconSelectProps;

      "eo-input": DetailedHTMLProps<HTMLAttributes<Input>, Input> &
        InputProps & {
          onChange?: (event: CustomEvent<string>) => void;
        };

      "eo-radio": DetailedHTMLProps<HTMLAttributes<Radio>, Radio> &
        RadioProps & {
          onChange?: (
            event: CustomEvent<GeneralComplexOption | undefined>
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
        };

      "eo-submit-buttons": DetailedHTMLProps<
        HTMLAttributes<SubmitButtons>,
        SubmitButtons
      > & {
        onSubmit?: (event: CustomEvent<void>) => void;
        onCancel?: (event: CustomEvent<void>) => void;
      };

      "eo-switch": DetailedHTMLProps<
        HTMLAttributes<GeneralSwitch>,
        GeneralSwitch
      >;

      "eo-textarea": DetailedHTMLProps<HTMLAttributes<Textarea>, Textarea> &
        TextareaProps;

      "eo-time-picker": DetailedHTMLProps<
        HTMLAttributes<EoTimePicker>,
        EoTimePicker
      > & {
        onChange?: (event: CustomEvent<string>) => void;
        onOpen?: (event: CustomEvent<string>) => void;
      };

      "eo-time-range-picker": DetailedHTMLProps<
        HTMLAttributes<EoTimeRangePicker>,
        EoTimeRangePicker
      > &
        EoTimeRangePickerProps;

      "eo-upload-file": DetailedHTMLProps<
        HTMLAttributes<EoUploadFile>,
        EoUploadFile
      > &
        UploadFileProps;

      "eo-upload-image": DetailedHTMLProps<
        HTMLAttributes<UploadImage>,
        UploadImage
      > &
        UploadImageProps;
    }
  }
}
