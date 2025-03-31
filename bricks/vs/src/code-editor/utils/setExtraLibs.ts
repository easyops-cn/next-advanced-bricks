import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import type { ExtraLib } from "../interfaces.js";

let previousDisposables: monaco.IDisposable[] | undefined;

export function setExtraLibs(
  libs: ExtraLib[] | undefined,
  options: {
    languageDefaults: "javascriptDefaults" | "typescriptDefaults";
  }
): void {
  for (const disposable of previousDisposables ?? []) {
    disposable.dispose();
  }

  previousDisposables = libs?.map((lib) => {
    const uri = monaco.Uri.file(`libs/${lib.filePath}`);
    const uriString = uri.toString();
    return monaco.languages.typescript[options.languageDefaults].addExtraLib(
      lib.content,
      uriString
    );
  });
}
