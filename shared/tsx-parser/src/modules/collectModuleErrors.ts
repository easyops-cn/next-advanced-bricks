import type { ParsedApp } from "./interfaces.js";

export function collectModuleErrors(app: ParsedApp): void {
  for (const mod of app.modules.values()) {
    if (mod) {
      for (const err of mod.errors) {
        app.errors.push({
          ...err,
          filePath: mod.filePath,
        });
      }
    }
  }
}
