import type {
  BrickConfInTemplate,
  CustomTemplate,
  StoryboardFunction,
} from "@next-core/types";
import type { ParsedApp } from "@next-shared/tsx-parser";
import convertModule, {
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

  const state: ConvertState = {
    usedHelpers: new Set(),
    app: view,
  };
  const convertedEntry = await convertModule(entry, state, options);

  const { defaultExport, internals, namedExports } = convertedEntry;

  if (!defaultExport) {
    throw new Error("No view found in the entry module.");
  }

  const functions: StoryboardFunction[] = [];
  const templates: CustomTemplate[] = [];

  for (const part of [...internals, ...namedExports.values()]) {
    if (part.type === "function") {
      functions.push(part.function);
    } else if (part.type === "template") {
      templates.push({
        name: getViewTplName(part.name!, options.rootId),
        bricks: part.bricks as BrickConfInTemplate[],
        state: part.context,
      });
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

  const { title, bricks, context } = defaultExport as ConvertedPartOfComponent;

  const needBox = bricks.every((brick) =>
    ["eo-form", "eo-descriptions", "eo-button"].includes(brick.brick)
  );

  return {
    title,
    brick: {
      brick: "eo-content-layout",
      children: needBox ? [withBox(bricks, options)] : bricks,
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
