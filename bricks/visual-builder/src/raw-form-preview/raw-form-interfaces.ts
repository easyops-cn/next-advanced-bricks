export interface FormConfig {
  /** 视觉重量，整型，默认为 0，取值范围 [-1, 1] */
  visualWeight: number;

  /** 使用的表单组件 */
  component:
    | "input"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "switch"
    | "number-input"
    | "date-picker"
    | "time-picker"
    | "file-uploader";

  /** 使用 radio 时，值为 true 时的显示配置 */
  true?: ValueConfig;

  /** 使用 radio 时，值为 false 时的显示配置 */
  false?: ValueConfig;

  /** 使用 select 时，是否启用多选 */
  multiple?: boolean;

  /** 使用 number-input 时，最小值 */
  min?: number;

  /** 使用 number-input 时，最大值 */
  max?: number;

  /** 使用 number-input 时，步进值 */
  // step?: number;
}

export interface ValueConfig {
  /** 显示的文本 */
  text?: string;
}
