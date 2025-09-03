// istanbul ignore file
import { createProviderClass } from "@next-core/utils/general";
import { get, set } from "idb-keyval";
import { dirHandleStorageKey } from "../constants.js";

interface Params {
  action: "get" | "set";
  key?: string;
}

export async function chooseDirectory(params: Params): Promise<unknown> {
  const key = params?.key || dirHandleStorageKey;
  if (params?.action === "get") {
    return get(key);
  }

  const directoryHandle = await window.showDirectoryPicker?.({
    mode: "readwrite",
  });

  set(key, directoryHandle);

  return directoryHandle;
}

customElements.define(
  "ui-test.choose-directory",
  createProviderClass(chooseDirectory)
);
