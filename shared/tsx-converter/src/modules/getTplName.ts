let counter = 0;
const tplNameMap = new Map<string, string>();

export function getViewTplName(name: string, rootId: string) {
  return `${getViewTplNamePrefixByRootId(rootId)}${getViewTplNameSuffix(name)}`;
}

export function getAppTplName(name: string) {
  return `tpl${getViewTplNameSuffix(name)}`;
}

function getViewTplNamePrefixByRootId(rootId: string) {
  if (!tplNameMap.has(rootId)) {
    tplNameMap.set(rootId, `isolated-tpl-${counter++}`);
  }
  return tplNameMap.get(rootId)!;
}

function getViewTplNameSuffix(name: string) {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}
