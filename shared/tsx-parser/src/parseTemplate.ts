import { collectModuleErrors } from "./modules/collectModuleErrors.js";
import type { ParsedApp } from "./modules/interfaces.js";
import { parseFile } from "./modules/parseFile.js";

export function parseTemplate(source: string): ParsedApp {
  const app: ParsedApp = {
    appType: "template",
    modules: new Map(),
    files: [
      {
        filePath: "/Template.tsx",
        content: source,
      },
    ],
    constants: new Map(),
    errors: [],
  };

  parseFile("/Template.tsx", app);

  collectModuleErrors(app);

  return app;
}
