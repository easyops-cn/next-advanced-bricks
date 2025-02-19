import { createProviderClass } from "@next-core/utils/general";
import { RequestCustomOptions, http } from "@next-core/http";
import { isObject } from "lodash";

/**
 * 用于 form-builder 第三方转发请求
 */

interface CustomRequestInit extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown> | BodyInit;
}

export type FormRendererCustomRequests = RequestCustomOptions & {
  requestType: "json" | "form-data";
};

export function transformFormData(
  data: Record<string, unknown> | FormData
): FormData {
  if (data instanceof FormData) {
    return data;
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        formData.append(key, v as string);
      });
    } else if (
      isObject(value) &&
      !(value instanceof Blob) &&
      !(value instanceof Date)
    ) {
      Object.entries(value).forEach(([k, v]) => {
        formData.append(`${key}[${k}]`, v as string);
      });
    } else {
      formData.append(key, value as string);
    }
  }

  return formData;
}

export async function customRequest(
  url: string,
  init?: CustomRequestInit,
  options?: FormRendererCustomRequests
): Promise<unknown> {
  const prefix = "api/gateway/logic.gateway_service";

  const finalUrl = /^https?:/.test(url) ? url : `${prefix}${url}`;
  if (options?.requestType === "form-data" && init?.body) {
    init.body = transformFormData(init.body as Record<string, unknown>);
  }

  return http.request(finalUrl, init as RequestInit, options);
}

customElements.define(
  "form-renderer.custom-request",
  createProviderClass(customRequest)
);
