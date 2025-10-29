import { saveAs } from "file-saver";
import type { FileInfo } from "../interfaces";
import { K, t } from "./i18n";
import { getImageUrl } from "./getImageUrl";

export function downloadFile(file: FileInfo): void {
  const { bytes, uri, mimeType, name } = file;
  const filename = name || t(K.UNTITLED);
  if (bytes) {
    saveAs(
      new Blob([Uint8Array.from(atob(bytes), (c) => c.charCodeAt(0))], {
        type: mimeType,
      }),
      filename
    );
  } else if (uri) {
    const link = document.createElement("a");
    link.href = getImageUrl(uri);
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
