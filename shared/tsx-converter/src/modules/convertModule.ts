import type { BrickConf, ContextConf } from "@next-core/types";
import {
  isOfficialComponent,
  type ComponentChild,
  type ModulePart,
  type ModulePartOfFunction,
  type ParsedModule,
} from "@next-shared/tsx-parser";
import { convertDataSource } from "./convertDataSource.js";
import { convertComponent } from "../convertComponent.js";
import type { ConvertState, ConvertOptions } from "../interfaces.js";

export interface ConvertedModule {
  sourceModule: ParsedModule;
  defaultExport: ConvertedPart | null;
  namedExports: Map<string, ConvertedPart>;
  internals: ConvertedPart[];
}

export type ConvertedPart = ConvertedPartOfComponent | ModulePartOfFunction;

export interface ConvertedPartOfComponent {
  type: "page" | "view" | "template";
  bricks: BrickConf[];
  context: ContextConf[];
  name?: string;
  title?: string;
}

export default async function convertModule(
  mod: ParsedModule,
  state: ConvertState,
  options: ConvertOptions
): Promise<ConvertedModule> {
  if (mod.usedHelpers.size > 0) {
    for (const helper of mod.usedHelpers) {
      state.usedHelpers.add(helper);
    }
  }

  const [defaultExport, namedExports, internals] = await Promise.all([
    mod.defaultExport
      ? parseModulePart(mod.defaultExport, mod, state, options)
      : null,
    Promise.all(
      Array.from(mod.namedExports.entries()).map(
        async ([name, part]) =>
          [name, await parseModulePart(part, mod, state, options)] as [
            string,
            ConvertedPart,
          ]
      )
    ).then((entries) => new Map(entries)),
    Promise.all(
      mod.internals.map((part) => parseModulePart(part, mod, state, options))
    ),
  ]);

  return {
    sourceModule: mod,
    defaultExport,
    namedExports,
    internals,
  };
}

async function parseModulePart(
  part: ModulePart,
  mod: ParsedModule,
  state: ConvertState,
  options: ConvertOptions
): Promise<ConvertedPart> {
  if (part.type === "function") {
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
          children.map((child) =>
            convertComponent(child, mod, state, options, part.type)
          )
        )
      ).flat()
    : [];

  return {
    type: part.type,
    bricks,
    context,
    name: component.id?.name,
    title: part.title,
  };
}
