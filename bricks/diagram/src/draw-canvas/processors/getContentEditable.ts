// istanbul ignore file: compatibility workaround
import type { HTMLAttributes } from "react";

let _supports: boolean | undefined;

function supportsContentEditablePlaintextOnly(): boolean {
  if (typeof _supports !== "boolean") {
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "PLAINTEXT-ONLY");
    _supports = div.contentEditable === "plaintext-only";
  }
  return _supports;
}

export function getContentEditable(
  editable: boolean
): HTMLAttributes<HTMLDivElement>["contentEditable"] {
  return editable
    ? supportsContentEditablePlaintextOnly()
      ? "plaintext-only"
      : "true"
    : "false";
}
