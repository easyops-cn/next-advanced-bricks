import { pipes } from "@easyops-cn/brick-next-pipes";
import fileText from "../images/file-text@2x.png";
import filePdf from "../images/file-pdf@2x.png";
import fileDoc from "../images/file-doc@2x.png";
import filePpt from "../images/file-ppt@2x.png";
import fileXls from "../images/file-xls@2x.png";
import fileOther from "../images/file-other@2x.png";

const MIME_TYPES = new Map<string, string>([
  ["md", "text/markdown"],
  ["pdf", "application/pdf"],
  ["doc", "application/msword"],
  [
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ["txt", "text/plain"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["ppt", "application/vnd.ms-powerpoint"],
  [
    "pptx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
]);

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
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ["Word Document", fileDoc];
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return ["Excel Spreadsheet", fileXls];
    case "application/vnd.ms-powerpoint":
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return ["PowerPoint Presentation", filePpt];
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
  return MIME_TYPES.get(ext) ?? "unknown";
}
