import { collectModuleErrors } from "./modules/collectModuleErrors.js";
import type { ParsedApp, SourceFile } from "./modules/interfaces.js";
import { parseFile } from "./modules/parseFile.js";

export function parseApp(files: SourceFile[]) {
  const app: ParsedApp = {
    appType: "app",
    modules: new Map(),
    files,
    constants: new Map(),
    errors: [],
  };

  parseFile("/index.tsx", app);

  collectModuleErrors(app);

  return app;
}
