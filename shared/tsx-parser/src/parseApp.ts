import type { ParsedApp, SourceFile } from "./modules/interfaces.js";
import { parseFile } from "./modules/parseFile.js";

export function parseApp(files: SourceFile[]) {
  const app: ParsedApp = {
    appType: "app",
    modules: new Map(),
    files,
    errors: [],
  };

  parseFile("/index.tsx", app);

  return app;
}
