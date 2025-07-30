import { pipes } from "@easyops-cn/brick-next-pipes";
import fileText from "../images/file-text@2x.png";
import filePdf from "../images/file-pdf@2x.png";
import fileOther from "../images/file-other@2x.png";

export function formatFileSize(size: number) {
  const [value, unit] = pipes.unitFormat(size, "bytes", 1);
  const number = +value;
  return `${number > 100 ? Math.round(number) : number} ${unit}`;
}

export function getFileTypeAndIcon(
  mimeType: string | undefined,
  filename: string | undefined
): [type: string, icon: string] {
  const type = mimeType || getMimeTypeByFilename(filename);

  switch (type) {
    case "text/markdown":
      return ["Markdown", fileText];
    case "application/pdf":
      return ["PDF", filePdf];
  }

  if (type.startsWith("text/")) {
    return ["Text", fileText];
  }

  return ["File", fileOther];
}

export function getMimeTypeByFilename(filename: string | undefined): string {
  let ext = "";
  const matches = filename?.match(/\.([^.]+)$/);
  if (matches) {
    ext = matches[1].toLowerCase();
  }
  switch (ext) {
    case "md":
      return "text/markdown";
    case "pdf":
      return "application/pdf";
    default:
      return "unknown";
  }
}
