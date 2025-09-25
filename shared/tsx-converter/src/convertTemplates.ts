import type { ParseResult, Template } from "@next-shared/tsx-parser";
import type { ConvertOptions } from "./interfaces.js";
import type { CustomTemplate } from "@next-core/types";
import { convertComponent } from "./convertComponent.js";
import { convertDataSources } from "./convertDataSources.js";
import { convertVariables } from "./convertVariables.js";

let counter = 0;
const tplNameMap = new Map<string, string>();

export function getTplNamePrefixByRootId(rootId: string) {
  if (!tplNameMap.has(rootId)) {
    tplNameMap.set(rootId, `isolated-tpl-${counter++}`);
  }
  return tplNameMap.get(rootId)!;
}

export function getTplNameSuffix(name: string) {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export function convertTemplates(
  templates: Template[],
  result: ParseResult,
  options: ConvertOptions
): Promise<CustomTemplate[]> {
  const tplNamePrefix = getTplNamePrefixByRootId(options.rootId);
  return Promise.all(
    templates.map(async (tpl) => {
      const children = (
        await Promise.all(
          tpl.components.map((component) =>
            convertComponent(component, result, options)
          )
        )
      ).flat();
      return {
        name: `${tplNamePrefix}${getTplNameSuffix(tpl.name)}`,
        bricks: children,
        state: [
          ...convertDataSources(tpl.dataSources ?? []),
          ...convertVariables(tpl.variables ?? []),
        ],
      } as CustomTemplate;
    })
  );
}
