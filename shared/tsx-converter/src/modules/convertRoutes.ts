import type { RouteConf } from "@next-core/types";
import {
  isOfficialComponent,
  type ComponentChild,
  type ComponentReference,
  type ParsedModule,
} from "@next-shared/tsx-parser";
import type { ConvertedModule, ConvertingPart } from "./convertModule.js";
import type { ConvertOptions, ConvertState } from "../interfaces.js";
import convertModule from "./convertModule.js";

export async function convertRoutes(
  children: ComponentChild[] | undefined,
  state: ConvertState,
  currentModule: ParsedModule,
  options: ConvertOptions
): Promise<RouteConf[]> {
  const routes = await Promise.all(
    children?.map(async (child) => {
      if (!isOfficialComponent(child, "Route")) {
        throw new Error(`All children of <Routes> must be <Route>.`);
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

      const { reference, name: componentName } = component as ComponentChild & {
        reference: ComponentReference;
      };
      // let page: ConvertedPart | null | undefined;
      let convertingPage: ConvertingPart | null | undefined;

      const importSource =
        reference.type === "local"
          ? currentModule.filePath
          : reference.importSource!;

      let mod: ConvertedModule | null = null;
      if (state.convertedModules.has(importSource)) {
        mod = state.convertedModules.get(importSource)!;
      } else {
        const importedModule = state.app.modules.get(importSource);
        if (importedModule) {
          mod = convertModule(importedModule, state, options);
        }
        state.convertedModules.set(importSource, mod);
      }
      if (!mod) {
        throw new Error(
          `Cannot find the module "${reference.importSource}" imported by the route "${path}".`
        );
      }

      if (reference.type === "local") {
        const parts = [...mod.internals, ...mod.namedExports.values()];
        convertingPage = parts.find(
          ({ raw }) =>
            raw.type !== "function" &&
            raw.type !== "context" &&
            raw.component.id &&
            raw.component.id.name === reference.name
        );
      } else {
        convertingPage = reference.name
          ? mod.namedExports.get(reference.name)
          : mod.defaultExport;
      }

      const page = await convertingPage?.promise;

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
        alias: componentName,
        incrementalSubRoutes: true,
        bricks: page.bricks,
        context: page.context,
      };
    }) ?? []
  );

  // The more specific routes should come first
  routes.sort((a, b) => b.path.length - a.path.length);

  return routes;
}
