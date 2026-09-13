export enum K {
  CREATE_API = "CREATE_API",
  IMPORT_API = "IMPORT_API",
  CREATE_SUB_DIRECTORY = "CREATE_SUB_DIRECTORY",
  RENAME_DIRECTORY = "RENAME_DIRECTORY",
  DELETE_DIRECTORY = "DELETE_DIRECTORY",
}

const en: Locale = {
  CREATE_API: "Create API",
  IMPORT_API: "Import API",
  CREATE_SUB_DIRECTORY: "Create Subdirectory",
  RENAME_DIRECTORY: "Rename Directory",
  DELETE_DIRECTORY: "Delete Directory",
};

const zh: Locale = {
  CREATE_API: "新建接口",
  IMPORT_API: "导入接口",
  CREATE_SUB_DIRECTORY: "新建子目录",
  RENAME_DIRECTORY: "目录重命名",
  DELETE_DIRECTORY: "删除目录",
};

export const NS = "bricks/api-market/apis-directory-tree";

export const locales = { en, zh };

type Locale = { [k in K]: string };
