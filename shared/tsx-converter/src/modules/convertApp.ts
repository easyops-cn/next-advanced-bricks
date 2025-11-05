import type {
  BrickConfInTemplate,
  CustomTemplate,
  StoryboardFunction,
} from "@next-core/types";
import {
  MODULE_SOURCE,
  type ParsedApp,
  isOfficialComponent,
} from "@next-shared/tsx-parser";
import convertModule, {
  type ConvertedPartOfComponent,
} from "./convertModule.js";
import type {
  ConvertState,
  ConvertOptions,
  ConvertedApp,
} from "../interfaces.js";
import { getAppTplName } from "./getTplName.js";
import { convertRoutes } from "./convertRoutes.js";
import { getHelperFunctions } from "../helpers/index.js";

export async function convertApp(
  app: ParsedApp,
  options: ConvertOptions
): Promise<ConvertedApp> {
  const { entry } = app;
  if (!entry) {
    throw new Error("No entry module found in the app.");
  }

  const render = entry.render;
  if (!render) {
    throw new Error("No render call found in the entry module.");
  }

  const { children } = render;

  if (children.length !== 1) {
    throw new Error(
      `Expects exactly one root component in the render call, but got ${children.length}.`
    );
  }

  const routesComponent = children[0];
  if (!isOfficialComponent(routesComponent, "Routes")) {
    throw new Error(
      `The root component must be <Routes> from "${MODULE_SOURCE}".`
    );
  }

  const state: ConvertState = {
    usedHelpers: new Set(),
    app,
    convertedModules: new Map(),
  };

  const convertingEntry = convertModule(entry, state, options);
  state.convertedModules.set(entry.filePath, convertingEntry);

  const routes = await convertRoutes(
    routesComponent.children,
    state,
    entry,
    options
  );

  const functions: StoryboardFunction[] = [];
  const templates: CustomTemplate[] = [];

  for (const mod of state.convertedModules.values()) {
    if (mod) {
      for (const part of [
        ...mod.internals,
        ...mod.namedExports.values(),
        mod.defaultExport,
      ]) {
        if (!part) {
          continue;
        }
        const { raw, promise } = part;
        switch (raw?.type) {
          case "function":
            functions.push(raw.function);
            break;
          case "template": {
            const part = (await promise) as ConvertedPartOfComponent;
            templates.push({
              name: getAppTplName(part.name!),
              bricks: part.bricks as BrickConfInTemplate[],
              state: part.context,
            });
            break;
          }
        }
      }
    }
  }

  const helpers = Array.from(state.usedHelpers).map<StoryboardFunction>(
    (name) => {
      const source = getHelperFunctions().get(name);
      if (!source) {
        throw new Error(`Helper function ${name} not found`);
      }
      return {
        name,
        source,
        typescript: true,
      };
    }
  );

  return {
    routes,
    meta: {
      functions: [...functions, ...helpers],
      customTemplates: templates,
    },
  };
}
