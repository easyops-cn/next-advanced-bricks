// istanbul ignore file
import { createProviderClass } from "@next-core/utils/general";
import { parseSourceCode, formatCode } from "../utils/parseSuiteAst.js";
import { getCaseFileHandle, getTestDirHandle } from "./shared/fileAccess.js";
import { NodeItem } from "../interface.js";

export async function exportAsFile(
  suiteData: NodeItem,
  appId: string
): Promise<boolean> {
  let dirHandle;
  let fileHandle;

  try {
    dirHandle = await getTestDirHandle();

    fileHandle = await getCaseFileHandle(dirHandle, {
      caseName: suiteData.name,
      appId,
    });
  } catch (error) {
    if ((error as any).name === "NotAllowedError") {
      const storedDirHandle = await getTestDirHandle();
      await storedDirHandle.requestPermission({ mode: "readwrite" });
      fileHandle = await getCaseFileHandle(dirHandle, {
        caseName: suiteData.name,
        appId,
      });
    } else {
      // eslint-disable-next-line no-console
      console.error(error);
      return false;
    }
  }

  const writable = await fileHandle?.createWritable?.();

  const generatedCode = parseSourceCode(suiteData);

  const prettyCode = await formatCode(generatedCode);

  await writable.write(prettyCode);

  await writable.close();

  return true;
}

customElements.define(
  "ui-test.export-as-file",
  createProviderClass(exportAsFile)
);
