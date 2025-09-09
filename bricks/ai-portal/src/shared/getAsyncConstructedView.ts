import { parseTsx } from "@next-shared/tsx-parser";
import type { GeneratedView } from "./interfaces";

export async function getAsyncConstructedView(
  generatedView: GeneratedView,
  workspace: string | undefined
) {
  try {
    const result = parseTsx(generatedView.code, {
      workspace,
      withContexts: generatedView.withContexts
        ? Object.keys(generatedView.withContexts)
        : undefined,
    });
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse generated view:", error);
    return null;
  }
}
