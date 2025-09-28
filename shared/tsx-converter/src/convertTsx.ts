import type { ContextConf, StoryboardFunction } from "@next-core/types";
import type { ParseResult } from "@next-shared/tsx-parser";
import { withBox } from "./withBox.js";
import { convertDataSources } from "./convertDataSources.js";
import { convertVariables } from "./convertVariables.js";
import { convertComponent } from "./convertComponent.js";
import type { ConvertOptions, ConvertResult } from "./interfaces.js";
import { convertTemplates } from "./convertTemplates.js";
import { getViewTitle } from "./getViewTitle.js";
import { getHelperFunctions } from "./helpers/index.js";

export async function convertTsx(
  result: ParseResult,
  options: ConvertOptions
): Promise<ConvertResult> {
  const clonedResult: ParseResult = {
    ...result,
    usedHelpers: new Set(result.usedHelpers),
  };

  const context: ContextConf[] = [
    ...convertDataSources(clonedResult.dataSources ?? []),
    ...convertVariables(clonedResult.variables ?? []),
    ...(options.withContexts
      ? Object.entries(options.withContexts).map(([name, value]) => ({
          name,
          value,
        }))
      : []),
  ];

  if (
    clonedResult.components.length !== 1 ||
    clonedResult.components[0].name !== "View"
  ) {
    throw new Error("Only single root component <View> is supported");
  }

  const view = clonedResult.components[0];

  const children = (
    await Promise.all(
      (view.children ?? []).map((component) =>
        convertComponent(component, clonedResult, options, "view")
      )
    )
  ).flat();

  const needBox = clonedResult.components.every((component) =>
    ["Form", "Descriptions", "Button"].includes(component.name)
  );

  const templates = await convertTemplates(
    clonedResult.templates,
    clonedResult,
    options
  );

  const helpers = Array.from(clonedResult.usedHelpers).map<StoryboardFunction>(
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
    title: getViewTitle(clonedResult),
    brick: {
      brick: "eo-content-layout",
      children: needBox ? [withBox(children, options)] : children,
    },
    context,
    functions: [...clonedResult.functions, ...helpers],
    templates,
  };
}
