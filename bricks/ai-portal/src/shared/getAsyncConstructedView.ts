import { getRemoteTsxParserWorker } from "./workers/tsxParser.js";
import type { GeneratedView } from "./interfaces.js";

export async function getAsyncConstructedView(
  generatedView: GeneratedView,
  workspace: string | undefined
) {
  try {
    const worker = await getRemoteTsxParserWorker();
    const result = await worker.parse(generatedView.code, {
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
