import { i18n, initializeI18n } from "@next-core/i18n";

export enum K {
  UPLOAD_FILES = "UPLOAD_FILES",
  UPLOADING = "UPLOADING",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  DROP_FILES_HERE = "DROP_FILES_HERE",
}

const en: Locale = {
  UPLOAD_FILES: "Upload files",
  UPLOADING: "Uploading...",
  UPLOAD_FAILED: "Upload failed",
  DROP_FILES_HERE: "Drop files here",
};

const zh: Locale = {
  UPLOAD_FILES: "上传文件",
  UPLOADING: "上传中...",
  UPLOAD_FAILED: "上传失败",
  DROP_FILES_HERE: "在此处拖放文件",
};

export const NS = "bricks/ai-portal/FileUpload";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};

initializeI18n(NS, locales);
