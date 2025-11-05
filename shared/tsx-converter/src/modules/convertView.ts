import type {
  BrickConfInTemplate,
  CustomTemplate,
  StoryboardFunction,
} from "@next-core/types";
import type { ParsedApp } from "@next-shared/tsx-parser";
import convertModule, {
  type ConvertedModule,
  type ConvertedPartOfComponent,
} from "./convertModule.js";
import type {
  ConvertState,
  ConvertOptions,
  ConvertResult,
} from "../interfaces.js";
import { getHelperFunctions } from "../helpers/index.js";
import { getViewTplName } from "./getTplName.js";
import { withBox } from "../withBox.js";

export async function convertView(
  view: ParsedApp,
  options: ConvertOptions
): Promise<ConvertResult> {
  const { entry } = view;
  if (!entry) {
    throw new Error("No entry module found in the view.");
  }

  let convertedEntry: ConvertedModule | undefined;
  const state: ConvertState = {
    usedHelpers: new Set(),
    app: view,
    convertedModules: new Map(),
  };

  const functions: StoryboardFunction[] = [];
  const templates: CustomTemplate[] = [];

  await Promise.all(
    Array.from(view.modules.values()).map(async (mod) => {
      if (mod) {
        const converted = await convertModule(mod, state, options);
        if (mod === entry) {
          convertedEntry = converted;
        }
        for (const part of [
          ...converted.internals,
          ...converted.namedExports.values(),
          converted.defaultExport,
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
                name: getViewTplName(part.name!, options.rootId),
                bricks: part.bricks as BrickConfInTemplate[],
                state: part.context,
              });
              break;
            }
          }
        }
      }
    })
  );

  if (!convertedEntry?.defaultExport) {
    throw new Error("No view found in the entry module.");
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

  const { title, bricks, context } = (await convertedEntry.defaultExport
    .promise) as ConvertedPartOfComponent;

  const needBox = () =>
    bricks.every((brick) =>
      ["eo-form", "eo-descriptions", "eo-button"].includes(brick.brick)
    );

  return {
    title,
    brick: options.withoutWrapper
      ? bricks
      : {
          brick: "eo-content-layout",
          children: needBox() ? [withBox(bricks, options)] : bricks,
        },
    context: [
      ...context,
      ...(options.withContexts
        ? Object.entries(options.withContexts).map(([name, value]) => ({
            name,
            value,
          }))
        : []),
    ],
    functions: [...functions, ...helpers],
    templates,
  };
}
