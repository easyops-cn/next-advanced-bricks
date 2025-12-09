import { isEmpty, get, has, set, unset, cloneDeep } from "lodash";
import { PubSub } from "./PubSub.js";

interface FormStoreOptions {
  onValuesChanged?: (data: any) => void;
}

export interface FieldDetail {
  name: string;
  label?: string;
  notRender?: boolean;
  originProps?: Record<string, any>;
  validate: Validate;
  [k: string]: any;
}

export interface MessageBody {
  message: string;
  type: string;
}

export interface WatchOptions {
  needValidate?: boolean;
}

interface Validate {
  required?: boolean;
  pattern?: string;
  type?: string;
  min?: number;
  max?: number;
  message?: {
    required?: string;
    pattern?: string;
    min?: string;
    max?: string;
  };
  validator?: (value: any) => MessageBody | string;
}

let uid = 0;

class Field {
  field: string;
  detail: FieldDetail;
  constructor(name: string, detail: FieldDetail) {
    this.field = name;
    this.detail = detail;
  }
}

export class FormStore extends PubSub {
  static uid: number;
  static instance: Map<number, FormStore> = new Map();
  static getInstance(options?: FormStoreOptions): FormStore {
    if (!this.instance.get(uid)) {
      this.uid = uid;
      this.instance.set(this.uid, new FormStore(options));
      uid += 1;
    }
    return this.instance.get(this.uid) as FormStore;
  }

  #fields: Map<string, Field> = new Map();
  #options: FormStoreOptions | undefined;
  #formData!: Record<string, unknown>;
  #initData: Record<string, unknown> | undefined;

  constructor(options?: FormStoreOptions) {
    super();
    this.#formData = {};
    this.#options = options;
  }

  setField(name: string, detail: FieldDetail) {
    this.#fields.set(name, new Field(name, detail));
    this.setFieldsValueByInitData(name);
  }
  #getAllFields() {
    return [...this.#fields.keys()].filter((key) => {
      return !this.#fields.get(key)!.detail?.notRender;
    });
  }

  getAllValues() {
    const allFields = this.#getAllFields();
    const formData: Record<string, unknown> = {};

    allFields.forEach((fieldName) => {
      const value = get(this.#formData, fieldName);
      set(formData, fieldName, value);
    });

    return formData;
  }

  setInitValue(values: Record<string, unknown>, isEmitValuseChange = true) {
    this.#initData = values;
    this.setFieldsValue(values, isEmitValuseChange);
  }

  setFieldsValueByInitData(name: string) {
    const field = this.#fields.get(name);
    if (field && !field.detail?.notRender && has(this.#initData, name)) {
      const value = get(this.#initData, name);
      set(this.#formData, name, value);
      this.publish(`${name}.init.value`, value);
    }
  }

  setFieldsValue(values: Record<string, unknown>, isEmitValuseChange = true) {
    const newFormData = cloneDeep(this.#formData);
    const changedValues: Record<string, unknown> = {};

    this.#fields.forEach((field, key) => {
      if (!field.detail?.notRender && has(values, key)) {
        const v = get(values, key);
        set(newFormData, key, v);
        if (this.#initData) {
          set(this.#initData, key, v);
        }
        this.publish(`${key}.init.value`, v);
        set(changedValues, key, v);
      }
    });

    this.#formData = newFormData;

    if (isEmitValuseChange) {
      this.#options?.onValuesChanged?.({
        changedValues,
        allValues: this.getAllValues(),
      });
    }
  }

  resetFields(name?: string) {
    if (name) {
      unset(this.#formData, name);
      this.publish(`${name}.reset.fields`, null);
    } else {
      this.#formData = {};
      this.publish("reset.fields", null);
    }
    this.resetValidateState();
  }

  getFieldsValue(name?: string) {
    if (name) {
      const field = this.#fields.get(name);
      if (field && !field.detail?.notRender) {
        return get(this.#formData, name);
      }
      return undefined;
    }
    return this.getAllValues();
  }

  removeField(name: string) {
    unset(this.#formData, name);
    this.#fields.delete(name);
  }

  validateFields(
    callback: (err: boolean, value: any) => void
  ): boolean | Record<string, unknown> {
    const allFields = this.#getAllFields();
    const results: Array<MessageBody | undefined> = [];
    allFields.forEach((name) => {
      const field = this.#fields.get(name);
      if (field) {
        results.push(this.validateField(field.detail));
      }
    });

    if (results.some((result) => result?.type !== "normal")) {
      callback(
        true,
        results.filter((result) => result?.type !== "normal")
      );
      return false;
    } else {
      const formData = this.getAllValues();
      callback(false, formData);
      return formData;
    }
  }

  validateField(field: string | FieldDetail) {
    let fieldDetail;
    let fieldObj;

    if (typeof field === "string") {
      fieldObj = this.#fields.get(field);
      fieldDetail = fieldObj?.detail;
    } else {
      fieldDetail = field;
      fieldObj = this.#fields.get(fieldDetail.name);
    }

    if (!fieldDetail || (fieldObj && fieldObj.detail?.notRender)) return;

    const { name, label, validate } = fieldDetail;
    const validateValue = get(this.#formData, name);

    const messageBody = (message: string, type = "error") => {
      return {
        type,
        message,
      };
    };

    const getName = () => label ?? name;

    const valid = (validate: Validate, value: unknown): MessageBody => {
      const { required, pattern, message, type, min, max, validator } =
        validate;
      const label = getName();

      if (
        typeof value === "object"
          ? isEmpty(value)
          : value === undefined || value === ""
      ) {
        if (required) {
          return messageBody(message?.required || `${label}为必填项`);
        }
        return messageBody("", "normal");
      }

      if (typeof value === "string" && pattern) {
        const reg = new RegExp(pattern);
        if (!reg.test(value)) {
          return messageBody(
            message?.pattern || `${label}没有匹配正则 ${pattern}`
          );
        }
      }

      const checkMin = typeof min === "number";
      const checkMax = typeof max === "number";

      if (type === "number") {
        if (typeof value === "number" || typeof value === "string") {
          const numberValue =
            typeof value === "number" ? value : parseFloat(value);
          if (isNaN(numberValue)) {
            return messageBody(`${label}必须是数字`);
          }
          if (checkMin && numberValue < min) {
            return messageBody(message?.min || `${label}不能小于 ${min}`);
          }
          if (checkMax && numberValue > max) {
            return messageBody(message?.max || `${label}不能大于 ${max}`);
          }
        }
      } else if (typeof value === "string") {
        if (checkMin && value.length < min) {
          return messageBody(message?.min || `${label}至少包含 ${min} 个字符`);
        }
        if (checkMax && value.length > max) {
          return messageBody(message?.max || `${label}不能超过 ${max} 个字符`);
        }
      }

      if (validator) {
        let result = "";
        let parsedValidator = [];
        if (Array.isArray(validator)) {
          parsedValidator = validator;
        } else {
          parsedValidator.push(validator);
        }

        for (const v of parsedValidator) {
          result = v(value);

          if (result) {
            break;
          }
        }
        return typeof result === "string"
          ? messageBody(result, result ? "error" : "normal")
          : (result as MessageBody);
      }

      return messageBody("", "normal");
    };

    const result = { name, ...valid(validate, validateValue) };
    this.publish(`${name}.validate`, result);
    return result;
  }

  getValueFromEvent(e: React.ChangeEvent): any {
    if (!e || !e.target) {
      return e;
    }
    const target = e.target as HTMLInputElement;
    return target.type === "checkbox" ? target.checked : target.value;
  }

  resetValidateState() {
    this.publish(`reset.validate`, null);
  }

  scrollToField(name: string) {
    this.publish(`${name}.scroll.to`, null);
  }

  onWatch(
    name: string,
    event: any,
    callback?: (v: string) => void,
    options?: WatchOptions
  ) {
    const field = this.#fields.get(name);

    if (field) {
      const value = this.getValueFromEvent(event);
      // default first params is value
      const realValue = Array.isArray(value) ? value[0] : value;

      this.setFieldsValue({
        [name]: realValue,
      });

      if (options?.needValidate ?? true) {
        this.validateField(field.detail);
      }
      callback?.apply(this, value);
    }
  }

  onChange(
    name: string,
    value: any,
    callback?: (v: string) => void,
    options?: WatchOptions
  ) {
    const field = this.#fields.get(name);

    if (field) {
      this.setFieldsValue({
        [name]: value,
      });

      if (options?.needValidate ?? true) {
        this.validateField(field.detail);
      }
      callback?.(value);
    }
  }
}
