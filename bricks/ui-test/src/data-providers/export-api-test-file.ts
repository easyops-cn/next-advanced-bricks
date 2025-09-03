import { createProviderClass } from "@next-core/utils/general";
import { getDirHandleByPath } from "./shared/fileAccess";
import { get } from "idb-keyval";

interface Params {
  projectDirectoryKey: string;
  name: string;
  path: string;
  source: string;
}

export async function exportApiTestFile(params: Params): Promise<void> {
  const { projectDirectoryKey, name, path, source } = params;
  const dirHandle = await get(projectDirectoryKey);

  const targetDirHandle = await getDirHandleByPath(dirHandle, path);

  const fileHandle = await targetDirHandle?.getFileHandle?.(name, {
    create: true,
  });

  const writable = await fileHandle?.createWritable?.();

  await writable.write(source);

  await writable.close();
}

customElements.define(
  "ui-test.export-api-test-file",
  createProviderClass(exportApiTestFile)
);
