import { i18n } from "@next-core/i18n";

export enum K {
  UNTITLED = "UNTITLED",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX = "FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX = "FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX",
  DOWNLOAD = "DOWNLOAD",
}

const en: Locale = {
  UNTITLED: "Untitled",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX:
    "This file is unpreviewable currently, you can",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX: "and view it locally.",
  DOWNLOAD: "Download",
};

const zh: Locale = {
  UNTITLED: "未命名",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX: "该类型文件暂不支持预览，您可以",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX: "查看。",
  DOWNLOAD: "下载",
};

export const NS = "bricks/ai-portal/FilePreview";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
