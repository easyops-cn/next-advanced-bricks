import type {
  BrickConf,
  ContextConf,
  CustomTemplateProxy,
} from "@next-core/types";
import {
  isOfficialComponent,
  type ComponentChild,
  type ModulePart,
  type ModulePartOfContext,
  type ModulePartOfFunction,
  type ParsedModule,
} from "@next-shared/tsx-parser";
import { convertDataSource } from "./convertDataSource.js";
import { convertComponent } from "../convertComponent.js";
import type { ConvertState, ConvertOptions } from "../interfaces.js";

export interface ConvertedModule {
  sourceModule: ParsedModule;
  defaultExport: ConvertingPart | null;
  namedExports: Map<string, ConvertingPart>;
  internals: ConvertingPart[];
}

export interface ConvertingPart {
  raw: ModulePart;
  promise: Promise<ConvertedPart>;
}

export type ConvertedPart =
  | ConvertedPartOfComponent
  | ModulePartOfFunction
  | ModulePartOfContext;

export interface ConvertedPartOfComponent {
  type: "page" | "view" | "template";
  bricks: BrickConf[];
  context: ContextConf[];
  proxy?: CustomTemplateProxy;
  name?: string;
  title?: string;
}

export default function convertModule(
  mod: ParsedModule,
  state: ConvertState,
  options: ConvertOptions
): ConvertedModule {
  if (mod.usedHelpers.size > 0) {
    for (const helper of mod.usedHelpers) {
      state.usedHelpers.add(helper);
    }
  }

  return {
    sourceModule: mod,
    defaultExport: mod.defaultExport
      ? {
          raw: mod.defaultExport,
          promise: parseModulePart(mod.defaultExport, mod, state, options),
        }
      : null,
    namedExports: new Map(
      [...mod.namedExports].map(([name, part]) => [
        name,
        {
          raw: part,
          promise: parseModulePart(part, mod, state, options),
        },
      ])
    ),
    internals: mod.internals.map((part) => ({
      raw: part,
      promise: parseModulePart(part, mod, state, options),
    })),
  };
}

async function parseModulePart(
  part: ModulePart,
  mod: ParsedModule,
  state: ConvertState,
  options: ConvertOptions
): Promise<ConvertedPart> {
  if (part.type === "function" || part.type === "context") {
    return part;
  }

  const context: ContextConf[] = [];

  const { component } = part;

  for (const binding of component.bindingMap.values()) {
    if (binding.kind === "resource") {
      context.push(convertDataSource(binding.resource!));
    } else if (
      binding.kind === "state" ||
      binding.kind === "constant" ||
      binding.kind === "param"
    ) {
      context.push({
        name: binding.id.name,
        value: binding.initialValue,
        expose: binding.kind === "param",
        track: true,
      });
    }
  }

  let children: ComponentChild[] | undefined;
  if (part.type === "view") {
    const view = component.children?.find((child) =>
      isOfficialComponent(child, "View")
    );
    if (view) {
      children = view.children;
    }
  } else {
    children = component.children;
  }

  const bricks = children?.length
    ? (
        await Promise.all(
          children.map(
            (child) =>
              convertComponent(
                child,
                mod,
                state,
                options,
                part.type
              ) as Promise<BrickConf | BrickConf[]>
          )
        )
      ).flat()
    : [];

  return {
    type: part.type,
    bricks,
    context,
    name: component.id?.name,
    proxy: component.proxy,
    title: part.title,
  };
}
