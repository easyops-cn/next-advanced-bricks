import { i18n, initializeI18n } from "@next-core/i18n";

export enum K {
  UPLOAD_FILES = "UPLOAD_FILES",
  UPLOADING = "UPLOADING",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  DROP_FILES_HERE = "DROP_FILES_HERE",
  SUPPORTED_FILE_TYPES = "SUPPORTED_FILE_TYPES",
  UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE",
  MAX_SIZE_EXCEEDED = "MAX_SIZE_EXCEEDED",
  MAX_SIZE_EXCEEDED_UNKNOWN = "MAX_SIZE_EXCEEDED_UNKNOWN",
  MAX_FILES_EXCEEDED = "MAX_FILES_EXCEEDED",
}

const en: Locale = {
  UPLOAD_FILES: "Upload files",
  UPLOADING: "Uploading...",
  UPLOAD_FAILED: "Upload failed",
  DROP_FILES_HERE: "Drop files here",
  SUPPORTED_FILE_TYPES: "Supported file types: {{types}}.",
  UNSUPPORTED_FILE_TYPE: "Some files have unsupported file types.",
  MAX_SIZE_EXCEEDED: "Maximum single file size: {{size}}.",
  MAX_SIZE_EXCEEDED_UNKNOWN: "Some files exceed the maximum allowed size.",
  MAX_FILES_EXCEEDED: "Maximum number of files ({{count}}) exceeded.",
};

const zh: Locale = {
  UPLOAD_FILES: "上传文件",
  UPLOADING: "上传中...",
  UPLOAD_FAILED: "上传失败",
  DROP_FILES_HERE: "在此处拖放文件",
  SUPPORTED_FILE_TYPES: "仅支持以下文件类型：{{types}}。",
  UNSUPPORTED_FILE_TYPE: "部分文件类型不受支持。",
  MAX_SIZE_EXCEEDED: "单个文件不能超过 {{size}}。",
  MAX_SIZE_EXCEEDED_UNKNOWN: "部分文件超过允许的最大大小。",
  MAX_FILES_EXCEEDED: "超过允许的最大文件数量 ({{count}})。",
};

export const NS = "bricks/ai-portal/FileUpload";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};

initializeI18n(NS, locales);
