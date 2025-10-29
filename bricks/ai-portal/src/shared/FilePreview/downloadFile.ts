import { saveAs } from "file-saver";
import type { FileInfo } from "../interfaces";
import { K, t } from "./i18n";
import { getImageUrl } from "./getImageUrl";

export function downloadFile(file: FileInfo): void {
  const { bytes, uri, mimeType, name } = file;
  const filename = name || t(K.UNTITLED);
  if (bytes) {
    saveAs(new Blob([atob(bytes)], { type: mimeType }), filename);
  } else if (uri) {
    const link = document.createElement("a");
    link.href = getImageUrl(uri);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
