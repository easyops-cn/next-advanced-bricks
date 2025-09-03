import { get, set } from "idb-keyval";
import { dirHandleStorageKey } from "../../constants.js";

let dirHandle: any;
let fileHandle: any;
export async function getTestDirHandle() {
  dirHandle = await get(dirHandleStorageKey);

  if (!dirHandle) {
    dirHandle = await window.showDirectoryPicker?.({ mode: "readwrite" });

    await set(dirHandleStorageKey, dirHandle);
  }

  return dirHandle;
}

/**
 * 递归获取目录句柄，根据给定的路径创建或获取目录
 * @param dirHandle 根目录句柄
 * @param path 目录路径，如 "cypress/e2e/appId"
 * @returns 目标目录句柄
 */
export async function getDirHandleByPath(
  dirHandle: any,
  path: string
): Promise<any> {
  // 将路径按 "/" 分割成数组
  const pathParts = path.split("/").filter((part) => part.trim() !== "");

  // 如果路径为空，返回当前目录句柄
  if (pathParts.length === 0) {
    return dirHandle;
  }

  // 获取第一个路径部分
  const [currentDir, ...remainingPath] = pathParts;

  // 获取或创建当前目录
  const currentDirHandle = await dirHandle.getDirectoryHandle(currentDir, {
    create: true,
  });

  if (remainingPath.length > 0) {
    return getDirHandleByPath(currentDirHandle, remainingPath.join("/"));
  }

  return currentDirHandle;
}

export async function getAppDirHandle(
  dirHandle: any,
  { appId }: { appId: string }
): Promise<any> {
  return getDirHandleByPath(dirHandle, `cypress/e2e/${appId}`);
}

export async function getCaseFileHandle(
  dirHandle: any,
  {
    caseName,
    appId,
  }: {
    caseName: string;
    appId: string;
  }
) {
  const name = `${caseName}.spec.js`;
  const fileHandleKey = `${dirHandle.name}-${appId}-${name}`;
  fileHandle = await get(fileHandleKey);

  if (!fileHandle) {
    const appIdDirectory = await getAppDirHandle(dirHandle, { appId });

    fileHandle = await appIdDirectory?.getFileHandle?.(name, {
      create: true,
    });

    await set(fileHandleKey, fileHandle);
  }

  return fileHandle;
}
