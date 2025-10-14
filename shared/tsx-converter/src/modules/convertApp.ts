import type {
  BrickConfInTemplate,
  CustomTemplate,
  RouteConf,
  StoryboardFunction,
} from "@next-core/types";
import {
  MODULE_SOURCE,
  type ParsedApp,
  type ComponentChild,
  type ComponentReference,
  isOfficialComponent,
} from "@next-shared/tsx-parser";
import convertModule, {
  type ConvertedModule,
  type ConvertedPart,
} from "./convertModule.js";
import type {
  ConvertState,
  ConvertOptions,
  ConvertedApp,
} from "../interfaces.js";
import { getAppTplName } from "./getTplName.js";

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

  let convertedEntry: ConvertedModule;
  const convertedModules = new Map<string, ConvertedModule>();

  const state: ConvertState = {
    usedHelpers: new Set(),
    app,
  };

  const functions: StoryboardFunction[] = [];
  const templates: CustomTemplate[] = [];

  await Promise.all(
    Array.from(app.modules).map(async ([filePath, mod]) => {
      if (mod) {
        const converted = await convertModule(mod, state, options);
        convertedModules.set(filePath, converted);
        if (mod === entry) {
          convertedEntry = converted;
        }
        for (const part of [
          ...converted.internals,
          ...converted.namedExports.values(),
        ]) {
          if (part.type === "function") {
            functions.push(part.function);
          } else if (part.type === "template") {
            templates.push({
              name: getAppTplName(part.name!),
              bricks: part.bricks as BrickConfInTemplate[],
              state: part.context,
            });
          }
        }
      }
    })
  );

  const routes: RouteConf[] =
    routesComponent.children?.map((child) => {
      if (!isOfficialComponent(child, "Route")) {
        throw new Error(
          `All children of <Routes> must be <Route> from "${MODULE_SOURCE}".`
        );
      }
      const { path, component } = child.properties;

      if (typeof path !== "string" || !path.startsWith("/")) {
        throw new Error(
          `The "path" property of <Route> must be a string starting with "/".`
        );
      }

      if (!component) {
        throw new Error(`The "component" property of <Route> is required.`);
      }

      const { reference } = component as ComponentChild & {
        reference: ComponentReference;
      };
      let page: ConvertedPart | null | undefined;
      if (reference.type === "local") {
        const parts = [
          ...convertedEntry.internals,
          ...convertedEntry.namedExports.values(),
        ];
        page = parts.find(
          (p) => p.type !== "function" && p.name && p.name === reference.name
        );
      } else {
        const mod = convertedModules.get(reference.importSource!);
        if (!mod) {
          throw new Error(
            `Cannot find the module "${reference.importSource}" imported by the route "${path}".`
          );
        }
        page = reference.name
          ? mod.namedExports.get(reference.name)
          : mod.defaultExport;
      }

      if (!page) {
        throw new Error(
          `Cannot find the component "${reference.name}" used in the route "${path}".`
        );
      }
      if (page.type !== "page") {
        throw new Error(
          `The component "${reference.name}" used in the route "${path}" must be a page component.`
        );
      }

      return {
        path: `\${APP.homepage}${path === "/" ? "" : path}`,
        bricks: page.bricks,
        context: page.context,
      };
    }) ?? [];

  return {
    routes,
    meta: {
      functions,
      templates,
    },
  };
}
